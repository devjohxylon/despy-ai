/**
 * LandingPage Component
 * 
 * A modern landing page featuring an animated title, countdown timer, and waitlist functionality.
 * 
 * Key Features:
 * - Animated background with gradient effects
 * - Interactive countdown timer to launch date
 * - Waitlist modal with email validation
 * - Responsive design with mobile optimization
 * - Framer Motion animations for smooth transitions
 * 
 * Component Structure:
 * - AnimatedBackground (memo): Provides dynamic gradient background effects
 * - CountdownTimer (memo): Displays time remaining until launch
 * - WaitlistModal (memo): Handles email collection and validation
 * 
 * State Management:
 * - Modal state: Controls waitlist modal visibility
 * - Countdown state: Updates timer every second
 * - Form state: Handles email input and validation
 * 
 * @note Launch date is set to September 1st, 2025
 * @note All animations use Framer Motion for consistent behavior
 * @note Toast notifications use react-hot-toast
 */

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Shield, 
  Lock, 
  Eye, 
  Zap, 
  Clock, 
  Bell, 
  LineChart,
  CheckCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
  Play
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import analytics from '../utils/analytics';
import getApiUrl from '../utils/api';

// Optimized static background
const StaticBackground = memo(() => (
  <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div className="absolute inset-0 opacity-30" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }} />
  </div>
));

// Optimized countdown timer
const CountdownTimer = memo(() => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    function calculateTimeLeft() {
      const targetDate = new Date(2025, 8, 1).getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }

    calculateTimeLeft();
    const id = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4 text-sm">
      <span className="text-gray-400">Launch in</span>
      <div className="flex items-center gap-3">
        <TimeUnit value={timeLeft.days} label="days" />
        <TimeUnit value={timeLeft.hours} label="hours" />
        <TimeUnit value={timeLeft.minutes} label="minutes" />
        <TimeUnit value={timeLeft.seconds} label="seconds" />
      </div>
    </div>
  );
});

const TimeUnit = memo(({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="bg-blue-500/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-blue-500/30">
      <span className="text-blue-400 font-mono font-bold text-lg">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <span className="text-xs mt-1 text-gray-500 uppercase tracking-wider">{label}</span>
  </div>
));

// Modern waitlist modal
const WaitlistModal = memo(({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = useCallback((value) => {
    if (!value) return 'Email is required';
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) return 'Invalid email address';
    return '';
  }, []);

  const handleEmailChange = useCallback((e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  }, [validateEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    setIsSubmitting(true);
    setEmailError('');
    
    try {
      await onSubmit(email);
      setEmail('');
    } catch (error) {
      setEmailError(error.message || 'Failed to join waitlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-md"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h3>
              <p className="text-gray-400">Be the first to access DeSpy AI when we launch</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    emailError ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter your email"
                  disabled={isSubmitting}
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {emailError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Joining...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Join Waitlist
                  </>
                )}
              </button>
            </form>

            <button
              onClick={onClose}
              className="mt-4 w-full text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Feature card component
const FeatureCard = memo(({ icon: Icon, title, description, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
  >
    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </motion.div>
));

// Stats card component
const StatsCard = memo(({ value, label, icon: Icon, color }) => (
  <div className="text-center">
    <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-3`}>
      <Icon className="w-8 h-8 text-white" />
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
));

export default function LandingPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    waitlistCount: 0,
    verifiedCount: 0
  });

  // Fetch waitlist stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleJoinWaitlist = async (email) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      toast.success('Successfully joined the waitlist!');
      setIsModalOpen(false);
      fetchStats(); // Refresh stats
      
      // Track analytics
      analytics.track('waitlist_joined', { email });
    } catch (error) {
      throw error;
    }
  };

  const features = [
    {
      icon: Shield,
      title: 'Advanced Security Analysis',
      description: 'Detect vulnerabilities and security risks in smart contracts and wallet addresses with AI-powered analysis.',
      color: 'bg-blue-500/20'
    },
    {
      icon: Eye,
      title: 'Real-time Monitoring',
      description: 'Monitor blockchain transactions and detect suspicious activities in real-time across Ethereum and Solana.',
      color: 'bg-green-500/20'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Scans',
      description: 'Analyze contracts and wallets in seconds with our optimized blockchain scanning technology.',
      color: 'bg-purple-500/20'
    },
    {
      icon: LineChart,
      title: 'Risk Assessment',
      description: 'Get detailed risk scores and comprehensive reports for informed decision making.',
      color: 'bg-orange-500/20'
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'Your data is encrypted and secure. We never store sensitive wallet information.',
      color: 'bg-red-500/20'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of users already protecting their assets with DeSpy AI.',
      color: 'bg-indigo-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-gray-50 relative overflow-hidden">
      <StaticBackground />
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">DeSpy AI</span>
            </div>
            
            <div className="flex items-center gap-4">
              <CountdownTimer />
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Join Waitlist
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">Coming Soon</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Advanced Blockchain
              <span className="block text-blue-400">Security Analysis</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Protect your assets with AI-powered analysis of smart contracts and wallet addresses. 
              Detect vulnerabilities, monitor transactions, and stay ahead of threats on Ethereum and Solana.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2"
              >
                <Bell className="w-5 h-5" />
                Join Waitlist
              </button>
              
              <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2">
                <Play className="w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <StatsCard
                value={stats.waitlistCount.toLocaleString()}
                label="Waitlist Members"
                icon={Users}
                color="bg-blue-500/20"
              />
              <StatsCard
                value={stats.verifiedCount.toLocaleString()}
                label="Verified Users"
                icon={CheckCircle}
                color="bg-green-500/20"
              />
              <StatsCard
                value="98.2%"
                label="Success Rate"
                icon={TrendingUp}
                color="bg-purple-500/20"
              />
              <StatsCard
                value="24/7"
                label="Monitoring"
                icon={Clock}
                color="bg-orange-500/20"
              />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose DeSpy AI?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Advanced security analysis powered by artificial intelligence for the modern blockchain ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Secure Your Assets?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of users already protecting their blockchain investments with DeSpy AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center gap-2"
              >
                Get Early Access
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <Link
                to="/dashboard"
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">DeSpy AI</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>© 2024 DeSpy AI. All rights reserved.</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleJoinWaitlist}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151',
          },
        }}
      />
    </div>
  );
} 