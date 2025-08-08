// src/tests/SearchBanner.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// --- Mock react-router-dom: keep real components, mock hooks we need ---
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ search: '' }),
  };
});

// --- Configurable dates for the datepicker mock (tests can set these) ---
let mockStartDateEmit = new Date('2025-08-10T00:00:00Z');
let mockEndDateEmit   = new Date('2025-08-12T00:00:00Z');

// --- Mock react-datepicker so we can emit specific dates from tests ---
jest.mock('react-datepicker', () => {
  return function MockedDatePicker(props) {
    const label =
      props.placeholderText || (props.selectsStart ? 'Check-in' : 'Check-out');
    const testId = props.selectsStart
      ? 'mock-start'
      : props.selectsEnd
      ? 'mock-end'
      : 'mock-date';

    return (
      <button
        data-testid={testId}
        disabled={props.disabled}
        onClick={() =>
          props.onChange(props.selectsStart ? mockStartDateEmit : mockEndDateEmit)
        }
      >
        {label}
      </button>
    );
  };
});

import SearchBanner from '../component/SearchBanner';

beforeEach(() => {
  jest.clearAllMocks();
  // realistic destinations that match "Si" with Fuse (minMatchCharLength: 2)
  global.fetch = jest.fn((url) => {
    if (url === '/api/destinations/all') {
      return Promise.resolve({
        ok: true,
        json: async () => ['Singapore', 'Sydney', 'Seoul'],
      });
    }
    if (url.startsWith('/api/destinations/uid?term=')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ uid: 'uid123' }),
      });
    }
    return Promise.resolve({ ok: true, json: async () => ({}) });
  });

  // reset mock emitted dates to defaults
  mockStartDateEmit = new Date('2025-08-10T00:00:00Z');
  mockEndDateEmit   = new Date('2025-08-12T00:00:00Z');
});

describe('SearchBanner meaningful tests', () => {
  test('[FETCH] loads all destinations on mount', async () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/destinations/all')
    );
  });

  test('[SUGGESTIONS] shows matching suggestions when typing', async () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith('/api/destinations/all')
    );

    const input = screen.getByPlaceholderText(/where are you going\?/i);
    fireEvent.change(input, { target: { value: 'Si' } }); // >= 2 chars

    const list = await screen.findByRole('list');
    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThan(0);

    fireEvent.mouseDown(items[0]); // avoid blur
    fireEvent.click(items[0]);
    expect(input).toHaveValue('Singapore');
  });

  test('[SEARCH] clicking search calls destination UID fetch', async () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/where are you going\?/i);
    fireEvent.change(input, { target: { value: 'Singapore' } });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/destinations/uid?term=Singapore'
      )
    );

    const calledUrl = mockNavigate.mock.calls[0][0];
    expect(calledUrl).toContain('/results?destination=Singapore');
    expect(calledUrl).toContain('&uid=uid123');
    expect(calledUrl).toContain('&nights=0&rooms=1&adults=1&children=0');
  });

  test('[VALIDATION] empty destination prevents search and navigation', async () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/api/destinations/uid')
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('[CALENDAR][ERROR] checkout is disabled until a start date is chosen', () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>
    );

    const endBtn = screen.getByTestId('mock-end');
    expect(endBtn).toBeDisabled();
  });

  test('[CALENDAR][SUCCESS] selecting start then end enables checkout and navigates on search', async () => {
    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('mock-start'));
    const endBtn = screen.getByTestId('mock-end');
    expect(endBtn).not.toBeDisabled();

    fireEvent.click(endBtn);

    fireEvent.change(screen.getByPlaceholderText(/where are you going\?/i), {
      target: { value: 'Singapore' },
    });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/destinations/uid?term=Singapore'
      )
    );
    expect(mockNavigate).toHaveBeenCalled();
  });

  // ---------- NEW TESTS FOR DATE ENFORCEMENT ----------

  test('[CALENDAR][CLAMP] start date before today is clamped to today+3 (min check-in)', async () => {
    // Compute what the component considers "minCheckinDate": today at 00:00 + 3 days
    const min = new Date();
    min.setHours(0, 0, 0, 0);
    min.setDate(min.getDate() + 3);
    const expectedCheckin = min.toLocaleDateString('en-CA'); // component uses en-CA

    // Emit a start date BEFORE today to try to break it
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    mockStartDateEmit = yesterday;

    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>
    );

    // pick the (invalid) start date; component should clamp it to min
    fireEvent.click(screen.getByTestId('mock-start'));

    // finish selection & search
    mockEndDateEmit = new Date(min.getTime() + 24 * 60 * 60 * 1000); // min+1 day
    fireEvent.click(screen.getByTestId('mock-end'));

    fireEvent.change(screen.getByPlaceholderText(/where are you going\?/i), {
      target: { value: 'Singapore' },
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalled()
    );

    const url = mockNavigate.mock.calls[0][0];
    // Check that the checkin query param equals min (today+3)
    expect(url).toContain(`&checkin=${expectedCheckin}`);
  });

  test('[CALENDAR][CLAMP] start date inside next 3 days is clamped to today+3 (min check-in)', async () => {
    // today+1 (still not allowed) -> should clamp to today+3
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const plus1 = new Date(today);
    plus1.setDate(plus1.getDate() + 1);

    const min = new Date(today);
    min.setDate(min.getDate() + 3);
    const expectedCheckin = min.toLocaleDateString('en-CA');

    mockStartDateEmit = plus1;

    render(
      <MemoryRouter>
        <SearchBanner />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('mock-start'));
    mockEndDateEmit = new Date(min.getTime() + 24 * 60 * 60 * 1000);
    fireEvent.click(screen.getByTestId('mock-end'));

    fireEvent.change(screen.getByPlaceholderText(/where are you going\?/i), {
      target: { value: 'Singapore' },
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalled());

    const url = mockNavigate.mock.calls[0][0];
    expect(url).toContain(`&checkin=${expectedCheckin}`);
  });
});
