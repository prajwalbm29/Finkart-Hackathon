function generateMockPdf(passenger, invoiceNumber) {
  const today = new Date();
  const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  const amount = (Math.random() * 2000 + 300).toFixed(2);
  const airlines = ['Delta Airlines', 'United Airlines', 'American Airlines', 'Southwest', 'JetBlue'];
  const airline = airlines[Math.floor(Math.random() * airlines.length)];
  const gstin = `GSTIN${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  const pdfContent = `
    AIRLINE INVOICE
    ===============
    
    Invoice Number: ${invoiceNumber}
    Date: ${dateStr}
    
    Passenger Details:
    - Name: ${passenger.firstName} ${passenger.lastName}
    - Ticket Number: ${passenger.ticketNumber}
    - PNR: ${passenger.pnr}
    - Flight: ${passenger.flightNumber}
    
    Airline: ${airline}
    
    Charges:
    - Ticket: $${amount}
    - Taxes: $${(amount * 0.15).toFixed(2)}
    
    Total Amount: $${(amount * 1.15).toFixed(2)}
    
    GSTIN: ${gstin}
    
    Thank you for flying with ${airline}!
  `;
  
  return {
    content: pdfContent,
    invoiceData: {
      invoiceNumber,
      date: dateStr,
      airline,
      amount: parseFloat((amount * 1.15).toFixed(2)),
      gstin
    }
  };
}

module.exports = { generateMockPdf };