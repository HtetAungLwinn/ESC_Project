const e = require('express');
const express = require('express');
const router = express.Router();

// Simulate payment endpoint
router.post('/pay', (req, res) => {
  const { cardNumber, cvv, expiryDate} = req.body;

  // Card details test block
  const validCards = [
    { cardNumber: '4111111111111111', cvv: '123', expiryDate: '12/25' },
    { cardNumber: '5555555555554444', cvv: '456', expiryDate: '08/24' }
  ];

  const isValid = validCards.some(card =>
    card.cardNumber === cardNumber &&
    card.cvv === cvv &&
    card.expiryDate === expiryDate
  );

  setTimeout(() => {
    if (isValid){
      res.json({
        success: true,
        message: 'Payment successful'
      });
    } else{
      res.status(400).json({
        success: false,
        error: 'Invalid card details'
      });
    }
  }, 1000);
});

module.exports = router;
