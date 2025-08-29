import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-20 h-20">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-gray-300 animate-spin"></div>

        {/* Inner pulse */}
        <div className="absolute inset-4 rounded-full bg-blue-500 animate-ping"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
