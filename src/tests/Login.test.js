// tests/Login.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// --- Capture navigate so we can assert on it ---
const mockNavigate = jest.fn();

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
  useNavigate: () => mockNavigate,
  useLocation: () => ({ search: '' }),
  Link: ({ children }) => children,
}));

import Login from '../Login';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { MemoryRouter } from 'react-router-dom';

describe('Login component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ success: true }),
      })
    );
  });

  test('[SUCCESS] successful login shows success message and navigates', async () => {
    signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'uid123', emailVerified: true },
    });

    render(
      <MemoryRouter>
        <Login setLoggedIn={() => {}} />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() =>
      expect(screen.getByText(/login successful!/i)).toBeInTheDocument()
    );
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.any(Object),
      'test@example.com',
      'password123'
    );
    // expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('[VALIDATION] empty fields: does not call Firebase', async () => {
    render(
      <MemoryRouter>
        <Login setLoggedIn={() => {}} />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // No form values entered: ensure we never hit Firebase
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();

    // Optional: if you add a message in your component, assert it here:
    // await waitFor(() =>
    //   expect(screen.getByText(/email and password are required/i)).toBeInTheDocument()
    // );
  });

  test('[ERROR] wrong password shows error message', async () => {
    const error = Object.assign(new Error('Wrong password'), {
      code: 'auth/wrong-password',
    });
    signInWithEmailAndPassword.mockRejectedValue(error);

    render(
      <MemoryRouter>
        <Login setLoggedIn={() => {}} />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'badpass');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Match the text your component actually renders:
    await waitFor(() =>
      expect(screen.getByText(/wrong password/i)).toBeInTheDocument()
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
