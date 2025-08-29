import React from 'react';
import { FaDownload, FaFileInvoice } from 'react-icons/fa';

const DisplayPassengers = ({ passengers, onDownload, onParse }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'text-green-700 bg-green-100 border border-green-200';
            case 'Failed': return 'text-red-700 bg-red-100 border border-red-200';
            case 'Pending': return 'text-gray-700 bg-gray-100 border border-gray-200';
            default: return 'text-gray-700 bg-gray-100 border border-gray-200';
        }
    };

    const canParse = (passenger) => {
        return passenger.downloadStatus === 'Completed' && passenger.parseStatus === 'Pending';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Passenger List ({passengers.length})
            </h2>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            {['Ticket Number', 'First Name', 'Last Name', 'Download Status', 'Parse Status', 'Actions'].map((header) => (
                                <th
                                    key={header}
                                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {passengers.length > 0 ? (
                            passengers.map((p, index) => (
                                <tr key={p.ticketNumber} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.ticketNumber}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{p.firstName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{p.lastName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(p.downloadStatus)}`}>
                                            {p.downloadStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(p.parseStatus)}`}>
                                            {p.parseStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => onDownload(index)}
                                                disabled={p.downloadStatus === 'Completed'}
                                                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${p.downloadStatus === 'Completed'
                                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                <FaDownload className="text-xs" /> {p.downloadStatus === 'Completed' ? 'Downloaded' : 'Download'}
                                            </button>
                                            <button
                                                onClick={() => onParse(index)}
                                                disabled={!canParse(p)}
                                                className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${!canParse(p)
                                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                        : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                            >
                                                <FaFileInvoice className="text-xs" /> Parse
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-500">
                                    No passengers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DisplayPassengers;
