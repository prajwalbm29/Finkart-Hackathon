const csv = require('csv-parser');
const fs = require('fs').promises;
const path = require('path');

async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const fs = require('fs');
    
    if (!fs.existsSync(filePath)) {
      reject(new Error('CSV file not found'));
      return;
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push({
        ticketNumber: data['Ticket Number'],
        firstName: data['First Name'],
        lastName: data['Last Name'],
        pnr: `PNR${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        flightNumber: `FL${Math.floor(Math.random() * 1000) + 100}`
      }))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

async function loadPassengers() {
  try {
    const csvPath = path.join(__dirname, '../data/passengers.csv');
    const jsonPath = path.join(__dirname, '../data/passengers.json');
    
    // Check if JSON file already exists
    try {
      const data = await fs.readFile(jsonPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // If JSON doesn't exist, parse CSV
      console.log('Parsing CSV file...');
      const passengers = await parseCSV(csvPath);
      await fs.writeFile(jsonPath, JSON.stringify(passengers, null, 2));
      return passengers;
    }
  } catch (error) {
    console.error('Error loading passengers:', error);
    return [];
  }
}

module.exports = { loadPassengers };