const passengerData = require('../data/passengers.json')

const GetPassengersController = async (req, res) => {
    try {
        return res.status(200).json({ success: true, message: 'Passengers data fetched successfully', data: passengerData })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = {
    GetPassengersController
}