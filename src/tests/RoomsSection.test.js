// 1. Define your mock before you mock the module
const mockNavigate = jest.fn();
const mockLocation = {
  pathname: '/rooms',
  search: '',
  hash: '',
  state: null,
  key: 'default',
};

// 2. Mock react-router-dom so that useNavigate() returns your mock
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
// at the top of src/tests/RoomsSection.test.js
import RoomsSection from '../RoomsSection'; 


const baseProps = {
  roomsLoading: false,
  roomsError: false,
  roomList: [],
  checkinParam: '2025-08-06',
  checkoutParam: '2025-08-08',
  destination_name: 'TestCity',
  destination: 'dest123',
  hotel: { name: 'HotelTest', address: '123 St' },
  id: 'hotel123',
  adultsParam: 2,
  childrenParam: 1,
};

test('renders loading, error, and empty states', () => {
  const { rerender } = render(<RoomsSection {...baseProps} roomsLoading={true} />);
  expect(screen.getByText(/Loading room info/i)).toBeInTheDocument();

  rerender(<RoomsSection {...baseProps} roomsLoading={false} roomsError={true} />);
  expect(screen.getByText(/Failed to load room info/i)).toBeInTheDocument();

  rerender(<RoomsSection {...baseProps} roomsError={false} roomList={[]} />);
  expect(screen.getByText(/No rooms available/i)).toBeInTheDocument();
});

test('renders a room card and navigates on Select click', () => {
  localStorage.setItem('uid', 'testuid'); // Simulate logged in
  const sample = {
    key: 'r1',
    roomNormalizedDescription: 'Suite',
    images: [{ high_resolution_url: 'img.jpg' }],
    roomAdditionalInfo: { breakfastInfo: 'Includes breakfast' },
    free_cancellation: true,
    converted_price: 200,
  };
  render(<RoomsSection {...baseProps} roomList={[sample]} />);

  expect(screen.getByText('☕ Breakfast Included')).toBeInTheDocument();
  expect(screen.getByText('Free cancellation')).toBeInTheDocument();
  expect(screen.getByText('SGD 200')).toBeInTheDocument();
  expect(screen.getByText('1 room • 2 nights')).toBeInTheDocument();

  fireEvent.click(screen.getByText(/Select/i));
  expect(mockNavigate).toHaveBeenCalledWith(
    expect.stringContaining('/payment-stripe?destination_name=TestCity')
  );
  localStorage.removeItem('uid'); // Clean up
});

test('toggles More Rooms button text', () => {
  const sample = {
    key: 'r3',
    roomNormalizedDescription: 'Family Suite',
    images: [{ high_resolution_url: 'foo.jpg' }],
    roomAdditionalInfo: {},
    free_cancellation: false,
    converted_price: 150,
  };
  render(
    <RoomsSection
      {...baseProps}
      roomList={[sample, sample, sample]} // length > 2
    />
  );

  // initial label
  const toggleBtn = screen.getByRole('button', { name: /More Rooms/i });
  expect(toggleBtn).toBeInTheDocument();

  // click it
  fireEvent.click(toggleBtn);

  // now the label should switch
  expect(
    screen.getByRole('button', { name: /Show Less/i })
  ).toBeInTheDocument();
});


test('opens and closes modal on title click and close', () => {
  const sample = {
    key: 'r2',
    roomNormalizedDescription: 'ModalRoom',
    images: [{ high_resolution_url: 'one.jpg' }, { high_resolution_url: 'two.jpg' }],
    roomAdditionalInfo: {},
    free_cancellation: false,
    converted_price: 100,
  };
  render(<RoomsSection {...baseProps} roomList={[sample]} />);

  fireEvent.click(screen.getByText('ModalRoom'));
  expect(screen.getByAltText('Room Image 1')).toBeInTheDocument();

  fireEvent.click(screen.getByText('×'));
  expect(screen.queryByAltText('Room Image 1')).not.toBeInTheDocument();
});