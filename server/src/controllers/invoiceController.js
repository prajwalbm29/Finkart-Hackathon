const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const { ensureDirectoryExists, saveInvoices } = require('../utils/storage');
const passengerController = require('./passengerController');

const invoicesDir = path.join(__dirname, '../invoices');
const dataDir = path.join(__dirname, "../data");

async function downloadInvoice(req, res) {
  const passengerId = req.params.passengerId;
  const passengers = passengerController.getPassengersData();
  const passenger = passengers.find(p => p.ticketNumber === passengerId);

  if (!passenger) {
    return res.status(404).json({ error: "Passenger not found" });
  }

  try {
    await ensureDirectoryExists(invoicesDir);

    // Invoice file expected format: passenger.ticketNumber.pdf
    const fileName = `${passenger.ticketNumber}.pdf`;
    const filePath = path.join(invoicesDir, fileName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).json({ error: "Invoice PDF not found for this passenger" });
    }

    // Create invoice record
    let invoices = passengerController.getInvoices();
    const invoice = {
      id: passenger.ticketNumber, // Use ticketNumber as invoice ID
      passengerId: passenger.ticketNumber,
      fileName: fileName,
      filePath: filePath,
      downloadStatus: "success",
      parseStatus: "pending",
      downloadedAt: new Date().toISOString()
    };

    // Update or insert record
    const existingIndex = invoices.findIndex(inv => inv.passengerId === passengerId);
    if (existingIndex !== -1) {
      invoices[existingIndex] = invoice;
    } else {
      invoices.push(invoice);
    }

    await saveInvoices(invoices);
    passengerController.updateInvoices(invoices);

    res.json(invoice);
  } catch (error) {
    console.error("Error downloading invoice:", error);

    let invoices = passengerController.getInvoices();
    const invoice = {
      id: `FAILED-${Date.now()}`,
      passengerId: passenger.ticketNumber,
      downloadStatus: "error",
      error: error.message,
      downloadedAt: new Date().toISOString()
    };

    const existingIndex = invoices.findIndex(inv => inv.passengerId === passengerId);
    if (existingIndex !== -1) {
      invoices[existingIndex] = invoice;
    } else {
      invoices.push(invoice);
    }

    await saveInvoices(invoices);
    passengerController.updateInvoices(invoices);

    res.status(500).json({ error: "Failed to fetch invoice" });
  }
}


async function parseInvoice(req, res) {
  const invoiceId = req.params.invoiceId;
  let invoices = passengerController.getInvoices();
  const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);

  if (invoiceIndex === -1) {
    return res.status(404).json({ error: "Invoice not found" });
  }

  const invoice = invoices[invoiceIndex];

  if (invoice.downloadStatus !== "success") {
    return res
      .status(400)
      .json({ error: "Invoice not downloaded successfully" });
  }

  try {
    await ensureDirectoryExists(dataDir);

    const filePath = path.join(invoicesDir, invoice.fileName);
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);

    const text = data.text;

    // Extract data using regex patterns
    const invoiceNumberMatch = text.match(/Invoice Number[:]?\s*([A-Z0-9-]+)/i);
    const dateMatch = text.match(/Date[:]?\s*(\d{2}\/\d{2}\/\d{4})/i);
    const airlineMatch = text.match(/Airline[:]?\s*([A-Za-z\s]+)/i);
    const amountMatch = text.match(/Total Amount[:]?\s*\$?(\d+(?:\.\d{2})?)/i);
    const gstinMatch = text.match(/GSTIN[:]?\s*([A-Z0-9]+)/i);

    // Parsed data object
    const parsedData = {
      invoiceId: invoice.id,
      passengerId: invoice.passengerId,
      invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1] : "N/A",
      date: dateMatch ? dateMatch[1] : "N/A",
      airline: airlineMatch ? airlineMatch[1].trim() : "Unknown",
      amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
      gstin: gstinMatch ? gstinMatch[1] : "N/A",
      parseStatus: "success",
      parsedAt: new Date().toISOString()
    };

    // Update invoices.json (main metadata file)
    invoices[invoiceIndex] = { ...invoice, ...parsedData };
    await saveInvoices(invoices);
    passengerController.updateInvoices(invoices);

    // Save parsed data into ../data folder
    const parsedFilePath = path.join(dataDir, `parsed-${invoice.id}.json`);
    await fs.writeFile(parsedFilePath, JSON.stringify(parsedData, null, 2));

    res.json(parsedData);
  } catch (error) {
    console.error("Error parsing invoice:", error);

    invoices[invoiceIndex] = {
      ...invoice,
      parseStatus: "error",
      error: error.message,
      parsedAt: new Date().toISOString()
    };

    await saveInvoices(invoices);
    passengerController.updateInvoices(invoices);

    res.status(500).json({ error: "Failed to parse invoice" });
  }
}


function getInvoices(req, res) {
  const invoices = passengerController.getInvoices();
  res.json(invoices.filter(invoice => invoice.parseStatus === 'success'));
}

function getHighValueInvoices(req, res) {
  const threshold = req.query.threshold || 10000;
  const invoices = passengerController.getInvoices();
  const highValueInvoices = invoices.filter(invoice =>
    invoice.parseStatus === 'success' && invoice.amount > threshold
  );

  res.json(highValueInvoices);
}

module.exports = {
  downloadInvoice,
  parseInvoice,
  getInvoices,
  getHighValueInvoices
};