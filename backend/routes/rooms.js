const express = require('express');
const router = express.Router();

const { getRoomsByHotelId, getBulkRoomPrices } = require('../models/rooms');

router.get('/:id', getRoomsByHotelId);
router.get('/:id/prices', getBulkRoomPrices);

module.exports = router;
