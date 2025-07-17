const express = require('express');
const router = express.Router();

const { getHotelsByDestinationId, getHotelPricesById, getBulkHotelPrices } = require('../models/hotels');

router.get('/', getHotelsByDestinationId);
router.get('/prices', getBulkHotelPrices);
router.get('/:id/price', getHotelPricesById);


module.exports = router;
