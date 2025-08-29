const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const parseInvoice = require('../utils/parseInvoice')

const invoicesDir = path.join(process.cwd(), "src/invoices");
const passengersFile = path.join(process.cwd(), "src/data/passengers.json");

// Ensure invoices directory exists
if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir);
}

// Helper to read & write passengers.json
function readPassengers() {
    return JSON.parse(fs.readFileSync(passengersFile, "utf-8"));
}
function writePassengers(data) {
    fs.writeFileSync(passengersFile, JSON.stringify(data, null, 4));
}

const DownloadInvoiceController = async (req, res) => {
    let browser;
    try {
        const { ticketNumber, firstName, lastName } = req.body;

        if (!ticketNumber || !firstName || !lastName) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();

        // Configure download folder
        await page._client().send("Page.setDownloadBehavior", {
            behavior: "allow",
            downloadPath: invoicesDir,
        });

        await page.goto(
            "https://thaiair.thaiairways.com/ETAXPrint/pages/passengerPages/passengerHomePage.jsp",
            { waitUntil: "networkidle2" }
        );

        await page.type("#ticketNo", ticketNumber);
        await page.type("#firstName", firstName);
        await page.type("#lastName", lastName);

        // Submit search
        await page.evaluate(() => {
            document.querySelector("button[onclick='search()']").click();
        });

        await page.waitForSelector(".ticketCheckbox", { timeout: 15000 });
        await page.evaluate(() => {
            const checkbox = document.querySelector(".ticketCheckbox");
            if (checkbox && !checkbox.checked) checkbox.click();
        });

        await page.waitForSelector("button[onclick='viewTicketDetails()']", { timeout: 15000 });
        await Promise.all([
            page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
            page.evaluate(() => {
                document.querySelector("button[onclick='viewTicketDetails()']").click();
            }),
        ]);

        // Click download
        await page.waitForSelector("#download_button", { timeout: 30000 });
        await page.click("#download_button");

        // Wait for the file to appear (max 30 seconds)
        const defaultFile = path.join(invoicesDir, "print_cash_tax.pdf");
        const renamedFile = path.join(invoicesDir, `${ticketNumber}.pdf`);

        let retries = 0;
        while (!fs.existsSync(defaultFile) && retries < 30) {
            await new Promise(r => setTimeout(r, 1000)); // wait 1 sec
            retries++;
        }

        if (!fs.existsSync(defaultFile)) {
            return res.status(500).json({ success: false, message: "PDF download failed" });
        }

        fs.renameSync(defaultFile, renamedFile);

        // Update passengers.json
        const passengers = readPassengers().map(p => {
            if (p.ticketNumber === ticketNumber) {
                p.downloadStatus = "Completed";
                p.invoicePath = renamedFile;
            }
            return p;
        });
        writePassengers(passengers);

        const updatedPassenger = passengers.find(p => p.ticketNumber === ticketNumber);

        return res.status(200).json({
            success: true,
            message: "Invoice downloaded successfully",
            passenger: updatedPassenger
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (browser) await browser.close();
    }
};

const ParseInvoiceController = async (req, res) => {
    try {
        const { ticketNumber } = req.body;

        const invoicePath = path.join(invoicesDir, `${ticketNumber}.pdf`);

        if (!fs.existsSync(invoicePath)) {
            return res.status(404).json({ success: false, message: "Invoice file not found" });
        }

        const parsedData = await parseInvoice(invoicePath, ticketNumber);

        // Update passengers.json
        const passengers = readPassengers().map(p => {
            if (p.ticketNumber === ticketNumber) {
                p.parseStatus = "Completed";
                p.parsedData = parsedData;
            }
            return p;
        });
        writePassengers(passengers);

        const updatedPassenger = passengers.find(p => p.ticketNumber === ticketNumber);

        res.status(200).json({
            success: true,
            message: "Invoice parsed successfully",
            parsedData,
            passenger: updatedPassenger
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { DownloadInvoiceController, ParseInvoiceController };
