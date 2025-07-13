const express = require('express');
const router = express.Router();

// Simulate payment endpoint
router.post('/pay', (req, res) => {
  const { amount, payee_id, method } = req.body;

  // Simulate delay
  setTimeout(() => {
    res.json({
      success: true,
      payment_id: `mockpay_${Date.now()}`,
      payee_id,
      amount,
      method,
      message: 'Payment processed successfully (mock)'
    });
  }, 1000);
});

module.exports = router;
