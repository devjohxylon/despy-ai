import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminManagement from './AdminManagement';
import AnalyticsDashboard from './AnalyticsDashboard';

const AdminPage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics'); // Start with analytics
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'waitlist') {
      fetchEntries();
    }
  }, [activeTab]);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/waitlist', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
          return;
        }
        throw new Error('Failed to fetch entries');
      }

      const data = await response.json();
      setEntries(data.entries);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleManualVerification = async (email) => {
    setActionInProgress(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:3001/api/admin/verify-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify email');
      }

      await fetchEntries();
    } catch (error) {
      setError(error.message);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleResendVerification = async (email) => {
    setActionInProgress(true);
    try {
      const response = await fetch('http://localhost:3001/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      alert('Verification email resent successfully');
    } catch (error) {
      setError(error.message);
    } finally {
      setActionInProgress(false);
    }
  };

  if (loading && activeTab === 'waitlist') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="mt-4 space-x-4">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setActiveTab('waitlist')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'waitlist'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📧 Waitlist
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`px-4 py-2 rounded ${
                  activeTab === 'admins'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                👥 Admins
              </button>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'waitlist' && (
          <>
            <div className="mb-4">
              <p className="text-gray-600">
                Total: {entries.length} | Verified: {entries.filter(e => e.verified).length}
              </p>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {entries.map((entry, index) => (
                    <tr key={index} className={entry.verified ? 'bg-green-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{entry.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entry.verified
                            ? 'bg-green-100 text-green-800'
                            : entry.tokenExpiry && new Date(entry.tokenExpiry) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {entry.verified 
                            ? 'Verified' 
                            : entry.tokenExpiry && new Date(entry.tokenExpiry) < new Date()
                            ? 'Expired'
                            : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {entry.verifiedAt ? new Date(entry.verifiedAt).toLocaleString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {!entry.verified && (
                            <>
                              <button
                                onClick={() => handleManualVerification(entry.email)}
                                disabled={actionInProgress}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                Verify
                              </button>
                              <button
                                onClick={() => handleResendVerification(entry.email)}
                                disabled={actionInProgress}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                Resend
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'admins' && <AdminManagement />}
      </div>
    </div>
  );
};

export default AdminPage; 