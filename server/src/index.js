const express = require('express');
const cors = require('cors');
const path = require('path');

// initialze dotenv
require('dotenv').config()

const passengerRoutes = require('./routes/passengerRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const summaryRoutes = require('./routes/summaryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));

// Routes
app.use('/api/passengers', passengerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/summary', summaryRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});