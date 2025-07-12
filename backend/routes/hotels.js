const express = require('express');
const router = express.Router();

const { getHotelsByDestinationId } = require('../models/hotels');

router.get('/', getHotelsByDestinationId);

module.exports = router;
