const express = require('express');
const passengerController = require('../controllers/passengerController');

const router = express.Router();

// Initialize data when routes are loaded
passengerController.initializeData();

router.get('/', passengerController.getPassengers);

module.exports = router;