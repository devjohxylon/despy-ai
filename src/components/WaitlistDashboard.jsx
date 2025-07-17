import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WaitlistDashboard() {
  const [waitlist, setWaitlist] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateForm, setUpdateForm] = useState({
    title: '',
    content: '',
    highlights: ['', '', '']
  });

  // Fetch waitlist data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [waitlistRes, statsRes] = await Promise.all([
          fetch('/api/admin/waitlist', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
          }),
          fetch('/api/stats')
        ]);

        if (!waitlistRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [waitlistData, statsData] = await Promise.all([
          waitlistRes.json(),
          statsRes.json()
        ]);

        setWaitlist(waitlistData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Send update to waitlist
  const sendUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          type: 'send_update',
          data: updateForm
        })
      });

      if (!res.ok) throw new Error('Failed to send update');

      const data = await res.json();
      toast.success(`Update sent to ${data.succeeded} recipients!`);
      
      // Clear form
      setUpdateForm({
        title: '',
        content: '',
        highlights: ['', '', '']
      });
    } catch (error) {
      console.error('Error sending update:', error);
      toast.error('Failed to send update');
    }
  };

  // Remove email from waitlist
  const removeEmail = async (email) => {
    if (!confirm(`Are you sure you want to remove ${email}?`)) return;

    try {
      const res = await fetch('/api/admin/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          type: 'delete_email',
          data: { email }
        })
      });

      if (!res.ok) throw new Error('Failed to remove email');

      setWaitlist(waitlist.filter(w => w.email !== email));
      toast.success('Email removed from waitlist');
    } catch (error) {
      console.error('Error removing email:', error);
      toast.error('Failed to remove email');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Signups</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Last 7 Days</h3>
          <p className="text-3xl font-bold text-green-600">
            {stats?.weeklySignups?.reduce((sum, day) => sum + day.count, 0) || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Conversion Rate</h3>
          <p className="text-3xl font-bold text-purple-600">
            {stats?.total ? ((stats.weeklySignups?.reduce((sum, day) => sum + day.count, 0) / stats.total) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Signup Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Signup Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats?.weeklySignups || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Send Update Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Send Update</h3>
        <form onSubmit={sendUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={updateForm.title}
              onChange={e => setUpdateForm({ ...updateForm, title: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={updateForm.content}
              onChange={e => setUpdateForm({ ...updateForm, content: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Key Highlights</label>
            {updateForm.highlights.map((highlight, i) => (
              <input
                key={i}
                type="text"
                value={highlight}
                onChange={e => {
                  const newHighlights = [...updateForm.highlights];
                  newHighlights[i] = e.target.value;
                  setUpdateForm({ ...updateForm, highlights: newHighlights });
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder={`Highlight ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send Update
          </button>
        </form>
      </div>

      {/* Waitlist Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {waitlist.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => removeEmail(entry.email)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 