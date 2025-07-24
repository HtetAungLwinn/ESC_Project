// src/Payment.js
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardNumberElement, CardExpiryElement, CardCvcElement, Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load your Stripe publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      letterSpacing: '0.025em',
      fontFamily: 'monospace',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

function CheckoutForm() {
  const [name, setName] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/payment-stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000 }) // SGD $10.00  todo - replace with actual amount
    })
      .then(res => res.json())
      .then(data => {
        console.log("Received clientSecret:", data.clientSecret);
        setClientSecret(data.clientSecret);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
      }
    });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      setMessage('Payment successful!');
      window.location.href = '/confirmation';
    }
  };

  return (
  //   <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
  //     <h2>Payment</h2>
  //     <CardElement />    //stripe default card element's which includes card number, expiry, and CVC
  //     <button type="submit" disabled={!stripe || loading} style={{ marginTop: 20 }}>
  //       {loading ? 'Processing…' : 'Pay Now'}
  //     </button>
  //     {message && <p style={{ color: 'green' }}>{message}</p>}
  //   </form>
  // );
  <div>
    <h2>Payment Details</h2>
    {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name on Card:</label>
          <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
          />
        </div>
          
          <label>
            Card Number: <CardNumberElement options={ELEMENT_OPTIONS} />
          </label>
          <label>
            Expiry Date (MM/YY): <CardExpiryElement options={ELEMENT_OPTIONS} />
          </label>
          <label>
            CVC: <CardCvcElement options={ELEMENT_OPTIONS} />
          </label>
          <button type="submit">Pay</button>
        </form>
  </div>
  );
}
    

export default function Payment() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}