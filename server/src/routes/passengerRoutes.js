const express = require('express');
const router = express.Router();
const { GetPassengersController } = require('../controllers/passengerController')

router.get('/get-passengers', GetPassengersController);


module.exports = router;