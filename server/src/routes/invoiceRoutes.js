const express = require('express');
const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

router.get('/', invoiceController.getInvoices);
router.get('/high-value', invoiceController.getHighValueInvoices);
router.post('/download/:passengerId', invoiceController.downloadInvoice);
router.post('/parse/:invoiceId', invoiceController.parseInvoice);

module.exports = router;