const express = require('express');
const cors = require('cors');
const path = require('path');

// initialze dotenv
require('dotenv').config()

const passengerRoutes = require('./routes/passengerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

const app = express();
const PORT = process.env.PORT || 7001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

// Routes
app.use('/api/passengers', passengerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/summary', summaryRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});