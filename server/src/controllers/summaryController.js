const passengerData = require('../data/passengers.json');

const AirlineWiseAmountController = async (req, res) => {
    try {
        const result = {};

        passengerData.forEach(p => {
            if (p.parseStatus === "Completed" && p.parsedData) {
                const airline = p.parsedData.airline;
                const amount = parseFloat(p.parsedData.amount.replace(/,/g, '')) || 0; // convert string to number

                if (result[airline]) {
                    result[airline] += amount;
                } else {
                    result[airline] = amount;
                }
            }
        });

        const airlineAmounts = Object.keys(result).map(airline => ({
            airline,
            totalAmount: result[airline].toFixed(2)
        }));

        return res.status(200).json({ success: true, data: airlineAmounts });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { AirlineWiseAmountController };
