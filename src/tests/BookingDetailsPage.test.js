jest.mock('../firebase', () => ({
  auth: { currentUser: { uid: 'user_A1' } }
}));

jest.mock('firebase/auth', () => ({
  EmailAuthProvider: { credential: jest.fn() },
  reauthenticateWithCredential: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

jest.mock('../DeleteAccount', () => ({
  handleDeleteAccount: jest.fn(() => jest.fn()) // returns a function for onClick
}));



import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import BookingDetailsPage from '../BookingDetailsPage';
import bookingDetails from '../../backend/tests/mockData/bookingDetails.json';
import '@testing-library/jest-dom';



// Mock localStorage.getItem
beforeEach(() => {
  jest.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((key) => {
    if (key === 'uid') return 'user_A1';
    return null;
  });

  // Mock window.confirm to always return true by default
  jest.spyOn(window, 'confirm').mockImplementation(() => true);

  // Mock window.alert to be a jest.fn()
  jest.spyOn(window, 'alert').mockImplementation(() => {});

  // Clear fetch mocks before each test
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
});

const mockBookings = [
  {
    bid: 1,
    hotel_name: 'Test Hotel',
    stay_info: {
      room_type: 'Suite',
      adults: 2,
      children: 0,
    },
    hotel_addr: '123 Test St',
    price: 200,
    start_date: '2025-08-10',
    end_date: '2025-08-12',
    message_to_hotel: 'No smoking room',
  },
  {
    bid: 2,
    hotel_name: 'Another Hotel',
    stay_info: {
      room_type: 'Standard',
      adults: 1,
      children: 1,
    },
    hotel_addr: '456 Another Ave',
    price: 150,
    start_date: '2025-09-01',
    end_date: '2025-09-03',
    message_to_hotel: 'Late check-in',
  },
];

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

test('renders bookings and deletes one on button click', async () => {
  // First fetch call returns bookings (GET)
  global.fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockBookings),
    })
  );

  // Second fetch call is for DELETE, returns success
  global.fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Booking deleted successfully' }),
    })
  );

  render(<BookingDetailsPage setLoggedIn={jest.fn()} />);

  // Wait for bookings to render
  expect(await screen.findByText('Test Hotel')).toBeInTheDocument();
  expect(screen.getByText('Another Hotel')).toBeInTheDocument();

  // Click delete button for first booking
  const deleteButtons = screen.getAllByText('Delete Booking');
  fireEvent.click(deleteButtons[0]);

  // Wait for alert confirmation
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Booking deleted successfully!');
  });

  // The first booking should be removed from the DOM
  expect(screen.queryByText('Test Hotel')).not.toBeInTheDocument();

  // The second booking should still be present
  expect(screen.getByText('Another Hotel')).toBeInTheDocument();
});

test('does not delete booking if user cancels confirm', async () => {
  // Mock confirm to return false (cancel)
  window.confirm.mockImplementationOnce(() => false);

  // Mock fetch GET call returns bookings
  global.fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockBookings),
    })
  );

  render(<BookingDetailsPage setLoggedIn={jest.fn()} />);

  expect(await screen.findByText('Test Hotel')).toBeInTheDocument();

  // Click delete button for first booking
  const deleteButtons = screen.getAllByText('Delete Booking');
  fireEvent.click(deleteButtons[0]);

  // Alert should NOT be called
  expect(window.alert).not.toHaveBeenCalled();

  // Booking should still be there
  expect(screen.getByText('Test Hotel')).toBeInTheDocument();
});

test('shows alert on delete failure', async () => {
  window.confirm.mockImplementationOnce(() => true);

  // Mock fetch GET call returns bookings
  global.fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockBookings),
    })
  );

  // Mock fetch DELETE call fails
  global.fetch.mockImplementationOnce(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to delete booking' }),
    })
  );

  render(<BookingDetailsPage setLoggedIn={jest.fn()} />);

  expect(await screen.findByText('Test Hotel')).toBeInTheDocument();

  // Click delete button for first booking
  const deleteButtons = screen.getAllByText('Delete Booking');
  fireEvent.click(deleteButtons[0]);

  // Wait for failure alert
  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Failed to delete booking');
  });

  // Booking should still be present
  expect(screen.getByText('Test Hotel')).toBeInTheDocument();
});