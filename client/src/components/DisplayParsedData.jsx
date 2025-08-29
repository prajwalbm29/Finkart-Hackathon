import React, { useEffect, useState } from 'react';

const DisplayParsedData = ({ passengers }) => {
    const [parsedData, setParsedData] = useState([]);

    useEffect(() => {
        setParsedData(passengers.filter(p => p.parseStatus === "Completed"));
    }, [passengers]);

    if (!parsedData || parsedData.length === 0)
        return <p className="text-gray-500 mt-4 text-center">No completed parsed data available.</p>;

    return (
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 rounded-lg">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            {['Ticket No', 'Date', 'Airline', 'Amount', 'GST No'].map(header => (
                                <th
                                    key={header}
                                    className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {parsedData.map((data, index) => (
                            <tr
                                key={index}
                                className={`odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition`}
                            >
                                <td className="px-4 py-2 text-sm text-gray-800">{data.ticketNumber}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{data.parsedData.date}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{data.parsedData.airline}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{data.parsedData.amount}</td>
                                <td className="px-4 py-2 text-sm text-gray-800">{data.parsedData.gstin}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DisplayParsedData;
