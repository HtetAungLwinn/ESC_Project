// src/Payment.js
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CardNumberElement, CardExpiryElement, CardCvcElement, Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import "./css/PaymentStripe.css"

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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [billingAddr, setBillingAddr] = useState('');
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

    if (!name.trim()){
      setError("Name on card required");
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
    } else if (result.paymentIntent.status === 'succeeded') {
      setMessage('Payment successful!');
      window.location.href = '/confirmation';
      // window.location.assign('/confirmation');

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
    <h2>Booking Details</h2>
    {/* TODO: retrieve and display booking information */}
    {/* TODO: replace the table with a for loop after retrieving */}
    <div>
      
    </div>
    <h2>Payment Details</h2>
    {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
            Card Number: <CardNumberElement options={ELEMENT_OPTIONS} />
          </label> 
          <label>
            Expiry Date (MM/YY): <CardExpiryElement options={ELEMENT_OPTIONS} />
          </label>
          <label>
            CVC: <CardCvcElement options={ELEMENT_OPTIONS} />
          </label>
          
        </form>
        <div>
          <label>Name on card: </label> <br></br>
          <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="First and last name"
          />
        </div>
        
        <div>
          <label>Phone number: </label> <br></br>
          <input
              type="tel"
              pattern="[0-9]{3}-[0-9]{2}-[0-9]{3}"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Include country code"
          />
        </div>

        <div>
          <label>Email address: </label> <br></br>
          <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="someone@example.com"
          />
        </div>

        <div>
          <label>Billing address: </label> <br></br>
          <input
              type="text"
              value={billingAddr}
              onChange={(e) => setBillingAddr(e.target.value)}
              placeholder="Billing address"
          />
        </div>

        <div>
          <label>Special requests to hotel: </label> <br></br>
          <input
              type="text"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any extra requests"
          />
        </div>
        <button type="submit">Pay</button>
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