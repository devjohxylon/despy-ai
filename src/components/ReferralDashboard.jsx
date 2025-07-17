import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer 
} from 'recharts';

const ReferralDashboard = () => {
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // '7d', '30d', 'all'

  useEffect(() => {
    fetchReferralData();
    const interval = setInterval(fetchReferralData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchReferralData = async () => {
    try {
      const response = await fetch(`/api/referrals?timeRange=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch referral data');
      const data = await response.json();
      setReferralData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Referral Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Referrals', value: referralData?.stats.reduce((acc, curr) => acc + curr.total_referrals, 0) || 0 },
          { title: 'Converted Referrals', value: referralData?.stats.reduce((acc, curr) => acc + curr.converted_referrals, 0) || 0 },
          { title: 'Rewards Sent', value: referralData?.stats.reduce((acc, curr) => acc + curr.rewards_sent, 0) || 0 },
          { title: 'Conversion Rate', value: `${((referralData?.stats.reduce((acc, curr) => acc + curr.converted_referrals, 0) / referralData?.stats.reduce((acc, curr) => acc + curr.total_referrals, 0)) * 100 || 0).toFixed(1)}%` }
        ].map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Referrers */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={referralData?.stats.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="referrer_email" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_referrals" fill="#3B82F6" name="Total Referrals" />
              <Bar dataKey="converted_referrals" fill="#10B981" name="Converted" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Conversion Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Converted', value: referralData?.stats.reduce((acc, curr) => acc + curr.converted_referrals, 0) || 0 },
                  { name: 'Pending', value: referralData?.stats.reduce((acc, curr) => acc + (curr.total_referrals - curr.converted_referrals), 0) || 0 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Referral Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referralData?.recentActivity.map((activity, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{activity.referrer_email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.referred_email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      activity.status === 'converted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard; 