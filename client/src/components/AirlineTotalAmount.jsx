import axios from 'axios';
import React, { useEffect, useState } from 'react';

const AirlineTotalAmount = () => {
    const [airlines, setAirlines] = useState([]);

    useEffect(() => {
        const fetchAirlines = async () => {
            try {
                const { data } = await axios.get('/api/summary/airline-amount');
                if (data?.success) {
                    setAirlines(data.data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchAirlines();
    }, []); // No need to depend on passengers if fetching from API

    if (!airlines || airlines.length === 0) {
        return <p className="text-gray-500 mt-4">No airline data available.</p>;
    }

    return (
        <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Airline Total Amounts</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Airline</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {airlines.map((item, index) => (
                            <tr
                                key={index}
                                className={`border-t border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    } hover:bg-gray-100`}
                            >
                                <td className="px-4 py-2 text-sm text-gray-800">{item.airline}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{item.totalAmount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AirlineTotalAmount;
