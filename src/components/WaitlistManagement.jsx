import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const WaitlistManagement = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, verified
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntries, setSelectedEntries] = useState(new Set());
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    conversionRate: 0
  });

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/waitlist?filter=${filter}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch waitlist');

      const data = await response.json();
      setEntries(data.entries);
      setStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch waitlist entries');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (email) => {
    try {
      const response = await fetch('/api/admin/waitlist/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) throw new Error('Failed to verify email');

      toast.success('Email verified successfully');
      fetchEntries();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to verify email');
    }
  };

  const handleBulkAction = async (action) => {
    try {
      const response = await fetch('/api/admin/waitlist/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          emails: Array.from(selectedEntries)
        })
      });

      if (!response.ok) throw new Error(`Failed to ${action} selected entries`);

      toast.success(`Successfully ${action}ed selected entries`);
      setSelectedEntries(new Set());
      fetchEntries();
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to ${action} selected entries`);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEntries();
  };

  const toggleSelectAll = () => {
    if (selectedEntries.size === entries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(entries.map(entry => entry.email)));
    }
  };

  const toggleSelect = (email) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedEntries(newSelected);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Entries', value: stats.total },
          { label: 'Verified', value: stats.verified },
          { label: 'Pending', value: stats.pending },
          { label: 'Conversion Rate', value: `${stats.conversionRate}%` }
        ].map((stat, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">{stat.label}</div>
            <div className="mt-1 text-2xl font-semibold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Entries</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Bulk Actions */}
      {selectedEntries.size > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center justify-between">
          <div className="text-sm text-blue-700">
            {selectedEntries.size} entries selected
          </div>
          <div className="space-x-2">
            <button
              onClick={() => handleBulkAction('verify')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Verify Selected
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Entries Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedEntries.size === entries.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.email} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedEntries.has(entry.email)}
                    onChange={() => toggleSelect(entry.email)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{entry.email}</div>
                  {entry.referral_code && (
                    <div className="text-xs text-gray-500">
                      Referral: {entry.referral_code}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      entry.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {entry.verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    {!entry.verified && (
                      <button
                        onClick={() => handleVerify(entry.email)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleBulkAction('delete', [entry.email])}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitlistManagement; 