const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
require('dotenv').config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Replace with your secret key

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body; // amount in cents (e.g. $10 = 1000)

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'sgd',
      // You can add metadata or receipt_email here if you want
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe create payment intent error:', error);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
});

module.exports = router;
