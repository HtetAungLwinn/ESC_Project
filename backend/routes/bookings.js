const express = require('express');
const router = express.Router();

const { createBooking, getBookingByID } = require('../models/booking.js');
router.post('/bookings', createBooking)
router.get('/bookings/:id', getBookingByID);

module.exports = router;