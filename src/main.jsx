// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import App from './App';
import './index.css';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with providers
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <DataProvider>
          <App />
        </DataProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);