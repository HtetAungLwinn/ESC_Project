// PaymentStripe.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentStripe from './PaymentStripe';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Mock fetch
beforeEach(() => {
    global.fetch = jest.fn(() =>
        Promise.resolve({
            json: () => Promise.resolve({ clientSecret: 'mock-secret' }),
        })
    );
});

afterEach(() => {
    jest.clearAllMocks();
});

const stripePromise = loadStripe('pk_test_mock');

// Mock Stripe
const mockConfirmCardPayment = jest.fn(() =>
    Promise.resolve({ paymentIntent: { status: 'succeeded' } })
);
const mockStripe = {
    confirmCardPayment: mockConfirmCardPayment,
};
const mockElements = {
    getElement: jest.fn(() => ({})),
};

jest.mock('@stripe/react-stripe-js', () => {
    const actual = jest.requireActual('@stripe/react-stripe-js');
    return {
        ...actual,
        useStripe: () => mockStripe,
        useElements: () => mockElements,
    };
});

describe('Payment component', () => {
    beforeAll(() => {
        delete window.location;
        window.location = { href: '', assign: jest.fn() };
    });

    test('redirects to /confirmation on successful payment', async () => {
        const originalLocation = window.location;

        delete window.location;
        window.location = {
            ...originalLocation,
            set href(url) {
                this._href = url;
                this.hrefSetter(url);
            },
            get href() {
                return this._href;
            },
            hrefSetter: jest.fn(),
        };

        render(
            <Elements stripe={stripePromise}>
                <PaymentStripe />
            </Elements>
        );

        fireEvent.change(screen.getByPlaceholderText(/first and last name/i), {
            target: { value: 'John Doe' },
        });

        fireEvent.click(screen.getByRole('button', { name: /pay/i }));

        await waitFor(() => {
            expect(window.location.hrefSetter).toHaveBeenCalledWith('/confirmation');
        });

        window.location = originalLocation;
    });



    test('shows error message on card decline', async () => {
        render(
            <Elements stripe={stripePromise}>
                <PaymentStripe />
            </Elements>
        );

        fireEvent.change(screen.getByPlaceholderText(/first and last name/i), {
            target: { value: 'John Doe' },
        });

        fireEvent.click(screen.getByRole('button', { name: /pay/i }));

        await waitFor(() =>
            expect(
                screen.getByText(/Your card was declined/i)
            ).toBeInTheDocument()
        );
    });
});
