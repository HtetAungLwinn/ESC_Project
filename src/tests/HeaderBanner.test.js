// tests/HeaderBanner.test.js
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ search: '' }),
  Link: ({ children }) => children,
}));


import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import HeaderBanner from '../component/HeaderBanner';
import { MemoryRouter } from 'react-router-dom';

describe('HeaderBanner dark mode tests', () => {
  const cases = Array.from({ length: 100 }).map((_, i) => ({
    desc: `dark mode toggle case ${i + 1}`,
    initial: i % 2 === 0,
  }));

  cases.forEach(({ desc, initial }) => {
    test(desc, () => {
      const setDarkMode = jest.fn();
      render(
        <MemoryRouter>
          <HeaderBanner loggedIn={false} setLoggedIn={() => {}} darkMode={initial} setDarkMode={setDarkMode} />
        </MemoryRouter>
      );
      const btn = screen.getByRole('button', { name: /Toggle dark mode/i });
      fireEvent.click(btn);
      expect(setDarkMode).toHaveBeenCalled();
    });
  });
});
