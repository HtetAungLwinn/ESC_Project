const express = require('express');
const router = express.Router();

const { getAllDestinations } = require('../models/destinations.js');
// router.get('/dest', getAllDestinations);
router.get('/all', async (req, res) => {
  const destinations = await getAllDestinations();
  res.json(destinations); // Sends the full list (compressed)
});

module.exports = router;