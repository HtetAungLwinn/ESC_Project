import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { MemoryRouter } from 'react-router-dom';
import { CheckoutForm, Payment } from '../PaymentStripe';
import userEvent from '@testing-library/user-event';


const stripePromise = loadStripe('test_key_123');

beforeEach(() => {
  jest.clearAllMocks();
  // Mock fetch for clientSecret
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ clientSecret: "test_client_secret" }),
    })
  );
});

afterEach(() => {
  global.fetch.mockClear();
  jest.resetAllMocks();
});


jest.mock("@stripe/react-stripe-js", () => ({
  CardNumberElement: (props) => <input data-testid="card-number" {...props} />,
  CardExpiryElement: (props) => <input data-testid="card-expiry" {...props} />,
  CardCvcElement: (props) => <input data-testid="card-cvc" {...props} />,
  Elements: ({ children }) => <div>{children}</div>,
  useStripe: () => ({
    createPaymentMethod: jest.fn(),
    confirmCardPayment: jest.fn(),
  }),
  useElements: () => ({
    getElement: jest.fn(() => ({})), // mock getting elements so it passes first check
  }),
}));

jest.mock("@stripe/stripe-js", () => ({
  loadStripe: jest.fn(),
}));


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

  expect(await screen.getByText('CityX')).toBeInTheDocument();
  expect(await screen.getByText('HotelY')).toBeInTheDocument();
  expect(await screen.getByText('456 Avenue')).toBeInTheDocument();
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
  expect(await screen.getByText('2025-12-01')).toBeInTheDocument();
  expect(await screen.getByText('2025-12-05')).toBeInTheDocument();
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
  expect(await screen.getByText('3')).toBeInTheDocument();
  expect(await screen.getByText('2')).toBeInTheDocument();
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
  expect(await screen.getByText('SGD$500.00')).toBeInTheDocument();
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
  // Spy on console.error (or console.log)
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

  // Wait for submit handler to run
  await waitFor(() => {
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('is required'));
  });

  // Cleanup spies
  consoleErrorSpy.mockRestore();
  consoleLogSpy.mockRestore();
});


