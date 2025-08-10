const express = require('express');
const router = express.Router();

const { createBooking, getBookingByID, getAllBookings, deleteBooking } = require('../models/booking.js');
router.post('/create', createBooking)
//router.get('/:uid/:id', getBookingByID);
router.get('/', getAllBookings);
router.delete('/delete', deleteBooking);

module.exports = router;