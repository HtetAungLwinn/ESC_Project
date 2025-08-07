import React from 'react';
import { render, screen } from '@testing-library/react';
import BookingDetailsPage from './BookingDetailsPage';
import bookingDetails from '../backend/tests/mockData/bookingDetails.json';
import '@testing-library/jest-dom';


beforeEach(() => {
  // Fix 1: Mock correct key
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

test('displays bookings after successful fetch', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(bookingDetails),
    })
  );

  render(<BookingDetailsPage />);

  const hotelName = await screen.findByText(/Marina Bay Family Hotel/i);
  const address = await screen.findByText(/12 Orchard Rd, Singapore/i);

  expect(hotelName).toBeInTheDocument();
  expect(address).toBeInTheDocument();
});

test('shows "No bookings found..." if fetch returns empty array', async () => {
  global.fetch = jest.fn(() => 
    Promise.resolve({
      json: () => Promise.resolve([]),
    })
  );

  render(<BookingDetailsPage />);

  const noBookings = await screen.findByText(/No bookings found\.\.\./i);
  expect(noBookings).toBeInTheDocument();
});

test('shows error message after fetch fails', async () => {
  global.fetch = jest.fn(() => Promise.reject(new Error('API failed')));

  render(<BookingDetailsPage />);

  const errorMessage = await screen.findByText(/Error loading bookings\.\.\./i);
  expect(errorMessage).toBeInTheDocument();
});
