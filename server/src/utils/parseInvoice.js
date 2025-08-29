const { Poppler } = require("node-poppler");
const path = require("path");
const Tesseract = require("tesseract.js");
const fs = require('fs')

async function parseInvoice(invoicePath, ticketNumber) {

    const poppler = new Poppler();
    const outputDir = path.join(__dirname, "../invoices/images");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputImage = path.join(outputDir, ticketNumber); // No .png extension
    const pageNumber = 5;

    try {
        // Convert 5th page (pageNumber-1 for zero-based index) to image
        await poppler.pdfToCairo(invoicePath, outputImage, {
            singleFile: true,
            pngFile: true,
            firstPageToConvert: pageNumber,
            lastPageToConvert: pageNumber
        });

        const imagePath = `${outputImage}.png`;
        // OCR the image
        const { data: { text } } = await Tesseract.recognize(imagePath, "eng");

        // Optionally, delete the image after OCR
        require('fs').unlinkSync(imagePath);

        // Extract required fields from OCR text
        function extractInvoiceFields(text) {
            return {
                invoiceNo: (text.match(/Invoice\\s*No[\\.:\\s©]*([A-Z0-9]+)/i) || [])[1] || "",
                date: (text.match(/Invoice Date\s*[©:]?\s*([\d\/]+)/i) || [])[1] || "",
                airline: (text.match(/THAI AIRWAYS INTERNATIONAL PUBLIC COMPANY LIMITED/i) ? "THAI AIRWAYS INTERNATIONAL PUBLIC COMPANY LIMITED" : ""),
                amount: (text.match(/Airfare Charge\s*:\s*INR\s*([\d,.]+)/i) || [])[1] || "",
                gstin: (text.match(/GST No\.\s*:?\s*([\w\d]+)/i) || [])[1] || ""
            };
        }

        return extractInvoiceFields(text);
    } catch (err) {
        console.error("Error converting/OCR page:", err);
        return null;
    }
}

module.exports = parseInvoice