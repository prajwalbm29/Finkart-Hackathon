import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer, toast } from 'react-toastify';

import DisplayPassengers from './components/DisplayPassengers';
import LoadingSpinner from './components/LoadingSpinner';
import DisplayParsedData from './components/DisplayParsedData';
import AirlineTotalAmount from './components/AirlineTotalAmount';

const App = () => {
  const [passengers, setPassengers] = useState([]);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axios.defaults.baseURL = 'http://localhost:7001';
  }, []);

  useEffect(() => {
    const fetchPassengers = async () => {
      try {
        const { data } = await axios.get('/api/passengers/get-passengers');
        if (data?.success) setPassengers(data?.data);
      } catch (error) {
        console.error(error);
        toast.error(error?.response?.data?.message || "Failed to fetch passengers");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPassengers();
  }, []);


  const downloadInvoice = async (index) => {
    setLoadingIndex(index);

    const passenger = passengers[index];

    // Optimistic UI
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...passenger, downloadStatus: 'In Progress' };
    setPassengers(updatedPassengers);

    const toastId = toast.loading(`Downloading invoice for ${passenger.firstName}...`);

    try {
      const { data } = await axios.post('/api/invoices/download', {
        ticketNumber: passenger.ticketNumber,
        firstName: passenger.firstName,
        lastName: passenger.lastName
      });

      if (data?.success) {
        toast.update(toastId, { render: data.message, type: "success", isLoading: false, autoClose: 3000 });
        updatedPassengers[index] = data.passenger;
        setPassengers(updatedPassengers);
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.update(toastId, { render: error?.response?.data?.message || "Download failed", type: "error", isLoading: false, autoClose: 3000 });
      updatedPassengers[index] = { ...passenger, downloadStatus: 'Failed' };
      setPassengers(updatedPassengers);
    } finally {
      setLoadingIndex(null);
    }
  };

  const parseInvoice = async (index) => {
    setLoadingIndex(index);

    const passenger = passengers[index];

    // Optimistic UI
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...passenger, parseStatus: 'In Progress' };
    setPassengers(updatedPassengers);

    const toastId = toast.loading(`Parsing invoice for ${passenger.firstName}...`);

    try {
      const { data } = await axios.post('/api/invoices/parse', {
        ticketNumber: passenger.ticketNumber
      });


      if (data?.success) {
        toast.update(toastId, { render: "Invoice parsed successfully", type: "success", isLoading: false, autoClose: 3000 });
        setPassengers(prev => prev.map((p, idx) => idx == index ? data?.passenger : p));
      }
    } catch (error) {
      console.error('Parse failed:', error);
      toast.update(toastId, { render: "Parse failed", type: "error", isLoading: false, autoClose: 3000 });
      updatedPassengers[index] = { ...passenger, parseStatus: 'Failed' };
      setPassengers(updatedPassengers);
    } finally {
      setLoadingIndex(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Passenger Invoice Management
        </h1>

        <DisplayPassengers
          passengers={passengers}
          onDownload={downloadInvoice}
          onParse={parseInvoice}
          loadingIndex={loadingIndex}
        />

        <DisplayParsedData passengers={passengers} />

        <AirlineTotalAmount />
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
};

export default App;