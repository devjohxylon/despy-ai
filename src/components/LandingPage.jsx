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
import { ChevronRight, Shield, Lock, Eye, Zap, Clock, Bell, LineChart } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import analytics from '../utils/analytics';

// Simplified background with reduced animations
const AnimatedBackground = memo(() => (
  <div className="fixed inset-0 w-full min-h-screen overflow-hidden">
    <div className="absolute inset-0 bg-[#0B0F17]" />
    <div 
      className="absolute inset-0 bg-gradient-radial from-blue-950/5 via-transparent to-transparent"
      style={{ transform: 'translateZ(0)' }}
    />
    <motion.div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #1E40AF 0%, transparent 70%)',
        filter: 'blur(100px)',
        opacity: 0.07,
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
      animate={{
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    
    <motion.div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(circle at 80% 80%, #8B5CF6 0%, transparent 70%)',
        filter: 'blur(100px)',
        opacity: 0.05,
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
      animate={{
        scale: [1.05, 1, 1.05]
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </div>
));

// Optimized countdown timer component
const CountdownTimer = memo(() => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    function calculateTimeLeft() {
      // Set to September 1st, 2025 at 00:00:00
      const targetDate = new Date(2025, 8, 1).getTime(); // Month is 0-based, so 8 = September
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

    // Calculate immediately
    calculateTimeLeft();
    
    // Then update every second
    const id = setInterval(calculateTimeLeft, 1000);
    
    // Cleanup on unmount
    return () => clearInterval(id);
  }, []);

  const addLeadingZero = (value) => String(value).padStart(2, '0');

  return (
    <div className="text-center">
      <div className="text-base sm:text-lg font-light tracking-wider text-center flex items-center justify-center gap-3">
        <span className="text-gray-400">Launch in</span>
        <div className="font-mono flex items-center gap-3">
          <TimeUnit value={timeLeft.days} label="days" />
          <TimeUnit value={timeLeft.hours} label="hours" />
          <TimeUnit value={timeLeft.minutes} label="minutes" />
          <TimeUnit value={timeLeft.seconds} label="seconds" />
        </div>
      </div>
    </div>
  );
});

// Simple time unit display component
const TimeUnit = memo(({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="bg-[#3B82F6] bg-opacity-20 backdrop-blur-sm px-3 py-1.5 rounded min-w-[3ch] text-center">
      <span className="text-[#3B82F6] font-medium text-lg sm:text-xl">
        {String(value).padStart(2, '0')}
      </span>
    </div>
    <span className="text-xs mt-1 text-gray-500 uppercase tracking-wider">{label}</span>
  </div>
));

// Memoized modal component for email collection
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
    setEmailError(''); // Clear any previous errors
    
    try {
      console.log('Modal: Starting submission...');
      await onSubmit(email);
      console.log('Modal: Submission successful');
      setEmail('');
      // Success! The parent will handle closing the modal
    } catch (error) {
      console.error('Modal: Waitlist submission error:', error);
      setEmailError(error.message || 'Failed to join waitlist');
    } finally {
      console.log('Modal: Setting isSubmitting to false');
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
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="bg-[#0B0F17] border border-gray-800 p-8 max-w-md w-full rounded-xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-50">Join the Waitlist</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className="w-full bg-gray-900/50 border border-gray-800 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  required
                />
                {emailError && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-2"
                  >
                    {emailError}
                  </motion.p>
                )}
              </div>
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-3 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-lg"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

// Optimize SecurityFeature component
const SecurityFeature = memo(({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-900/30 backdrop-blur-sm border border-gray-800/20"
    style={{ willChange: 'transform, opacity' }}
  >
    <div className="p-3 rounded-full bg-blue-500/10 mb-4">
      <Icon className="w-6 h-6 text-blue-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-200 mb-2">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </motion.div>
));

// Optimize RoadmapItem component
const RoadmapItem = memo(({ date, title, status, description }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.5 }}
    className="flex gap-4 relative"
    style={{ willChange: 'transform, opacity' }}
  >
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full ${
        status === 'completed' ? 'bg-green-500' :
        status === 'current' ? 'bg-blue-500' :
        'bg-gray-600'
      }`} />
      <div className="w-0.5 h-full bg-gray-800 absolute top-3" />
    </div>
    <div className="pb-8">
      <span className="text-sm text-gray-500">{date}</span>
      <h3 className="text-lg font-semibold text-gray-200 mt-1">{title}</h3>
      <p className="text-gray-400 mt-2 text-sm">{description}</p>
    </div>
  </motion.div>
));

// Main component with optimized countdown logic
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);
  
  // Set countdown target date - September 1st, 2025
  const targetDate = new Date(2025, 8, 1).getTime(); // Month is 0-based, so 8 = September
  
  // Initialize countdown state
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = Date.now();
    const difference = Math.max(0, targetDate - now);
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  });

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const difference = Math.max(0, targetDate - now);
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // Fetch waitlist stats
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
        setWaitlistCount(0);
      }
    };
    fetchStats();
  }, []);

  const handleSocialClick = useCallback((platform, url) => {
    analytics.socialClick(platform);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleWaitlistSubmit = useCallback(async (email) => {
    console.log('Parent: Starting waitlist submission for:', email);
    try {
      analytics.waitlist.submit(email);

      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      let data;
      const responseText = await response.text();
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        console.error('Response text:', responseText);
        
        throw new Error(`Server error (${response.status}): ${responseText.substring(0, 100)}`);
      }
      
      console.log('API Response:', { status: response.status, data });
      
      if (!response.ok) {
        console.log('API returned error:', data.error);
        throw new Error(data.error || 'Failed to join waitlist');
      }

      analytics.waitlist.success(email);
      
      console.log('Success! Closing modal and showing toast...');
      
      toast.success('Successfully joined the waitlist! Check your email.', {
        duration: 5000,
        style: { background: '#1F2937', color: '#F3F4F6' }
      });

      setWaitlistCount(prev => prev + 1);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Parent: Waitlist error:', error);
      
      analytics.waitlist.error(email, error.message);
      
      // Let the modal handle the error display instead of showing toast
      throw error;
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-50 relative overflow-hidden font-sans flex flex-col">
      <Toaster position="top-center" />
      <AnimatedBackground />

      {/* Countdown banner */}
      <div className="relative w-full bg-[#0B0F17]/80 backdrop-blur-sm border-b border-gray-800/20 py-3">
        <div className="container mx-auto px-4">
          <CountdownTimer />
        </div>
      </div>
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] flex items-center justify-center px-4 py-20">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-6xl sm:text-7xl md:text-8xl font-bold"
              >
                <motion.span 
                  className="text-[#3B82F6] inline-block"
                  animate={{ opacity: [0.9, 1, 0.9] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  DeSpy AI
                </motion.span>
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto"
              >
                Protect your assets with AI-powered blockchain analysis, smart contract scanning,
                and real-time security monitoring.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                className="flex justify-center items-center pt-8"
              >
                {!isAuthenticated ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="px-8 py-4 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-lg flex items-center gap-2 text-lg"
                    style={{ willChange: 'transform' }}
                  >
                    Join the Waitlist <ChevronRight size={24} />
                  </motion.button>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => analytics.trackEvent('button_click', { button: 'dashboard' })}
                    className="px-8 py-4 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-lg flex items-center gap-2 text-lg"
                  >
                    Go to Dashboard <ChevronRight size={24} />
                  </Link>
                )}
              </motion.div>

              {/* Waitlist count */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-base text-gray-400"
              >
                {waitlistCount.toLocaleString()} amazing people waiting
              </motion.p>
            </div>
          </div>
        </section>

        {/* Security Highlights Section */}
        <section className="relative py-32 px-4 bg-gradient-to-b from-transparent to-gray-900/20">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">Security First Approach</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Our comprehensive security features protect your assets with advanced AI and real-time monitoring.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <SecurityFeature
                icon={Shield}
                title="Smart Contract Scanning"
                description="Advanced vulnerability detection using AI-powered static and dynamic analysis"
              />
              <SecurityFeature
                icon={Eye}
                title="Real-time Monitoring"
                description="24/7 blockchain surveillance with instant alerts for suspicious activities"
              />
              <SecurityFeature
                icon={Zap}
                title="Flash Loan Detection"
                description="Identify and prevent flash loan attacks before they impact your assets"
              />
              <SecurityFeature
                icon={Lock}
                title="Access Control Analysis"
                description="Verify contract ownership and privilege levels for potential security risks"
              />
              <SecurityFeature
                icon={Bell}
                title="Instant Alerts"
                description="Receive immediate notifications for any security threats or suspicious transactions"
              />
              <SecurityFeature
                icon={LineChart}
                title="Risk Analytics"
                description="Comprehensive risk scoring and analysis for all blockchain interactions"
              />
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="relative py-32 px-4 mb-24">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">Development Roadmap</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Our journey to revolutionize blockchain security and analysis.
              </p>
            </motion.div>

            <div className="space-y-8 pl-4">
              <RoadmapItem
                date="Q1 2024"
                title="Platform Development"
                status="completed"
                description="Core platform development, including smart contract scanning engine and real-time monitoring system."
              />
              <RoadmapItem
                date="Q2 2024"
                title="Beta Launch"
                status="current"
                description="Limited beta release for early access users with core security features and monitoring capabilities."
              />
              <RoadmapItem
                date="Q3 2024"
                title="Advanced Features"
                status="upcoming"
                description="Release of advanced features including AI-powered risk prediction and cross-chain monitoring."
              />
              <RoadmapItem
                date="Q4 2024"
                title="Public Launch"
                status="upcoming"
                description="Full public launch with complete feature set and enterprise-grade security tools."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Social Links */}
      <footer className="relative py-8 bg-[#0B0F17]/80 backdrop-blur-sm border-t border-gray-800/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-10 text-gray-500">
            <button 
              onClick={() => handleSocialClick('twitter', 'https://x.com/DeSpyAI')} 
              className="hover:text-blue-400 transition-colors p-2 hover:scale-110 transform duration-200"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
            <button 
              onClick={() => handleSocialClick('github', 'https://github.com/devjohxylon/despy-ai')} 
              className="hover:text-gray-300 transition-colors p-2 hover:scale-110 transform duration-200"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            <button 
              onClick={() => handleSocialClick('discord', 'https://discord.gg/jNTHCjStaS')} 
              className="hover:text-purple-400 transition-colors p-2 hover:scale-110 transform duration-200"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/>
              </svg>
            </button>
          </div>
        </div>
      </footer>

      <WaitlistModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleWaitlistSubmit}
      />
    </div>
  );
} 