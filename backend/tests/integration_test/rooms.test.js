import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
const fetch = require('node-fetch');
global.fetch = fetch;

const express = require('express');
const supertest = require('supertest');
const React = require('react');
const { render, screen, waitFor } = require('@testing-library/react');
require('@testing-library/jest-dom');
const path = require('path');

// Inject environment variable to override external API base URL in handlers
process.env.EXTERNAL_API_BASE_URL = 'http://localhost:4001/api/hotels';

const { getRoomsByHotelId, getBulkRoomPrices } = require('../../models/rooms');
const HotelDetailsPage = require('../../../src/HotelDetailsPage').default || require('../../../src/HotelDetailsPage');
const hotelDetails = require(path.resolve(__dirname, '../mockData/hotelDetails.json'));
const roomDetails = require(path.resolve(__dirname, '../mockData/roomDetails.json'));

// --- Step 1: Setup mock external API server ---
const mockExternalApi = express();
mockExternalApi.use(express.json());
mockExternalApi.get('/api/hotels/:id', (req, res) => {
  const hotelData = { ...hotelDetails, id: req.params.id };
  res.json(hotelData);
});
mockExternalApi.get('/api/hotels/:id/price', (req, res) => {
  const roomData = { ...roomDetails, id: req.params.id };
  res.json(roomData);
});

// --- Step 2: Setup backend test server ---
const backendApp = express();
backendApp.use(express.json());
backendApp.get('/api/rooms/:id', async (req, res) => {
  try {
    await getRoomsByHotelId(req, res);
  } catch (err) {
    console.error('Error in /api/rooms/:id:', err);
    res.status(500).json({ error: err.message });
  }
});
backendApp.get('/api/rooms/:id/price', async (req, res) => {
  try {
    await getBulkRoomPrices(req, res);
  } catch (err) {
    console.error('Error in /api/rooms/:id/price:', err);
    res.status(500).json({ error: err.message });
  }
});

let mockExternalServer, backendServer, backendRequest;

beforeAll(done => {
  mockExternalServer = mockExternalApi.listen(4001, () => {
    backendServer = backendApp.listen(4000, () => {
      backendRequest = supertest.agent(backendServer);
      done();
    });
  });
});

afterAll(done => {
  backendServer.close(() => {
    mockExternalServer.close(done);
  });
});

// --- Backend Integration Tests ---
describe('Backend Integration', () => {
  test('GET /api/rooms/:id returns hotel rooms from mock JSON', async () => {
    const res = await backendRequest.get('/api/rooms/hotel123');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe(hotelDetails.name);
    expect(res.body.latitude).toBe(hotelDetails.latitude);
    expect(res.body.longitude).toBe(hotelDetails.longitude);
    expect(res.body.address).toBe(hotelDetails.address);
    expect(res.body.amenities).toStrictEqual(hotelDetails.amenities);
    expect(res.body.image_details.count).toBe(hotelDetails.image_details.count);
  });

  test('GET /api/rooms/:id/price returns room prices from mock JSON', async () => {
    const res = await backendRequest.get('/api/rooms/hotel123/price').query({
      destination_id: 'dest1',
      checkin: '2025-08-01',
      checkout: '2025-08-05',
      guests: 2,
    });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.rooms).toStrictEqual(roomDetails.rooms);
    expect(res.body.rooms[0].key).toBe('d898dc2d-8e07-548a-b5bd-979bd5766d9a');
    expect(res.body.rooms[0].roomNormalizedDescription).toBe('Superior Double Or Twin Room 1 King Bed');
    expect(res.body.rooms[0].converted_price).toBe(2898.44);
  });
});

// --- Frontend Integration Test ---
describe('Frontend Integration', () => {
  beforeEach(() => {
    global.fetch = jest.fn((url, opts) => {
      const fullUrl = url.startsWith('http') ? url : `http://localhost:4000${url}`;
      return fetch(fullUrl, opts);
    });
  });

  test('Hotel details fetches and renders data from backend', async () => {
    render(
    <MemoryRouter initialEntries={['/?id=hotel123&destination_id=dest1&checkin=2025-08-01&checkout=2025-08-05&totalGuests=2']}>
      <HotelDetailsPage />
    </MemoryRouter>
    );
    await waitFor(() => {
      // Hotel details
      expect(screen.getByRole('heading', { level: 1, name: /Park Avenue Rochester/i })).toBeInTheDocument(); // Hotel name
      expect(screen.getByText(/31 Rochester Drive/i)).toBeInTheDocument(); // Hotel address
      expect(screen.getByText(/4.0/i)).toBeInTheDocument(); // Hotel rating
      expect(screen.getByText((content, element) => content.includes("With a stay at Park Avenue Rochester in Singapore (Queenstown)") && content.includes("5-minute drive from Singapore Botanic Gardens and 8 minutes from Orchard Road") && content.includes("5.9 mi (9.5 km) from Marina Bay Sands Skypark") && content.includes("6 mi (9.6 km) from Marina Bay Sands Casino"))).toBeInTheDocument(); // Hotel description
      expect(screen.getByText(/inHouseBar/i)).toBeInTheDocument(); // Hotel amenities
      expect(screen.getByRole('heading', { level: 2, name: /location/i })).toBeInTheDocument(); // Location
      expect(screen.getByRole('region', { name: /hotel location/i })).toBeInTheDocument(); // Location
    });
  });

  test('Rooms details fetches and renders data from backend', async () => {
    render(
    <MemoryRouter initialEntries={['/?id=hotel123&destination_id=dest1&checkin=2025-08-01&checkout=2025-08-05&totalGuests=2']}>
      <HotelDetailsPage />
    </MemoryRouter>
    );
    await waitFor(() => {
      // Room details
      expect(screen.getByText(/Superior Double Or Twin Room 1 King Bed/i)).toBeInTheDocument(); // roomNormalizedDescription
      const freeCancellationElements = screen.getAllByText(/Free cancellation/i); // Cancellation 
      expect(freeCancellationElements[0]).toBeInTheDocument();
      const breakfastElements = screen.getAllByText(/Room Only/i); // Beakfast 
      expect(breakfastElements[0]).toBeInTheDocument();
      const priceElements = screen.getAllByText(/2898/i); // Converted price 
      expect(priceElements[0]).toBeInTheDocument();
      expect(screen.getByText(/More Rooms/i)).toBeInTheDocument(); // Rooms > 2 
    });
  });

  test('Room popup card appears on roomNormalizedDescription click', async () => {
    render(
      <MemoryRouter initialEntries={['/?id=hotel123&destination_id=dest1&checkin=2025-08-01&checkout=2025-08-05&totalGuests=2']}>
        <HotelDetailsPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      const roomNormalizedDescription = screen.getAllByText(/Superior Double Or Twin Room 1 King Bed/i);
      expect(roomNormalizedDescription.length).toBeGreaterThan(0);
      userEvent.click(roomNormalizedDescription[0]);

      const roomNormalizedDescriptionElements = screen.getAllByText(/Superior Double Or Twin Room 1 King Bed/i); // roomNormalizedDescription
      expect(roomNormalizedDescriptionElements[1]).toBeInTheDocument();
      expect(screen.getByText(/Market Rates/i)).toBeInTheDocument(); // market rates
      expect(screen.getByText(/Supplier: expedia/i)).toBeInTheDocument(); // market rates
      expect(screen.getByText(/Rate: SGD 2509/i)).toBeInTheDocument(); // market rates
      expect(screen.getByText(/Description/i)).toBeInTheDocument(); // long_description
      expect(screen.getByText(/1 King Bed OR 2 Twin Beds/i)).toBeInTheDocument(); // long_description
      expect(screen.getByText(/204 sq feet/i)).toBeInTheDocument(); // long_description
      const amenitiesElements = screen.getAllByText(/Amenities/i); // amenities
      expect(amenitiesElements[1]).toBeInTheDocument();
      expect(screen.getByText(/Bathtub only/i)).toBeInTheDocument(); // amenities
    });
  });
});