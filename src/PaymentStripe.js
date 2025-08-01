// src/Payment.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const destination_name = searchParams.get('destination_name');
  const destination_id = searchParams.get('destination_id');
  const hotel_id = searchParams.get('hotel_id');
  const checkinParam = searchParams.get('checkin');
  const checkoutParam = searchParams.get('checkout');
  const adultsParam = searchParams.get('adults');
  const childrenParam = searchParams.get('children');
  const hotel = searchParams.get('hotel');
  const hotel_addr = searchParams.get('hotel_addr');
  const room = searchParams.get('room_name');
  const nights = searchParams.get('nights');
  // TODO: Retrieve room price from HotelDetailsPage
  const room_price = parseFloat(searchParams.get('price'));
  const uid = localStorage.getItem('uid')

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

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (!cardNumberElement || !cardExpiryElement || !cardCvcElement) {
      setError("Please wait and try again.");
      return;
    }

    setLoading(true);

    const requiredFields = [
      { label: "Name on card", value: name },
      { label: "Phone number", value: phoneNumber },
      { label: "Email address", value: email },
      { label: "Billing address", value: billingAddr },
    ];

    for (let field of requiredFields) {
      if (!field.value.trim()) {
        setError(`${field.label} is required.`);
        return;
      }
    }

    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardNumberElement,
    });

    if (pmError) {
      setError(pmError.message || "Payment method creation failed.");
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id
    });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message || 'Payment failed.');
    } else if (result.paymentIntent.status === 'succeeded') {
      fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dest_id: destination_id,
          start_date: checkinParam,
          end_date: checkoutParam,
          uid: uid,
          hotel_id: hotel_id,
          hotel_name: hotel,
          hotel_addr: hotel_addr,
          stay_info: {
            nights: nights,
            adults: adultsParam,
            children: childrenParam,
            room_type: room,
          },
          price: room_price,
          payment_info: {
            amount: room_price,
            method: 'Stripe Card',
            payment_method_id: paymentMethod.id,
            status: 'Paid',
            paid_at: new Date().toISOString(),
            currency: 'SGD',
            transaction_id: result.paymentIntent.id
          },
          message_to_hotel: specialRequests || null
        }),
      });
      setMessage('Payment successful!');
      window.location.href = '/confirmation';
    }
  };

  return (
    <div className='payment-container'>
      <div>
        <div>
          <h2 >Booking Details</h2>
          <table className="booking-table">
            <thead>
              <tr>
                {[
                  'Destination',
                  'Hotel',
                  'Address',
                  'Checkin Date',
                  'Checkout Date',
                  'Adults',
                  'Children',
                  'Price',
                ].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {[
                  destination_name,
                  hotel,
                  hotel_addr,
                  checkinParam,
                  checkoutParam,
                  adultsParam,
                  childrenParam,
                  `SGD$${room_price.toFixed(2)}`,
                ].map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            </tbody>
          </table>


        </div>

      </div>
      <h2>Payment Details</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} className='payment-form'>
        <div className='form-left'>
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
        </div>

        <div className='form-right'>
          <label>
            Card Number: <CardNumberElement options={ELEMENT_OPTIONS} />
          </label>
          <label>
            Expiry Date (MM/YY): <CardExpiryElement options={ELEMENT_OPTIONS} />
          </label>
          <label>
            CVC: <CardCvcElement options={ELEMENT_OPTIONS} />
          </label>
        </div>

        <button type="submit" disabled={!stripe || loading}>Pay</button>
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