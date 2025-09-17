import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './index.css';
import store from './redux/store.ts';
import { initializeFirebase } from './firebase.ts';

const root = ReactDOM.createRoot(document.getElementById('root')!);

// A simple loading indicator
const renderLoading = (message: string) => {
  root.render(
    <React.StrictMode>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'sans-serif',
        fontSize: '1.2rem',
        color: '#555'
      }}>
        {message}
      </div>
    </React.StrictMode>
  );
};

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
};

// Render the initial loading state
renderLoading("Initializing and connecting to the database...");

// Initialize Firebase and then render the main app
initializeFirebase()
  .then(() => {
    // Once initialization is complete, render the main application
    renderApp();
  })
  .catch(error => {
    console.error("Fatal: Failed to initialize Firebase", error);
    renderLoading("Error: Could not connect to the database. Please check your connection and try again.");
  });
