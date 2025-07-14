const express = require('express');
const router = express.Router();

const { getHotelsByDestinationId, getHotelPricesById, getBulkHotelPrices } = require('../models/hotels');

router.get('/', getHotelsByDestinationId);
router.get('/:id/price', getHotelPricesById);
router.get('/prices', getBulkHotelPrices);

module.exports = router;
