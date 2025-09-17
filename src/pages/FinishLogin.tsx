import React from 'react';

const FinishLogin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-8">
          Finishing Login
        </h1>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <p className="text-center text-gray-500 dark:text-gray-400">Please wait while we finish setting up your account...</p>
        </div>
      </div>
    </div>
  );
};

export default FinishLogin;
