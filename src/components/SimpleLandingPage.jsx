import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import analytics from '../utils/analytics';
import { toast } from 'react-hot-toast';

export default function SimpleLandingPage() {
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [waitlistCount, setWaitlistCount] = useState(0);

  // Fetch waitlist count
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setWaitlistCount(data.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setWaitlistCount(127); // Fallback number
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      // Track successful signup
      analytics.trackEvent('waitlist_signup', { email, status: 'success' });
      
      // Update count locally
      setWaitlistCount(prev => prev + 1);
      
      // Clear form
      setEmail('');
      
      // Show success message
      toast.success('Successfully joined the waitlist! Check your email.', {
        duration: 5000,
        style: { background: '#1F2937', color: '#F3F4F6' }
      });
    } catch (error) {
      setError(error.message);
      // Track failed signup
      analytics.trackEvent('waitlist_signup', { email, status: 'error', error: error.message });
      
      // Show error message
      toast.error(error.message, {
        duration: 5000,
        style: { background: '#1F2937', color: '#F3F4F6' }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          DeSpy AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          AI-powered blockchain analytics and security platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isAuthenticated ? (
            <div className="text-center">
              <p className="text-gray-300 mb-4">Welcome back!</p>
              <Link
                to="/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Join the Waitlist
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  Or try the demo
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/dashboard"
                className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 