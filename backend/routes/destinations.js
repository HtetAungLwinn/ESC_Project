const express = require('express');
const router = express.Router();

const { getAllDestinations } = require('../models/destinations.js');
// router.get('/dest', getAllDestinations);
router.get('/all', getAllDestinations);

module.exports = router;