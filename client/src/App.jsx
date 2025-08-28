import React, { useState } from 'react';
import SummarySection from './components/SummarySection';
import PassengerTable from './components/PassengerTable';
import InvoiceTable from './components/InvoiceTable';
import LoadingSpinner from './components/LoadingSpinner';
import useApiData from './hooks/useApiData';

function App() {
  const [selectedPassengers, setSelectedPassengers] = useState({});

  const { data: passengers, loading: passengersLoading, error: passengersError } = useApiData('passengers');
  const { data: invoices, loading: invoicesLoading, error: invoicesError } = useApiData('invoices');
  const { data: summary, loading: summaryLoading, error: summaryError } = useApiData('summary');

  const loading = passengersLoading || invoicesLoading || summaryLoading;

  const downloadInvoice = async (passengerId) => {
    try {
      const response = await fetch(`http://localhost:7001/api/invoices/download/${passengerId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Refetch passengers to update status
      // In a real app, you might want to update local state instead
      window.location.reload();
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const parseInvoice = async (invoiceId, passengerId) => {
    try {
      const response = await fetch(`http://localhost:7001/api/invoices/parse/${invoiceId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Parsing failed');
      }

      // Refetch data to update status
      window.location.reload();
    } catch (error) {
      console.error('Error parsing invoice:', error);
    }
  };

  const toggleSelectPassenger = (passengerId) => {
    setSelectedPassengers(prev => ({
      ...prev,
      [passengerId]: !prev[passengerId]
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Airline Invoice Management</h1>
      </header>

      <div className="dashboard">
        <SummarySection summary={summary} />
        <PassengerTable
          passengers={passengers}
          selectedPassengers={selectedPassengers}
          onToggleSelect={toggleSelectPassenger}
          onDownloadInvoice={downloadInvoice}
          onParseInvoice={parseInvoice}
        />
        <InvoiceTable invoices={invoices} />
      </div>
    </div>
  );
}

export default App;