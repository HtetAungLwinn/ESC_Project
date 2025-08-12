// tests/Signup.test.js

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

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

describe('Signup component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  const fillForm = (form) => {
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
  };

  test('[SUCCESS] valid signup shows success message', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'uid1' } });

    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fillForm({
      salutation: 'Mr.',
      firstName: 'John',
      lastName: 'Doe',
      religion: 'Other',
      phoneNumber: '12345678',
      address: '123 Street',
      postalCode: '123456',
      email: 'user@test.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      roles: '1',
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() =>
      expect(screen.getByText(/Signup successful!/i)).toBeInTheDocument()
    );
  });

  test('[VALIDATION] invalid phone and postal shows combined error', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fillForm({
      salutation: 'Mr.',
      firstName: 'John',
      lastName: 'Doe',
      religion: 'Other',
      phoneNumber: 'abc',
      address: '123 Street',
      postalCode: 'xyz',
      email: 'user@test.com',
      password: 'Password1!',
      confirmPassword: 'Password1!',
      roles: '1',
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() =>
      expect(screen.getByText(/Phone Number and Postal Code must contain digits only/i)).toBeInTheDocument()
    );
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  test('[VALIDATION] passwords do not match shows error', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    fillForm({
      salutation: 'Mr.',
      firstName: 'John',
      lastName: 'Doe',
      religion: 'Other',
      phoneNumber: '12345678',
      address: '123 Street',
      postalCode: '123456',
      email: 'user@test.com',
      password: 'Password1!',
      confirmPassword: 'DifferentPass',
      roles: '1',
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() =>
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument()
    );
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  test('[VALIDATION] empty required fields does not call Firebase', async () => {
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

    // Do not fill anything, just click submit
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    // Firebase should never be called
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });
});
