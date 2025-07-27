// src/searchTestCase.js
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';


jest.mock('./ReactDatePicker', () => ({ startDate, endDate, onChange }) => (
  <div data-testid="date-range-picker">
    {startDate && endDate
      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      : 'No dates selected'}
  </div>
));

import SearchBanner from './SearchBanner';

beforeEach(() => {

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(['Singapore', 'Sydney', 'Seoul']),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

test('shows suggestions when typing destination', async () => {
  render(
    <MemoryRouter>
      <SearchBanner />
    </MemoryRouter>
  );

  const input = screen.getByPlaceholderText('Where are you going?');
  fireEvent.change(input, { target: { value: 'sin' } });

  // Wait for “Singapore” suggestion to appear
  const suggestion = await screen.findByText('Singapore');
  expect(suggestion).toBeInTheDocument();
});

test('renders the date range picker', () => {
  render(
    <MemoryRouter>
      <SearchBanner />
    </MemoryRouter>
  );

  expect(screen.getByTestId('date-range-picker')).toBeInTheDocument();
});

test('opens rooms & guests dropdown and increments rooms and adults', () => {
  render(
    <MemoryRouter>
      <SearchBanner />
    </MemoryRouter>
  );


  const toggle = screen.getByRole('button', { name: /Room 1, Guest 1/i });
  fireEvent.click(toggle);


  const roomsRow = screen.getByText('Rooms').closest('.rg-row');
  const roomsPlus = within(roomsRow).getByText('+');
  fireEvent.click(roomsPlus);
  expect(within(roomsRow).getByText('2')).toBeInTheDocument();

  const adultsRow = screen.getByText('Adults').closest('.rg-row');
  const adultsPlus = within(adultsRow).getByText('+');
  fireEvent.click(adultsPlus);
  expect(within(adultsRow).getByText('2')).toBeInTheDocument();
});
