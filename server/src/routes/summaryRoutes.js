const express = require('express');
const { AirlineWiseAmountController } = require('../controllers/summaryController');
const router = express.Router();

router.get('/airline-amount', AirlineWiseAmountController)

module.exports = router;