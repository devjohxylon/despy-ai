import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Users, ArrowUp, ArrowDown, Clock, MousePointer, Share2, AlertTriangle,
  Activity, TrendingUp
} from 'lucide-react';

const MetricCard = ({ title, value, change, icon: Icon, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/20"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-800 animate-pulse rounded mt-2" />
        ) : (
          <h3 className="text-2xl font-semibold text-gray-100 mt-2">{value}</h3>
        )}
      </div>
      <div className="p-2 bg-gray-800/50 rounded-lg">
        <Icon className="w-5 h-5 text-blue-500" />
      </div>
    </div>
    {!loading && change && (
      <div className="mt-4 flex items-center">
        {change > 0 ? (
          <ArrowUp className="w-4 h-4 text-green-500" />
        ) : (
          <ArrowDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {Math.abs(change)}%
        </span>
        <span className="text-gray-500 text-sm ml-2">vs last week</span>
      </div>
    )}
  </motion.div>
);

const TimeRangeSelector = ({ value, onChange }) => (
  <div className="flex gap-2">
    {['24h', '7d', '30d', '90d'].map((range) => (
      <button
        key={range}
        onClick={() => onChange(range)}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          value === range
            ? 'bg-blue-500 text-white'
            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
        }`}
      >
        {range}
      </button>
    ))}
  </div>
);

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    metrics: {
      totalUsers: 0,
      activeUsers: 0,
      averageSessionTime: 0,
      bounceRate: 0,
      interactions: 0,
      socialShares: 0,
      errors: 0,
      conversionRate: 0
    },
    charts: {
      userActivity: [],
      pageViews: [],
      interactions: [],
      errors: []
    }
  });

  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/data?range=${timeRange}`, {
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch analytics data');
        
        const result = await response.json();
        setData(result.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Calculate trends
  const trends = useMemo(() => ({
    users: 12.5,    // Example values - these would come from the API
    active: 8.3,
    session: -2.1,
    bounce: -5.4,
    interactions: 15.7,
    shares: 23.4,
    errors: -8.9,
    conversion: 18.2
  }), []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-gray-400 mt-2">Track user engagement and platform performance</p>
          </div>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={data.metrics.totalUsers.toLocaleString()}
            change={trends.users}
            icon={Users}
            loading={loading}
          />
          <MetricCard
            title="Active Users"
            value={data.metrics.activeUsers.toLocaleString()}
            change={trends.active}
            icon={Activity}
            loading={loading}
          />
          <MetricCard
            title="Avg. Session Time"
            value={`${Math.round(data.metrics.averageSessionTime / 60)}m`}
            change={trends.session}
            icon={Clock}
            loading={loading}
          />
          <MetricCard
            title="Bounce Rate"
            value={`${data.metrics.bounceRate}%`}
            change={trends.bounce}
            icon={TrendingUp}
            loading={loading}
          />
          <MetricCard
            title="User Interactions"
            value={data.metrics.interactions.toLocaleString()}
            change={trends.interactions}
            icon={MousePointer}
            loading={loading}
          />
          <MetricCard
            title="Social Shares"
            value={data.metrics.socialShares.toLocaleString()}
            change={trends.shares}
            icon={Share2}
            loading={loading}
          />
          <MetricCard
            title="Error Rate"
            value={`${data.metrics.errors}%`}
            change={trends.errors}
            icon={AlertTriangle}
            loading={loading}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${data.metrics.conversionRate}%`}
            change={trends.conversion}
            icon={TrendingUp}
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity Chart */}
          <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/20">
            <h3 className="text-lg font-semibold mb-6">User Activity</h3>
            <div className="h-80">
              {loading ? (
                <div className="h-full w-full bg-gray-800/50 animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.charts.userActivity}>
                    <defs>
                      <linearGradient id="userActivityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      fill="url(#userActivityGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Page Views Chart */}
          <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/20">
            <h3 className="text-lg font-semibold mb-6">Page Views</h3>
            <div className="h-80">
              {loading ? (
                <div className="h-full w-full bg-gray-800/50 animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.charts.pageViews}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10B981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Interactions Chart */}
          <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/20">
            <h3 className="text-lg font-semibold mb-6">User Interactions</h3>
            <div className="h-80">
              {loading ? (
                <div className="h-full w-full bg-gray-800/50 animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.interactions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="type" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Error Tracking Chart */}
          <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/20">
            <h3 className="text-lg font-semibold mb-6">Error Tracking</h3>
            <div className="h-80">
              {loading ? (
                <div className="h-full w-full bg-gray-800/50 animate-pulse rounded" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.charts.errors}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#EF4444"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 