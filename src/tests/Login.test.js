// tests/Login.test.js

// --- Mock firebase/auth ---
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

// --- Mock react-router-dom ---
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ search: '' }),
  Link: ({ children }) => children,
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { MemoryRouter } from 'react-router-dom';

describe('Login component bulk tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    // --- Mock fetch so login doesn't fail due to network ---
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  const loginCases = Array.from({ length: 100 }).map((_, i) => ({
    desc: `valid login case ${i + 1}`,
    mockResponse: { user: { uid: `uid${i}`, emailVerified: true } },
    expectedSuccess: 'Login successful!',
  }));

  loginCases.forEach(({ desc, mockResponse, expectedSuccess }) => {
    test(desc, async () => {
      // Set mock resolved value for each case
      signInWithEmailAndPassword.mockResolvedValue(mockResponse);

      render(
        <MemoryRouter>
          <Login setLoggedIn={() => {}} />
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/Email/i), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/Password/i), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

      // Await the appearance of the expected success message
      await waitFor(() =>
        expect(screen.getByText(expectedSuccess)).toBeInTheDocument()
      );
    });
  });
});
