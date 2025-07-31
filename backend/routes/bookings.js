const express = require('express');
const router = express.Router();

const { createBooking, getBookingByID, getAllBookings } = require('../models/booking.js');
router.post('/create', createBooking)
//router.get('/:uid/:id', getBookingByID);
router.get('/', getAllBookings);

module.exports = router;