const express = require('express');
const router = express.Router();

const { createBooking, getBookingByID, getAllBookings } = require('../models/booking.js');
router.post('/bookings', createBooking)
router.get('/bookings/:uid/:id', getBookingByID);
router.get('/bookings/:uid', getAllBookings);

module.exports = router;