    import React from 'react';

const SummarySection = ({ summary }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(summary).map(([airline, data]) => (
          <div key={airline} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-2">{airline}</h3>
            <p className="text-gray-600">Invoices: {data.count}</p>
            <p className="text-gray-600">Total: ${data.totalAmount.toFixed(2)}</p>
          </div>
        ))}
        {Object.keys(summary).length === 0 && (
          <div className="bg-white rounded-lg shadow p-4 col-span-full">
            <h3 className="text-lg font-semibold mb-2">No data available</h3>
            <p className="text-gray-600">Download and parse invoices to see summary</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummarySection;