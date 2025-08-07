// tests/SearchBanner.test.js
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ search: '' }),
  Link: ({ children }) => children,
}));


import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import SearchBanner from '../component/SearchBanner';
import { MemoryRouter } from 'react-router-dom';

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/destinations/all')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(['A','B','C']) });
    }
    return Promise.resolve({ json: () => Promise.resolve({ uid: 'uid' }) });
  });
});

describe('SearchBanner bulk tests', () => {
  afterEach(() => jest.clearAllMocks());

  const searchCases = Array.from({ length: 100 }).map((_, i) => ({
    desc: `search case ${i + 1}`,
    destination: `Dest${i}`,
  }));

  searchCases.forEach(({ desc, destination }) => {
    test(desc, async () => {
      render(
        <MemoryRouter>
          <SearchBanner />
        </MemoryRouter>
      );
      // Destination suggestion
      fireEvent.change(screen.getByPlaceholderText(/Where are you going\?/i), {
        target: { value: destination },
      });
      await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/destinations/all'));
    });
  });
});
