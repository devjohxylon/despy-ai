import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const AdminLogin = lazy(() => import('./components/AdminLogin'));
const AdminPage = lazy(() => import('./components/AdminPage'));
const VerifyEmail = lazy(() => import('./components/VerifyEmail'));
const LandingPage = lazy(() => import('./components/LandingPage'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));

function App() {
  useEffect(() => {
    console.log('App loaded');
  }, []);

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mr-4"></div>
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    }>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={
          <DashboardPage />
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        {/* Add other routes here */}
      </Routes>
    </Suspense>
  );
}

export default App;