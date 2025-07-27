// src/searchTestCase.test.js


jest.mock(
  'react-router-dom',
  () => ({
    MemoryRouter: ({ children }) => <>{children}</>,
    useNavigate: () => jest.fn(),
    useLocation: () => ({ search: '' }),
  }),
  { virtual: true }
);


jest.mock('./component/ReactDatePicker', () => ({ startDate, endDate, onChange }) => (
  <div
    data-testid="date-range-picker"
    onClick={() =>
      onChange({
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-05'),
      })
    }
  >
    {startDate && endDate
      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      : 'No dates selected'}
  </div>
));

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SearchBanner from './component/SearchBanner';

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
  // Wrap initial render in act() so useEffect(fetch) → setState is covered
  await act(async () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>
    );
  });

  // Wrap the change event in act() too
  const input = screen.getByPlaceholderText('Where are you going?');
  await act(async () => {
    fireEvent.change(input, { target: { value: 'sin' } });
  });

  // Now the dropdown suggestion should appear
  expect(await screen.findByText('Singapore')).toBeInTheDocument();
});

test('renders the date range picker and responds to click', () => {
  render(
    <MemoryRouter>
      <SearchBanner />
    </MemoryRouter>
  );

  const picker = screen.getByTestId('date-range-picker');
  expect(picker).toBeInTheDocument();

  fireEvent.click(picker);
  expect(picker).toHaveTextContent('8/1/2025 - 8/5/2025');
});

test('opens rooms & guests dropdown and increments rooms and adults', async () => {
  render(
    <MemoryRouter>
      <SearchBanner />
    </MemoryRouter>
  );

  // Open the dropdown
  fireEvent.click(screen.getByRole('button', { name: /Room.*Guest/i }));

  // Increment Rooms
  const roomsRow = screen.getByText('Rooms').closest('div');
  fireEvent.click(within(roomsRow).getByText('+'));
  expect(within(roomsRow).getByText('2')).toBeInTheDocument();

  // Increment Adults
  const adultsRow = screen.getByText('Adults').closest('div');
  fireEvent.click(within(adultsRow).getByText('+'));
  expect(within(adultsRow).getByText('2')).toBeInTheDocument();
});
