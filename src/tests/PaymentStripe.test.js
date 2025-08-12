import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { MemoryRouter } from 'react-router-dom';
import { CheckoutForm } from '../PaymentStripe';
import userEvent from '@testing-library/user-event';

const stripePromise = loadStripe('test_key_123');

// Declare these here to be set per test
let mockCreatePaymentMethod;
let mockConfirmCardPayment;

jest.mock("@stripe/react-stripe-js", () => ({
  CardNumberElement: (props) => <input data-testid="card-number" {...props} />,
  CardExpiryElement: (props) => <input data-testid="card-expiry" {...props} />,
  CardCvcElement: (props) => <input data-testid="card-cvc" {...props} />,
  Elements: ({ children }) => <div>{children}</div>,
  useStripe: () => ({
    createPaymentMethod: mockCreatePaymentMethod,
    confirmCardPayment: mockConfirmCardPayment,
  }),
  useElements: () => ({
    getElement: jest.fn(() => ({})),
  }),
}));

jest.mock("@stripe/stripe-js", () => ({
  loadStripe: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  // Default mock implementations (can override in tests)
  mockCreatePaymentMethod = jest.fn(() =>
    Promise.resolve({
      error: null,
      paymentMethod: { id: 'pm_mocked_123' },
    })
  );
  mockConfirmCardPayment = jest.fn(() =>
    Promise.resolve({
      error: null,
      paymentIntent: { status: 'succeeded', id: 'pi_mocked_123' },
    })
  );

  // Mock fetch for clientSecret and booking creation
  global.fetch = jest.fn((url) => {
    if (url === '/api/payment-stripe/create-payment-intent') {
      return Promise.resolve({
        json: () => Promise.resolve({ clientSecret: "test_client_secret" }),
      });
    }
    if (url === '/api/bookings/create') {
      return Promise.resolve({
        json: () => Promise.resolve({ success: true }),
      });
    }
    return Promise.reject(new Error('Unknown fetch URL: ' + url));
  });
});

afterEach(() => {
  global.fetch.mockClear();
  jest.resetAllMocks();
});


test('renders guest details table with correct destination details', async () => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/payment-stripe?destination_name=CityX&hotel=HotelY&hotel_addr=456%20Avenue']}>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </MemoryRouter>
    );
  });

  expect(await screen.findByText('CityX')).toBeInTheDocument();
  expect(await screen.findByText('HotelY')).toBeInTheDocument();
  expect(await screen.findByText('456 Avenue')).toBeInTheDocument();
});

test('renders guest details table with correct dates', async () => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/payment-stripe?checkin=2025-12-01&checkout=2025-12-05']}>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </MemoryRouter>
    );
  });
  expect(await screen.findByText('2025-12-01')).toBeInTheDocument();
  expect(await screen.findByText('2025-12-05')).toBeInTheDocument();
});

test('renders guest details table with correct guest count', async () => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/payment-stripe?&adults=3&children=2']}>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </MemoryRouter>
    );
  });
  expect(await screen.findByText('3')).toBeInTheDocument();
  expect(await screen.findByText('2')).toBeInTheDocument();
});

test('renders guest details table with correct pricing', async () => {
  await act(async () => {
    render(
      <MemoryRouter initialEntries={['/payment-stripe?price=500']}>
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </MemoryRouter>
    );
  });
  expect(await screen.findByText('SGD$500.00')).toBeInTheDocument();
});


test('required field empty prevents booking creation', async () => {
  global.fetch.mockClear();

  render(
    <MemoryRouter>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </MemoryRouter>
  );

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

  //simulate user input
  await userEvent.type(screen.getByPlaceholderText(/first and last name/i), 'John Doe');
  await userEvent.type(screen.getByPlaceholderText(/someone@example.com/i), 'john@example.com');
  await userEvent.type(screen.getByPlaceholderText(/billing address/i), '123 Street');

  // click Pay
  await userEvent.click(screen.getByRole('button', { name: /pay/i }));

  // assert only 1 fetch call (initial PaymentIntent setup)
  expect(global.fetch).toHaveBeenCalledTimes(1);

  // ensure booking endpoint not called
  const bookingCalls = global.fetch.mock.calls.filter(call => call[0] === '/api/bookings/create');
  expect(bookingCalls.length).toBe(0);
});

test('shows error when required field is empty and logs error', async () => {
  // Spy on console.error and console.log
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

  render(
    <MemoryRouter>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </MemoryRouter>
  );

  // Fill fields except phone number
  await userEvent.type(screen.getByPlaceholderText(/first and last name/i), 'John Doe');
  await userEvent.type(screen.getByPlaceholderText(/someone@example.com/i), 'john@example.com');
  await userEvent.type(screen.getByPlaceholderText(/billing address/i), '123 Street');

  await userEvent.click(screen.getByRole('button', { name: /pay/i }));

  // Wait for submit handler to run and error to be logged
  await waitFor(() => {
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('is required'));
  });

  // Cleanup spies
  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
});

test('successful payment flow redirects on success', async () => {
  // Mock window.location.href setter
  delete window.location;
  window.location = { href: '' };

  render(
    <MemoryRouter initialEntries={['/payment-stripe?destination_name=CityX&hotel=HotelY&hotel_addr=456%20Avenue&price=100']}>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </MemoryRouter>
  );

  // Fill in form fields
  await userEvent.type(screen.getByPlaceholderText(/first and last name/i), 'John Doe');
  await userEvent.type(screen.getByPlaceholderText(/include country code/i), '+6599999999');
  await userEvent.type(screen.getByPlaceholderText(/someone@example.com/i), 'john@example.com');
  await userEvent.type(screen.getByPlaceholderText(/billing address/i), '123 Street');
  await userEvent.type(screen.getByPlaceholderText(/any extra requests/i), 'None');

  // Fill mocked Stripe elements 
  await userEvent.type(screen.getByTestId('card-number'), '4242424242424242');
  await userEvent.type(screen.getByTestId('card-expiry'), '1225');
  await userEvent.type(screen.getByTestId('card-cvc'), '123');

  // Click Pay
  await userEvent.click(screen.getByRole('button', { name: /pay/i }));

  // Wait for the booking fetch call
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith('/api/bookings/create', expect.any(Object));
  });

  // Check redirection
  expect(window.location.href).toBe('/confirmation');
});

test('shows error when card number is incomplete', async () => {
  // Override mockConfirmCardPayment to simulate error
  mockConfirmCardPayment = jest.fn(() =>
    Promise.resolve({
      error: { message: 'Your card number is incomplete.' },
    })
  );

  render(
    <MemoryRouter>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </MemoryRouter>
  );

  // Fill required fields
  await userEvent.type(screen.getByPlaceholderText(/first and last name/i), 'John Doe');
  await userEvent.type(screen.getByPlaceholderText(/someone@example.com/i), 'john@example.com');
  await userEvent.type(screen.getByPlaceholderText(/billing address/i), '123 Street');
  await userEvent.type(screen.getByPlaceholderText(/include country code/i), '12345678');

  // Click Pay
  await userEvent.click(screen.getByRole('button', { name: /pay/i }));

  // Wait for the error message to appear
  await waitFor(() => {
    expect(screen.getByText(/your card number is incomplete/i)).toBeInTheDocument();
  });
});

test('required field with only whitespace is treated as empty', async () => {
  global.fetch.mockClear();

  render(
    <MemoryRouter>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </MemoryRouter>
  );

  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

  // Fill one field with whitespace only
  await userEvent.type(screen.getByPlaceholderText(/first and last name/i), '   ');
  await userEvent.click(screen.getByRole('button', { name: /pay/i }));

  // Booking API should not be called
  const bookingCalls = global.fetch.mock.calls.filter(call => call[0] === '/api/bookings/create');
  expect(bookingCalls.length).toBe(0);
});

test('payment method creation error sets correct error message', async () => {
  mockCreatePaymentMethod = jest.fn(() =>
    Promise.resolve({
      error: { message: 'Test payment method error' },
    })
  );

  render(
    <MemoryRouter>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </MemoryRouter>
  );

  // Fill all fields
  await userEvent.type(screen.getByPlaceholderText(/first and last name/i), 'John Doe');
  await userEvent.type(screen.getByPlaceholderText(/include country code/i), '+6512345678');
  await userEvent.type(screen.getByPlaceholderText(/someone@example.com/i), 'john@example.com');
  await userEvent.type(screen.getByPlaceholderText(/billing address/i), '123 Street');

  await userEvent.click(screen.getByRole('button', { name: /pay/i }));

  expect(await screen.findByText(/test payment method error/i)).toBeInTheDocument();
});

test('loading state is true during payment attempt and false after', async () => {
  let resolveConfirm;
  mockConfirmCardPayment = jest.fn(
    () => new Promise(res => { resolveConfirm = res; })
  );

  render(
    <MemoryRouter>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </MemoryRouter>
  );

  // Fill required fields
  await userEvent.type(screen.getByPlaceholderText(/first and last name/i), 'John Doe');
  await userEvent.type(screen.getByPlaceholderText(/include country code/i), '+6512345678');
  await userEvent.type(screen.getByPlaceholderText(/someone@example.com/i), 'john@example.com');
  await userEvent.type(screen.getByPlaceholderText(/billing address/i), '123 Street');

  const payButton = screen.getByRole('button', { name: /pay/i });

  // Click and wait for UI to update
  await userEvent.click(payButton);

  // Wait for button to be disabled and show Loading...
  await waitFor(() => {
    expect(payButton).toBeDisabled();
    expect(payButton).toHaveTextContent(/loading/i);
  });

  // Resolve the confirmCardPayment promise
  await act(async () => {
    resolveConfirm({ error: null, paymentIntent: { status: 'succeeded' } });
  });

  // Wait for button to be enabled and show Pay again
  await waitFor(() => {
    expect(payButton).not.toBeDisabled();
    expect(payButton).toHaveTextContent(/^pay$/i);
  });
});


test('success message is set when payment succeeds', async () => {
  mockConfirmCardPayment = jest.fn(() =>
    Promise.resolve({ error: null, paymentIntent: { status: 'succeeded' } })
  );

  // Prevent actual redirect
  delete window.location;
  window.location = { href: '' };

  render(
    <MemoryRouter>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </MemoryRouter>
  );

  await userEvent.type(screen.getByPlaceholderText(/first and last name/i), 'John Doe');
  await userEvent.type(screen.getByPlaceholderText(/include country code/i), '+6512345678');
  await userEvent.type(screen.getByPlaceholderText(/someone@example.com/i), 'john@example.com');
  await userEvent.type(screen.getByPlaceholderText(/billing address/i), '123 Street');

  await userEvent.click(screen.getByRole('button', { name: /pay/i }));

  // Wait for message to appear before redirect attempt
  expect(await screen.findByText(/payment successful!/i)).toBeInTheDocument();

  // Check redirect happened as well (optional)
  expect(window.location.href).toBe('/confirmation');
});


test('does not call booking API if createPaymentMethod fails', async () => {
  mockCreatePaymentMethod = jest.fn(() =>
    Promise.resolve({ error: { message: 'Fail create PM' } })
  );

  render(
    <MemoryRouter>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </MemoryRouter>
  );

  await userEvent.type(screen.getByPlaceholderText(/first and last name/i), 'John Doe');
  await userEvent.type(screen.getByPlaceholderText(/include country code/i), '+6512345678');
  await userEvent.type(screen.getByPlaceholderText(/someone@example.com/i), 'john@example.com');
  await userEvent.type(screen.getByPlaceholderText(/billing address/i), '123 Street');

  await userEvent.click(screen.getByRole('button', { name: /pay/i }));

  await waitFor(() => {
    const bookingCalls = global.fetch.mock.calls.filter(call => call[0] === '/api/bookings/create');
    expect(bookingCalls.length).toBe(0);
  });
});
