import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, Area
} from 'recharts';
import { 
  Download, Filter, Search, RefreshCw, CheckCircle, XCircle, Clock,
  ArrowLeft, ArrowRight, Trash2, Mail, AlertTriangle, Users, TrendingUp,
  Calendar, RefreshCcw, LogOut, Settings, Eye, EyeOff, MoreVertical,
  ChevronLeft, ChevronRight, Plus, Minus, Zap, Target, Activity,
  Shield, Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';
import getApiUrl from '../utils/api';
import HealthMonitor from './HealthMonitor';
import AdminSettings from './AdminSettings';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];

const StatCard = ({ title, value, icon: Icon, trend, color, subtitle }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm text-gray-400 font-medium">{title}</p>
        </div>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-3 text-sm ${
            trend > 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend > 0 ? '' : 'transform rotate-180'}`} />
            <span>{Math.abs(trend)}% from last week</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-900/20 backdrop-blur-xl border border-red-800/50 rounded-xl p-8">
    <div className="p-4 bg-red-500/20 rounded-full mb-4">
      <AlertTriangle className="w-12 h-12 text-red-400" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
    <p className="text-gray-400 mb-6 text-center max-w-md">{message}</p>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
    >
      <RefreshCcw className="w-4 h-4" /> Try Again
    </button>
  </div>
);

const BulkEmailModal = ({ isOpen, onClose, selectedCount, onSend }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('custom');
  const [sending, setSending] = useState(false);

  const templates = {
    welcome: {
      subject: 'Welcome to DeSpy AI! 🚀',
      message: `Hi there!

Welcome to DeSpy AI! We're excited to have you join our waitlist.

We're working hard to bring you the most advanced AI-powered insights and we'll keep you updated on our progress.

Best regards,
The DeSpy AI Team`
    },
    update: {
      subject: 'DeSpy AI Update - We\'re Getting Closer! 📈',
      message: `Hi there!

Great news! We're making excellent progress on DeSpy AI and wanted to share some updates with you.

We're on track to launch soon and you'll be among the first to know when we go live.

Stay tuned for more exciting updates!

Best regards,
The DeSpy AI Team`
    },
    custom: {
      subject: '',
      message: ''
    }
  };

  const handleTemplateChange = (templateName) => {
    setTemplate(templateName);
    if (templateName !== 'custom') {
      setSubject(templates[templateName].subject);
      setMessage(templates[templateName].message);
    } else {
      setSubject('');
      setMessage('');
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    setSending(true);
    try {
      await onSend({ subject, message });
      toast.success('Bulk email sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to send bulk email');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Send Bulk Email</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipients: {selectedCount} users
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Template
            </label>
            <select
              value={template}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="custom">Custom Message</option>
              <option value="welcome">Welcome Email</option>
              <option value="update">Update Email</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email subject..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter your message..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {sending ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

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
  const [showBulkEmail, setShowBulkEmail] = useState(false);
  const [showHealthMonitor, setShowHealthMonitor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchData = useCallback(async (showToast = false) => {
    try {
      setError(null);
      if (showToast) setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const [entriesRes, statsRes] = await Promise.all([
        fetch(getApiUrl(`admin/waitlist?page=${page}&search=${searchTerm}&status=${statusFilter}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(getApiUrl('admin/waitlist/stats'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
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
      setTotalPages(entriesData.pagination?.totalPages || 1);
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl(`admin/waitlist/export?format=${exportFormat}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl(`admin/waitlist/${id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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

  const handleBulkAction = async (action, specificIds = null) => {
    const idsToProcess = specificIds || Array.from(selectedEntries);
    if (idsToProcess.length === 0) {
      toast.error('No entries selected');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl('admin/waitlist/bulk'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action,
          ids: idsToProcess
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk action failed');
      }

      const result = await response.json();
      toast.success(result.message || `${action} completed successfully`);
      setSelectedEntries(new Set());
      fetchData();
    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error(error.message || 'Failed to perform bulk action');
    }
  };

  const handleBulkEmail = async ({ subject, message }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(getApiUrl('admin/waitlist/bulk-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ids: Array.from(selectedEntries),
          subject,
          message
        })
      });

      if (!response.ok) throw new Error('Bulk email failed');

      return true;
    } catch (error) {
      console.error('Bulk email error:', error);
      throw error;
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEntries(new Set(entries.map(entry => entry.id || entry._id)));
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
      trend: stats?.growthRate,
      color: 'bg-blue-600',
      subtitle: 'All time registrations'
    },
    {
      title: 'This Week',
      value: stats?.weekly || 0,
      icon: Activity,
      trend: null,
      color: 'bg-emerald-600',
      subtitle: 'New signups this week'
    },
    {
      title: 'This Month',
      value: stats?.monthly || 0,
      icon: Calendar,
      trend: null,
      color: 'bg-purple-600',
      subtitle: 'New signups this month'
    },
    {
      title: 'Growth Rate',
      value: `${stats?.growthRate || 0}%`,
      icon: TrendingUp,
      trend: null,
      color: 'bg-orange-600',
      subtitle: 'Weekly growth percentage'
    },
    {
      title: 'Approved',
      value: entries.filter(e => e.status === 'approved').length,
      icon: CheckCircle,
      trend: null,
      color: 'bg-green-600',
      subtitle: 'Approved applications'
    },
    {
      title: 'Pending',
      value: entries.filter(e => e.status === 'pending').length,
      icon: Clock,
      trend: null,
      color: 'bg-yellow-600',
      subtitle: 'Pending review'
    },
    {
      title: 'Rejected',
      value: entries.filter(e => e.status === 'rejected').length,
      icon: XCircle,
      trend: null,
      color: 'bg-red-600',
      subtitle: 'Rejected applications'
    },
    {
      title: 'Verified',
      value: entries.filter(e => e.verified).length,
      icon: Shield,
      trend: null,
      color: 'bg-indigo-600',
      subtitle: 'Email verified users'
    }
  ], [stats, entries]);

  if (error) {
    return <ErrorState message={error} onRetry={() => fetchData(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              DeSpy AI Admin
            </h1>
            <p className="text-gray-400 mt-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Last updated: {new Date(lastRefresh).toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-2">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-gray-300 text-sm border-none outline-none"
              >
                <option value="0">Manual refresh</option>
                <option value="30">30 seconds</option>
                <option value="60">1 minute</option>
                <option value="300">5 minutes</option>
              </select>
            </div>
            
            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <button
              onClick={() => setShowHealthMonitor(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all duration-200 hover:scale-105"
            >
              <Heart className="w-4 h-4" />
              Health
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all duration-200 hover:scale-105"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            
            <button
              onClick={() => authService.logout()}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4"
        >
          {statsCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatCard {...card} />
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
              <p className="text-gray-400 text-sm">Common administrative tasks</p>
            </div>
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setShowBulkEmail(true)}
              disabled={selectedEntries.size === 0}
              className="flex flex-col items-center gap-2 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Mail className="w-6 h-6 text-blue-400" />
              <span className="text-sm text-white font-medium">Bulk Email</span>
              <span className="text-xs text-gray-400">{selectedEntries.size} selected</span>
            </button>
            
            <button
              onClick={() => handleBulkAction('approve')}
              disabled={selectedEntries.size === 0}
              className="flex flex-col items-center gap-2 p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-sm text-white font-medium">Approve All</span>
              <span className="text-xs text-gray-400">{selectedEntries.size} selected</span>
            </button>
            
            <button
              onClick={() => handleBulkAction('reject')}
              disabled={selectedEntries.size === 0}
              className="flex flex-col items-center gap-2 p-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            >
              <XCircle className="w-6 h-6 text-red-400" />
              <span className="text-sm text-white font-medium">Reject All</span>
              <span className="text-xs text-gray-400">{selectedEntries.size} selected</span>
            </button>
            
            <button
              onClick={handleExport}
              className="flex flex-col items-center gap-2 p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-lg transition-all duration-200 hover:scale-105"
            >
              <Download className="w-6 h-6 text-purple-400" />
              <span className="text-sm text-white font-medium">Export Data</span>
              <span className="text-xs text-gray-400">{exportFormat.toUpperCase()}</span>
            </button>
          </div>
        </motion.div>

        {/* Analytics Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Signup Trend Chart */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Signup Trend</h3>
                <p className="text-gray-400 text-sm">Last 30 days</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">30D</button>
                <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm">7D</button>
                <button className="px-3 py-1 bg-gray-700 text-gray-300 rounded-lg text-sm">24H</button>
              </div>
            </div>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.signupTrend || []}>
                    <defs>
                      <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#9CA3AF" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: '#F9FAFB'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#signupGradient)"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Status Distribution Chart */}
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Status Distribution</h3>
                <p className="text-gray-400 text-sm">Current waitlist status</p>
              </div>
            </div>
            <div className="h-64">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="relative">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                </div>
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
                      labelLine={false}
                    >
                      {(stats?.statusBreakdown || []).map((entry, index) => (
                        <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: '#F9FAFB'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Export Data</h3>
                <p className="text-gray-400 text-sm">Download waitlist data</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
              </select>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Export
              </button>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-600 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Growth Rate</h3>
                <p className="text-gray-400 text-sm">Current performance</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">
                {stats?.growthRate || 0}%
              </div>
              <div className="text-sm text-gray-400">Weekly growth</div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Auto Refresh</h3>
                <p className="text-gray-400 text-sm">Real-time updates</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {refreshInterval === 0 ? 'Off' : `${refreshInterval}s`}
              </div>
              <div className="text-sm text-gray-400">Update interval</div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-orange-600 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Bulk Email</h3>
                <p className="text-gray-400 text-sm">Send to selected users</p>
              </div>
            </div>
            <button
              onClick={() => setShowBulkEmail(true)}
              disabled={selectedEntries.size === 0}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              Send Email ({selectedEntries.size})
            </button>
          </div>
        </motion.div>

        {/* Waitlist Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-4 py-3 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="email-asc">Email A-Z</option>
                  <option value="email-desc">Email Z-A</option>
                  <option value="status-asc">Status A-Z</option>
                  <option value="status-desc">Status Z-A</option>
                </select>
              </div>

              <div className="flex gap-4 items-center">
                {selectedEntries.size > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('approve')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Approve Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('reject')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Reject Selected
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      Delete Selected
                    </button>
                  </div>
                )}

                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-800 p-6 bg-gray-800/30"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Verification Status
                    </label>
                    <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">All</option>
                      <option value="verified">Verified Only</option>
                      <option value="unverified">Unverified Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quick Actions
                    </label>
                    <div className="flex gap-2">
                      <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors">
                        Today
                      </button>
                      <button className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
                        This Week
                      </button>
                      <button className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
                        This Month
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/50 border-b border-gray-700">
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEntries.size === entries.length}
                      onChange={handleSelectAll}
                      className="rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12">
                      <div className="flex items-center justify-center">
                        <div className="relative">
                          <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                        <span className="ml-3 text-gray-400">Loading entries...</span>
                      </div>
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="p-4 bg-gray-800/50 rounded-full mb-4">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">No entries found</h3>
                        <p className="text-gray-400 max-w-md">
                          {searchTerm || statusFilter ? 
                            'Try adjusting your search or filter criteria.' : 
                            'Your waitlist is empty. Share your signup link to start collecting emails!'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, index) => (
                    <tr key={entry.id || entry._id} className="hover:bg-gray-800/30 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedEntries.has(entry.id || entry._id)}
                          onChange={() => handleRowSelect(entry.id || entry._id)}
                          className="rounded text-blue-500 focus:ring-blue-500 bg-gray-700 border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-200 font-medium">{entry.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{entry.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          entry.status === 'approved' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30' :
                          entry.status === 'rejected' ? 'bg-red-600/20 text-red-400 border border-red-600/30' :
                          'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.verified ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400 text-sm">Verified</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-400" />
                            <span className="text-yellow-400 text-sm">Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <select
                            value={entry.status}
                            onChange={(e) => handleStatusChange(entry.id || entry._id, e.target.value)}
                            className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="approved">Approve</option>
                            <option value="rejected">Reject</option>
                          </select>
                          <button
                            onClick={() => window.location.href = `mailto:${entry.email}`}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleBulkAction('delete', [entry.id || entry._id])}
                            className="p-2 hover:bg-red-600/20 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-6 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              Showing <span className="text-white font-medium">{entries.length}</span> of <span className="text-white font-medium">{stats?.total || 0}</span> entries
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3 border border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-all duration-200 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4 text-gray-300" />
              </button>
              <span className="px-4 py-3 text-gray-300">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-3 border border-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition-all duration-200 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bulk Email Modal */}
        <BulkEmailModal
          isOpen={showBulkEmail}
          onClose={() => setShowBulkEmail(false)}
          selectedCount={selectedEntries.size}
          onSend={handleBulkEmail}
        />

        {/* Health Monitor */}
        <HealthMonitor
          isOpen={showHealthMonitor}
          onClose={() => setShowHealthMonitor(false)}
        />

        {/* Admin Settings */}
        <AdminSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard; 