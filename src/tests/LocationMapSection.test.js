import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1) mock HotelMap from the same path LocationMapSection uses
jest.mock('../component/HotelMap', () => () => <div data-testid="hotel-map" />);

// 2) now import the component under test
import LocationMapSection from '../LocationMapSection';

test('renders map section when coords provided', () => {
  const hotel = { latitude: 1.23, longitude: 4.56, name: 'TestHotel' };
  render(<LocationMapSection hotel={hotel} />);
  expect(screen.getByText('Location')).toBeInTheDocument();
  expect(screen.getByTestId('hotel-map')).toBeInTheDocument();
});

test('renders nothing when coords missing', () => {
  render(<LocationMapSection hotel={{}} />);
  expect(screen.queryByText('Location')).toBeNull();
});