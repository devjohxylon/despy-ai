import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load route components
const LandingPage = lazy(() => import('./components/LandingPage'));
const NotFound = lazy(() => import('./components/NotFound'));
const MaintenancePage = lazy(() => import('./components/MaintenancePage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminLogin = lazy(() => import('./components/AdminLogin'));
const DashboardPage = lazy(() => import('./components/DashboardPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const AlertsPage = lazy(() => import('./components/AlertsPage'));
const ActivityPage = lazy(() => import('./components/ActivityPage'));

// You can toggle this when needed
const MAINTENANCE_MODE = false;

// Custom loading component with better UX
function PageLoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default function App() {
  if (MAINTENANCE_MODE) {
    return (
      <HelmetProvider>
        <Suspense fallback={<PageLoadingSpinner />}>
          <MaintenancePage />
        </Suspense>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Suspense fallback={<PageLoadingSpinner />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </HelmetProvider>
  );
}