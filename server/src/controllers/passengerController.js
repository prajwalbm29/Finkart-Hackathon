const { loadPassengers } = require('../utils/csvParser');
const { loadInvoices } = require('../utils/storage');

let passengers = [];
let invoices = [];

// Initialize data
async function initializeData() {
  try {
    passengers = await loadPassengers();
    invoices = await loadInvoices();
    console.log(`Loaded ${passengers.length} passengers and ${invoices.length} invoices`);
  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

function getPassengers(req, res) {
  const passengerData = passengers.map(passenger => {
    const invoice = invoices.find(inv => inv.passengerId === passenger.ticketNumber);
    return {
      ...passenger,
      downloadStatus: invoice ? invoice.downloadStatus : 'pending',
      parseStatus: invoice ? invoice.parseStatus : 'pending',
      invoiceId: invoice ? invoice.id : null
    };
  });
  
  res.json(passengerData);
}

module.exports = {
  initializeData,
  getPassengers,
  getPassengersData: () => passengers,
  getInvoices: () => invoices,
  updateInvoices: (newInvoices) => { invoices = newInvoices; }
};