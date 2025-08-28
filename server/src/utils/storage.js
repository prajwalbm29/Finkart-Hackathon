const fs = require('fs').promises;
const path = require('path');

const invoicesFile = path.join(__dirname, '../data/invoices.json');

async function loadInvoices() {
  try {
    const data = await fs.readFile(invoicesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing invoice data found, starting fresh');
    return [];
  }
}

async function saveInvoices(invoices) {
  try {
    await fs.writeFile(invoicesFile, JSON.stringify(invoices, null, 2));
  } catch (error) {
    console.error('Error saving invoices:', error);
    throw error;
  }
}

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

module.exports = { loadInvoices, saveInvoices, ensureDirectoryExists };