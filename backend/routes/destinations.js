const express = require('express');
const router = express.Router();

const { getAllDestinations, getUidByDestinationTerm } = require('../models/destinations.js');
// router.get('/dest', getAllDestinations);
router.get('/all', getAllDestinations);
router.get('/uid', getUidByDestinationTerm);

module.exports = router;