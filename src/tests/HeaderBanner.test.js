/* @jest-environment jsdom */
// src/tests/HeaderBanner.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeaderBanner from '../component/HeaderBanner';

// Mock lucide-react so icons render as simple elements in Jest
jest.mock('lucide-react', () => ({
  Plane: (props) => <i data-testid="icon-plane" className="lucide lucide-plane" {...props} />,
  Moon:  (props) => <i data-testid="icon-moon"  className="lucide lucide-moon"  {...props} />,
  Sun:   (props) => <i data-testid="icon-sun"   className="lucide lucide-sun"   {...props} />,
}));

describe('HeaderBanner', () => {
  test('[TOGGLE] clicking dark mode calls setDarkMode with a function that flips the state', () => {
    const setDarkMode = jest.fn();

    render(
      <MemoryRouter>
        <HeaderBanner
          loggedIn={false}
          setLoggedIn={jest.fn()}
          darkMode={false}
          setDarkMode={setDarkMode}
        />
      </MemoryRouter>
    );

    const toggleBtn = screen.getByRole('button', { name: /toggle dark mode/i });
    fireEvent.click(toggleBtn);

    expect(setDarkMode).toHaveBeenCalledTimes(1);
    const updater = setDarkMode.mock.calls[0][0];
    expect(typeof updater).toBe('function');
    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
  });

  test('[ICON] shows Moon when darkMode=false and Sun when darkMode=true', () => {
    const { rerender } = render(
      <MemoryRouter>
        <HeaderBanner
          loggedIn={false}
          setLoggedIn={jest.fn()}
          darkMode={false}
          setDarkMode={jest.fn()}
        />
      </MemoryRouter>
    );

    let btn = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(btn.querySelector('.lucide-moon')).toBeTruthy();
    expect(btn.querySelector('.lucide-sun')).toBeFalsy();

    rerender(
      <MemoryRouter>
        <HeaderBanner
          loggedIn={false}
          setLoggedIn={jest.fn()}
          darkMode={true}
          setDarkMode={jest.fn()}
        />
      </MemoryRouter>
    );

    btn = screen.getByRole('button', { name: /toggle dark mode/i });
    expect(btn.querySelector('.lucide-sun')).toBeTruthy();
    expect(btn.querySelector('.lucide-moon')).toBeFalsy();
  });

  test('[LOGGED OUT] shows Login and Sign Up links with correct hrefs', () => {
    render(
      <MemoryRouter>
        <HeaderBanner
          loggedIn={false}
          setLoggedIn={jest.fn()}
          darkMode={false}
          setDarkMode={jest.fn()}
        />
      </MemoryRouter>
    );

    const login = screen.getByRole('link', { name: /login/i });
    const signup = screen.getByRole('link', { name: /sign up/i });

    expect(login).toBeInTheDocument();
    expect(signup).toBeInTheDocument();
    expect(login.getAttribute('href')).toBe('/login');
    expect(signup.getAttribute('href')).toBe('/signup');
  });

  test('[LOGGED IN] shows Booking Details and Log Out links with correct hrefs', () => {
    render(
      <MemoryRouter>
        <HeaderBanner
          loggedIn={true}
          setLoggedIn={jest.fn()}
          darkMode={false}
          setDarkMode={jest.fn()}
        />
      </MemoryRouter>
    );

    const booking = screen.getByRole('link', { name: /booking details/i });
    const logout  = screen.getByRole('link', { name: /log out/i });

    expect(booking).toBeInTheDocument();
    expect(logout).toBeInTheDocument();
    expect(booking.getAttribute('href')).toBe('/booking');
    expect(logout.getAttribute('href')).toBe('/');
  });

  test('[LOGOUT] clicking Log Out calls setLoggedIn(false)', () => {
    const setLoggedIn = jest.fn();

    render(
      <MemoryRouter>
        <HeaderBanner
          loggedIn={true}
          setLoggedIn={setLoggedIn}
          darkMode={false}
          setDarkMode={jest.fn()}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('link', { name: /log out/i }));
    expect(setLoggedIn).toHaveBeenCalledWith(false);
    
  });

  test('[TITLE LINK] clicking OCBC Travel logo navigates to home ("/")', () => {
    render(
      <MemoryRouter>
        <HeaderBanner loggedIn={false} setLoggedIn={() => {}} darkMode={false} setDarkMode={() => {}} />
      </MemoryRouter>
    );

    const homeLink = screen.getByRole('link', { name: /OCBC Travel/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

});
