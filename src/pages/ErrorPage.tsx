import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const error: any = useRouteError();
  console.error(error);

  const getErrorMessage = () => {
    if (typeof error === 'string') {
      return error;
    }
    if (error && error.message) {
      return error.message;
    }
    if (error && error.statusText) {
      return error.statusText;
    }
    // Handle complex objects that might not be directly stringifiable
    if (error && typeof error === 'object') {
        try {
            // Check if the object has a toJSON method, which is common for complex objects that can be stringified.
            if(typeof error.toJSON === 'function') {
                return JSON.stringify(error.toJSON(), null, 2);
            }
            // A more robust way to stringify, handling circular references
            const cache = new Set();
            return JSON.stringify(error, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                    if (cache.has(value)) {
                        // Circular reference found, discard key
                        return;
                    }
                    // Store value in our collection
                    cache.add(value);
                }
                return value;
            }, 2);
        } catch (e) {
            // If stringify still fails, try to get a basic string representation.
            if(error.toString && error.toString() !== '[object Object]') {
                return error.toString();
            }
            // Final fallback
            return 'An unstringifiable error object was thrown.';
        }
    }
    return 'An unknown error has occurred.';
  };

  return (
    <div id="error-page" className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Oops!</h1>
      <p className="text-lg mb-2">Sorry, an unexpected error has occurred.</p>
      <pre className="text-gray-500 mb-8 bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
        {getErrorMessage()}
      </pre>
      <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Go Home
      </Link>
    </div>
  );
};

export default ErrorPage;
