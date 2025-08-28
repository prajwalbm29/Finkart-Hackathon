import React from 'react';
import StatusBadge from './StatusBadge';

const PassengerTable = ({ 
  passengers, 
  selectedPassengers, 
  onToggleSelect, 
  onDownloadInvoice, 
  onParseInvoice 
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Passenger Records</h2>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Select
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Passenger
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PNR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Flight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Download Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parse Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {passengers.map(passenger => (
              <tr key={passenger.ticketNumber}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={!!selectedPassengers[passenger.ticketNumber]}
                    onChange={() => onToggleSelect(passenger.ticketNumber)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {passenger.firstName} {passenger.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {passenger.ticketNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {passenger.pnr}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {passenger.flightNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={passenger.downloadStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={passenger.parseStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onDownloadInvoice(passenger.ticketNumber)}
                    disabled={passenger.downloadStatus === 'loading' || passenger.downloadStatus === 'success'}
                    className={`mr-2 px-3 py-1 rounded text-sm ${
                      passenger.downloadStatus === 'loading' || passenger.downloadStatus === 'success'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {passenger.downloadStatus === 'loading' ? 'Downloading...' : 'Download Invoice'}
                  </button>
                  {passenger.downloadStatus === 'success' && (
                    <button
                      onClick={() => onParseInvoice(passenger.invoiceId, passenger.ticketNumber)}
                      disabled={passenger.parseStatus === 'loading' || passenger.parseStatus === 'success'}
                      className={`px-3 py-1 rounded text-sm ${
                        passenger.parseStatus === 'loading' || passenger.parseStatus === 'success'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {passenger.parseStatus === 'loading' ? 'Parsing...' : 'Parse Invoice'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PassengerTable;