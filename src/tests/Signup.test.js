// tests/Signup.test.js

// Only ONE mock for firebase/auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

// Only ONE mock for react-router-dom
jest.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }) => children,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ search: '' }),
  Link: ({ children }) => children,
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from '../Signup';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { MemoryRouter } from 'react-router-dom';

describe('Signup component bulk tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const signupCases = Array.from({ length: 100 }).map((_, i) => ({
    desc: `valid signup case ${i + 1}`,
    form: {
      salutation: 'Mr.',
      firstName: `First${i}`,
      lastName: `Last${i}`,
      religion: 'Other',
      phoneNumber: '12345678',
      address: '123 Street',
      postalCode: '123456',
      email: `user${i}@test.com`,
      password: 'Password1!',
      confirmPassword: 'Password1!',
      roles: '1',
    },
  }));

  signupCases.forEach(({ desc, form }) => {
    test(desc, async () => {
      createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: `uid${desc}` } });
      render(
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      );
      // Fill in all fields
      fireEvent.change(screen.getByLabelText(/Salutation/i), { target: { value: form.salutation } });
      fireEvent.change(screen.getByLabelText(/First name/i), { target: { value: form.firstName } });
      fireEvent.change(screen.getByLabelText(/Last name/i), { target: { value: form.lastName } });
      fireEvent.change(screen.getByLabelText(/Religion/i), { target: { value: form.religion } });
      fireEvent.change(screen.getByLabelText(/Phone contact/i), { target: { value: form.phoneNumber } });
      fireEvent.change(screen.getByLabelText(/Address details/i), { target: { value: form.address } });
      fireEvent.change(screen.getByLabelText(/Postal Code/i), { target: { value: form.postalCode } });
      fireEvent.change(screen.getByLabelText(/^Email:/i), { target: { value: form.email } });
      fireEvent.change(screen.getByLabelText(/^Password:/i), { target: { value: form.password } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: form.confirmPassword } });
      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
      await waitFor(() =>
        expect(screen.getByText(/Signup successful!/i)).toBeInTheDocument()
      );
    });
  });
});
