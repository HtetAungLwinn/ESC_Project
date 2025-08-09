import React from 'react';
import { render, screen } from '@testing-library/react';
import BookingDetailsPage from '../BookingDetailsPage';
import bookingDetails from '../../backend/tests/mockData/bookingDetails.json';
import '@testing-library/jest-dom';

beforeEach(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    if (key === 'uid') return 'user_A1';
    return null;
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

test('displays loading message', async () => {
  global.fetch = jest.fn(() => new Promise(() => {})); // never resolves

  render(<BookingDetailsPage />);

  const loadingText = await screen.findByText(/Loading bookings\.\.\./i);
  expect(loadingText).toBeInTheDocument();
});

test('displays hotel name after successful fetch', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(bookingDetails),
    })
  );

  render(<BookingDetailsPage />);

  const hotel_addr = await screen.findByText(/12 Orchard Rd, Singapore/i);
  expect(hotel_addr).toBeInTheDocument();
});

test('displays price after successful fetch', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(bookingDetails),
    })
  );

  render(<BookingDetailsPage />);

  const price = await screen.findByText(/720/i);
  expect(price).toBeInTheDocument();
});

test('displays address after successful fetch', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(bookingDetails),
    })
  );

  render(<BookingDetailsPage />);

  const hotelName = await screen.findByText(/Marina Bay Family Hotel/i);
  expect(hotelName).toBeInTheDocument();
});

test('shows "No bookings found..." if fetch returns empty array', async () => {
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  );

  render(<BookingDetailsPage />);

  const noBookings = await screen.findByText(/No bookings found\.\.\./i);
  expect(noBookings).toBeInTheDocument();
});

test('displays checkin and checkout date after successful fetch', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(bookingDetails),
    })
  );

  render(<BookingDetailsPage />);

  const checkinDate = await screen.findByText(/2025-08-10/i);
  const checkoutDate = await screen.findByText(/2025-08-13/i);

  expect(checkinDate).toBeInTheDocument();
  expect(checkoutDate).toBeInTheDocument();
});

test('displays number of adults and children after successful fetch', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(bookingDetails),
    })
  );

  render(<BookingDetailsPage />);

  const adults = await screen.findByText(/3/i);
  const children = await screen.findByText(/1/i);

  expect(adults).toBeInTheDocument();
  expect(children).toBeInTheDocument();
});

test('displays message to hotel after successful fetch', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(bookingDetails),
    })
  );

  render(<BookingDetailsPage />);

  const message = await screen.findByText(/Please provide baby cot/i);
  expect(message).toBeInTheDocument();
});

test('shows error message after fetch fails', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('API failed')));

  render(<BookingDetailsPage />);

  const errorMessage = await screen.findByText(/Error loading bookings\.\.\./i);
  expect(errorMessage).toBeInTheDocument();
});

test('shows "No bookings found..." if backend returns null object', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(null),
    })
  );

  render(<BookingDetailsPage />);

  const noBookingsMessage = await screen.findByText(/No bookings found\.\.\./i);
  expect(noBookingsMessage).toBeInTheDocument();
});
