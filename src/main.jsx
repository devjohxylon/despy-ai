// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import App from './App';
import './index.css';

import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: import.meta.env.MODE || 'production',
});

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with providers
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An error has occurred. Please refresh.</p>}>
      <AuthProvider>
        <BrowserRouter>
          <DataProvider>
            <App />
          </DataProvider>
        </BrowserRouter>
      </AuthProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);