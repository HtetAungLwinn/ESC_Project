const express = require('express');
const router = express.Router();
const db = require('../models/database');

// delete /api/deleteAccount
router.delete('/', async (req, res) => {
  const { uid } = req.body;
  if (!uid) return res.status(400).json({ success: false, error: 'Missing uid' });
  try {
    // Delete user from users table
    await db.query('DELETE FROM User WHERE uid = ?', [uid]);
    // Delete user bookings
    await db.query('DELETE FROM bookings WHERE uid = ?', [uid]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
