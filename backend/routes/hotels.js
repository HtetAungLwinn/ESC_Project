const express = require('express');
const router = express.Router();

const { getFilteredHotels } = require('../models/hotels');

// router.get('/', getHotelsByDestinationId);
// router.get('/prices', getBulkHotelPrices);
// router.get('/:id/price', getHotelPricesById);
router.get('/', getFilteredHotels);


module.exports = router;
