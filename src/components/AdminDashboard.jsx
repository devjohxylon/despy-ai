import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Download, Filter, Search, RefreshCw, CheckCircle, XCircle, Clock,
  ArrowLeft, ArrowRight, Trash2, Mail, AlertTriangle, Users, TrendingUp,
  Calendar, RefreshCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${color}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
        {trend && (
          <p className={`text-sm mt-2 flex items-center ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend > 0 ? '' : 'transform rotate-180'} mr-1`} />
            {Math.abs(trend)}% vs last week
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color.replace('border-l', 'bg').replace('-600', '-100')}`}>
        <Icon className={`w-6 h-6 ${color.replace('border-l', 'text')}`} />
      </div>
    </div>
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[200px] bg-red-50 rounded-lg p-6">
    <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
    <p className="text-red-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
    >
      <RefreshCcw className="w-4 h-4" /> Try Again
    </button>
  </div>
);

const AdminDashboard = () => {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [selectedEntries, setSelectedEntries] = useState(new Set());
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchData = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (showToast) setLoading(true);
      
      const [entriesRes, statsRes] = await Promise.all([
        fetch(`/api/admin/waitlist?page=${page}&search=${searchTerm}&status=${statusFilter}`, {
          headers: {
            'X-API-Key': import.meta.env.VITE_ADMIN_API_KEY
          }
        }),
        fetch('/api/admin/waitlist/stats', {
          headers: {
            'X-API-Key': import.meta.env.VITE_ADMIN_API_KEY
          }
        })
      ]);

      if (!entriesRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [entriesData, statsData] = await Promise.all([
        entriesRes.json(),
        statsRes.json()
      ]);

      setEntries(entriesData.entries);
      setTotalPages(entriesData.totalPages);
      setStats(statsData);
      setLastRefresh(Date.now());
      
      if (showToast) {
        toast.success('Data refreshed successfully');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      if (showToast) {
        toast.error('Failed to refresh data');
      }
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval === 0) return;
    
    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval, fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/admin/waitlist/export?format=${exportFormat}`, {
        headers: {
          'X-API-Key': import.meta.env.VITE_ADMIN_API_KEY
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `waitlist-export-${new Date().toISOString()}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await fetch(`/api/admin/waitlist/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_ADMIN_API_KEY
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast.success('Status updated successfully');
      fetchData();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedEntries.size === 0) {
      toast.error('No entries selected');
      return;
    }

    try {
      const response = await fetch('/api/admin/waitlist/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_ADMIN_API_KEY
        },
        body: JSON.stringify({
          action,
          ids: Array.from(selectedEntries)
        })
      });

      if (!response.ok) throw new Error('Bulk action failed');

      toast.success(`${action} completed successfully`);
      setSelectedEntries(new Set());
      fetchData();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEntries(new Set(entries.map(entry => entry._id)));
    } else {
      setSelectedEntries(new Set());
    }
  };

  const handleRowSelect = (id) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEntries(newSelected);
  };

  // Memoized stats cards data
  const statsCards = useMemo(() => [
    {
      title: 'Total Signups',
      value: stats?.total || 0,
      icon: Users,
      trend: stats?.weeklyGrowth,
      color: 'border-l-blue-600'
    },
    {
      title: 'Verified Users',
      value: stats?.verified || 0,
      icon: CheckCircle,
      trend: stats?.verificationTrend,
      color: 'border-l-green-600'
    },
    {
      title: 'Last 7 Days',
      value: stats?.weeklySignups || 0,
      icon: Calendar,
      color: 'border-l-yellow-600'
    },
    {
      title: 'Conversion Rate',
      value: `${stats?.conversionRate || 0}%`,
      icon: TrendingUp,
      trend: stats?.conversionTrend,
      color: 'border-l-purple-600'
    }
  ], [stats]);

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchData(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Waitlist Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(lastRefresh).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="0">Manual refresh</option>
              <option value="30">30 seconds</option>
              <option value="60">1 minute</option>
              <option value="300">5 minutes</option>
            </select>
            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Signup Trend</h2>
            <div className="h-64">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.signupTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Status Distribution</h2>
            <div className="h-64">
              {loading ? (
                <LoadingSpinner />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.statusBreakdown || []}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {(stats?.statusBreakdown || []).map((entry, index) => (
                        <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        {/* Controls and Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm"
        >
          {/* Filters and Actions */}
          <div className="p-6 border-b">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex gap-4 items-center">
                {selectedEntries.size > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('approve')}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      Approve Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Reject Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      Delete Selected
                    </button>
                  </div>
                )}

                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEntries.size === entries.length}
                      onChange={handleSelectAll}
                      className="rounded text-blue-500 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEntries.has(entry._id)}
                        onChange={() => handleRowSelect(entry._id)}
                        className="rounded text-blue-500 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{entry.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                        entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.verified ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={entry.status}
                          onChange={(e) => handleStatusChange(entry._id, e.target.value)}
                          className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approve</option>
                          <option value="rejected">Reject</option>
                        </select>
                        <button
                          onClick={() => window.location.href = `mailto:${entry.email}`}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleBulkAction('delete', [entry._id])}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-6 border-t">
            <p className="text-sm text-gray-700">
              Showing {entries.length} of {stats?.total || 0} entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard; 