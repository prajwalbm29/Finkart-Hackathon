const express = require('express');
const { DownloadInvoiceController, ParseInvoiceController } = require('../controllers/invoiceController');
const router = express.Router();

router.post('/download', DownloadInvoiceController)
router.post('/parse', ParseInvoiceController)

module.exports = router;