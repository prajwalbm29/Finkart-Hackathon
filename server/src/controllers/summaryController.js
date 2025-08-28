const passengerController = require('./passengerController');

function getSummary(req, res) {
  const invoices = passengerController.getInvoices();
  const successfulInvoices = invoices.filter(inv => inv.parseStatus === 'success');
  const summary = {};

  successfulInvoices.forEach(invoice => {
    if (!summary[invoice.airline]) {
      summary[invoice.airline] = {
        count: 0,
        totalAmount: 0
      };
    }

    summary[invoice.airline].count++;
    summary[invoice.airline].totalAmount += invoice.amount;
  });

  res.json(summary);
}

module.exports = {
  getSummary
};