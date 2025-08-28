const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

const dataDir = path.join(__dirname, "../data");

class InvoiceParser {
    constructor() {
        // Define airline-specific patterns for data extraction
        this.airlinePatterns = {
            // ... [previous patterns]

            // Thai Airways specific patterns
            thai: {
                invoiceNumber: [
                    /TAX INVOICE\s*#?[:]?\s*([A-Z0-9-]+)/i,
                    /Invoice\s*Number[:]?\s*([A-Z0-9-]+)/i
                ],
                date: [
                    /Issue\s*Date[:]?\s*(\d{2}\/\d{2}\/\d{4})/i,
                    /Date[:]?\s*(\d{2}\/\d{2}\/\d{4})/i,
                    /(\d{2}\/\d{2}\/\d{4})\s+\d{2}:\d{2}:\d{2}/ // Date at the bottom
                ],
                airline: [
                    /THAI AIRWAYS/i,
                    /THAI/i
                ],
                amount: [
                    /Total.*INR.*?([\d,]+\.\d{2})/i,
                    /Total.*?([\d,]+\.\d{2})/i,
                    /Airfare Charge.*INR.*?([\d,]+\.\d{2})/i,
                    /Taxes.*INR.*?([\d,]+\.\d{2})/i
                ],
                gstin: [
                    /GST\s*No\.\s*[:]?\s*([A-Z0-9]+)/i,
                    /GSTIN[:]?\s*([A-Z0-9]+)/i,
                    /[A-Z]{5}[0-9]{4}[A-Z]{1}/ // Standard GSTIN format
                ],
                passengerName: [
                    /Passenger\s*Name[:]?\s*([A-Z]+\/[A-Z]+(?:\s+[A-Z]+)*)/i,
                    /Name[:]?\s*([A-Z]+\/[A-Z]+)/i
                ],
                ticketNumber: [
                    /TKT\s*(\d+)/i,
                    /Ticket\s*Number[:]?\s*(\d+)/i
                ]
            }
        };

        // Add Thai to airline detection
        this.airlineDetectionPatterns = [
            /(Thai Airways|THAI)/i,
            /(TG)/ // Thai Airways code
        ];
    }

    // Enhanced airline detection
    detectAirline(text) {
        for (const pattern of this.airlineDetectionPatterns) {
            const match = text.match(pattern);
            if (match) {
                if (match[1].toLowerCase().includes('thai')) return 'thai';
                if (match[1] === 'TG') return 'thai';
            }
        }

        // Fallback to previous detection logic
        const airlineMatch = text.match(/(Delta|United|American|Southwest|JetBlue|Air India|IndiGo|SpiceJet|Thai)/i);
        if (airlineMatch) {
            return airlineMatch[1].toLowerCase();
        }

        // Check for airline codes
        const airlineCodeMatch = text.match(/(DL|UA|AA|WN|B6|AI|6E|SG|TG)/);
        if (airlineCodeMatch) {
            const codeToAirline = {
                'DL': 'Delta',
                'UA': 'United',
                'AA': 'American',
                'WN': 'Southwest',
                'B6': 'JetBlue',
                'AI': 'Air India',
                '6E': 'IndiGo',
                'SG': 'SpiceJet',
                'TG': 'Thai'
            };
            return codeToAirline[airlineCodeMatch[1]] || 'Unknown';
        }

        return 'Unknown';
    }

    // Specialized parser for Thai Airways invoices
    async parseThaiAirwaysInvoice(text, passengerData = null) {
        const result = {
            invoiceNumber: null,
            date: null,
            airline: 'Thai Airways',
            amount: 0,
            gstin: null,
            passengerName: null,
            ticketNumber: null,
            rawText: text.substring(0, 500) + '...'
        };

        try {
            // Extract GSTIN
            const gstinMatch = text.match(/GST\s*No\.\s*[:]?\s*([A-Z0-9]+)/i);
            if (gstinMatch) result.gstin = gstinMatch[1];

            // Extract passenger name
            const nameMatch = text.match(/Passenger\s*Name[:]?\s*([^\n]+)/i);
            if (nameMatch) {
                result.passengerName = nameMatch[1].trim();
                // Format name from "YADAV/PRASOON MR" to "PRASOON YADAV"
                const nameParts = result.passengerName.split('/');
                if (nameParts.length >= 2) {
                    result.passengerName = `${nameParts[1].replace(/\s+(MR|MRS|MS)$/i, '')} ${nameParts[0]}`.trim();
                }
            }

            // Extract ticket number
            const ticketMatch = text.match(/TKT\s*(\d+)/i);
            if (ticketMatch) result.ticketNumber = ticketMatch[1];

            // Extract issue date
            const dateMatch = text.match(/Issue\s*Date[:]?\s*(\d{2}\/\d{2}\/\d{4})/i);
            if (dateMatch) result.date = dateMatch[1];

            // Extract total amount - look for the total line specifically
            const totalMatch = text.match(/Total\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/i);
            if (totalMatch) {
                result.amount = parseFloat(totalMatch[2].replace(/,/g, ''));
            } else {
                // Fallback: sum airfare and taxes
                const airfareMatch = text.match(/Airfare Charge.*INR.*?([\d,]+\.\d{2})/i);
                const taxesMatch = text.match(/Taxes.*INR.*?([\d,]+\.\d{2})/i);

                if (airfareMatch && taxesMatch) {
                    const airfare = parseFloat(airfareMatch[1].replace(/,/g, ''));
                    const taxes = parseFloat(taxesMatch[1].replace(/,/g, ''));
                    result.amount = airfare + taxes;
                }
            }

            // Generate invoice number if not found
            if (!result.invoiceNumber) {
                result.invoiceNumber = `THAI-INV-${result.ticketNumber || Date.now()}`;
            }

            return result;
        } catch (error) {
            console.error('Error parsing Thai Airways invoice:', error);
            throw error;
        }
    }

    // Enhanced parseInvoice method
    async parseInvoice(pdfPath, passengerData = null) {
        try {
            // Extract text from PDF
            const text = await this.extractTextFromPdf(pdfPath);

            // Detect airline to use appropriate patterns
            const airline = this.detectAirline(text);

            // Use specialized parser for Thai Airways
            if (airline === 'thai') {
                return await this.parseThaiAirwaysInvoice(text, passengerData);
            }

            // Use generic parser for other airlines
            const patterns = this.airlinePatterns[airline.toLowerCase()] || this.airlinePatterns.default;

            // Extract all required fields
            const invoiceNumber = this.cleanValue(
                this.extractValue(text, patterns.invoiceNumber),
                'invoiceNumber'
            );

            const date = this.cleanValue(
                this.extractValue(text, patterns.date),
                'date'
            );

            const amount = this.cleanValue(
                this.extractValue(text, patterns.amount),
                'amount'
            );

            const gstin = this.extractValue(text, patterns.gstin);

            // Use detected airline or extract from text
            const extractedAirline = this.extractValue(text, patterns.airline) || airline;

            // Additional validation and fallbacks
            const result = {
                invoiceNumber: invoiceNumber || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                date: date || new Date().toLocaleDateString(),
                airline: extractedAirline,
                amount: amount || 0,
                gstin: gstin || 'N/A',
                passengerData: passengerData || {},
                rawText: text.substring(0, 500) + '...'
            };

            return result;
        } catch (error) {
            console.error('Error parsing invoice:', error);
            throw new Error(`Failed to parse invoice: ${error.message}`);
        }
    }

    // ... [rest of the methods remain the same]
}

module.exports = InvoiceParser;