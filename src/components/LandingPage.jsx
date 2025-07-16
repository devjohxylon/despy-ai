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

import React, { useState, useEffect, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import analytics from '../utils/analytics'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { toast, Toaster } from 'react-hot-toast'

// Memoized background component for better performance
const AnimatedBackground = memo(() => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-gradient-radial from-blue-950/5 via-transparent to-transparent" />
    <motion.div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #1E40AF 0%, transparent 50%)',
        filter: 'blur(120px)',
        opacity: 0.07
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.07, 0.05, 0.07]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    {/* 3D Animated Laptop */}
    <div className="absolute inset-0 flex items-center justify-end pointer-events-none pr-20">
      <motion.div
        className="relative w-80 h-56"
        animate={{
          y: [0, -8, 0],
          rotateY: [0, 8, 0],
          rotateX: [0, -3, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Laptop Base */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-40 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-2xl">
          <div className="absolute inset-2 bg-gradient-to-b from-gray-700 to-gray-800 rounded-md"></div>
          {/* Keyboard */}
          <div className="absolute bottom-3 left-3 right-3 h-6 bg-gray-600 rounded-sm opacity-60"></div>
          {/* Trackpad */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-gray-700 rounded-sm opacity-40"></div>
        </div>
        
        {/* Laptop Screen */}
        <motion.div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-40 bg-gradient-to-b from-gray-900 to-gray-800 rounded-t-lg shadow-2xl"
          animate={{
            rotateX: [0, -12, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-2 bg-gradient-to-b from-blue-900/20 to-purple-900/20 rounded-md">
            {/* Screen Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-60"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0.8, 0.6]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </motion.div>
        
        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg"
          animate={{
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  </div>
))

// Memoized countdown timer component to prevent unnecessary re-renders
const CountdownTimer = memo(({ timeLeft }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="text-center text-gray-400"
  >
    <div className="text-base sm:text-lg font-light tracking-wider text-center">
      <span className="text-gray-300">Public Launch in </span>
      <motion.div 
        className="font-mono font-medium text-gray-200 flex gap-3 justify-center items-center mt-4"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {Object.entries(timeLeft).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <div className="flex flex-col items-center">
              <span className="bg-gray-900/30 px-4 py-2 rounded text-2xl sm:text-3xl min-w-[3ch] text-center">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-sm mt-1 text-gray-400">{key}</span>
            </div>
            {key !== 'seconds' && <span className="text-2xl sm:text-3xl text-gray-500 mx-1">:</span>}
          </div>
        ))}
      </motion.div>
    </div>
  </motion.div>
))

// Smaller countdown banner component
const CountdownBanner = memo(({ timeLeft }) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="text-center"
  >
    <div className="text-xs font-light tracking-wide text-gray-200">
      <span className="text-gray-100">Launch in </span>
      <motion.div 
        className="font-mono font-medium text-gray-50 flex gap-1.5 justify-center items-center mt-1"
        animate={{ opacity: [0.95, 1, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {Object.entries(timeLeft).map(([key, value]) => (
          <div key={key} className="flex items-center">
            <div className="flex flex-col items-center">
              <span className="bg-gray-800/30 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs min-w-[1.5ch] text-center border border-gray-700/30">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-xs mt-0.5 text-gray-300">{key}</span>
            </div>
            {key !== 'seconds' && <span className="text-xs text-gray-400 mx-0.5">:</span>}
          </div>
        ))}
      </motion.div>
    </div>
  </motion.div>
))

// Memoized modal component for email collection
const WaitlistModal = memo(({ isOpen, onClose, onSubmit }) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState('')

  const validateEmail = useCallback((value) => {
    if (!value) return 'Email is required'
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) return 'Invalid email address'
    return ''
  }, [])

  const handleEmailChange = useCallback((e) => {
    const value = e.target.value
    setEmail(value)
    setEmailError(validateEmail(value))
  }, [validateEmail])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateEmail(email)
    if (validationError) {
      setEmailError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(email)
      setEmail('')
    } finally {
      setIsSubmitting(false)
    }
  }

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
  )
})

// Main LandingPage component
export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(0);
  
  // Set countdown target date - Update this when launch date changes
  const countdown = new Date('2025-09-01').getTime()
  
  // Initialize countdown state with current time difference
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft())

  /**
   * Calculates time remaining until the countdown target date
   * Returns an object with days, hours, minutes, and seconds
   * Falls back to zero values if the target date has passed
   */
  function calculateTimeLeft() {
    const difference = countdown - Date.now()
    return difference > 0 ? {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    } : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  // Update countdown every second
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(timer) // Cleanup interval on unmount
  }, [])

  // fetch waitlist stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/waitlist/stats');
        if (res.ok) {
          const data = await res.json();
          setWaitlistCount(data.total || 0);
        }
      } catch (e) {
        setWaitlistCount(127); // placeholder
      }
    };
    fetchStats();
  }, []);

  const track = (name, params={}) => analytics.trackEvent(name, params);

  const handleSocialClick = (platform, url) => {
    track('button_click', { button: platform});
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /**
   * Handles waitlist form submission
   * Sends email to backend API and shows appropriate toast message
   * @param {string} email - User's email address
   */
  const handleWaitlistSubmit = useCallback(async (email) => {
    try {
      const response = await fetch('http://localhost:3001/api/waitlist', {
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

      toast.success('Joined waitlist successfully!', { 
        duration: 3000,
        style: { background: '#141B2D', color: '#F8FAFC' }
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Waitlist error:', error);
      toast.error(error.message || 'Failed to join waitlist', {
        duration: 3000,
        style: { background: '#141B2D', color: '#F8FAFC' }
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-50 relative overflow-hidden font-sans">
      {/* Toast container for notifications */}
      <Toaster position="top-center" />
      
      {/* Dynamic background with gradient animations */}
      <AnimatedBackground />
      
      {/* Countdown Banner */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-900/80 via-purple-900/75 to-blue-900/80 backdrop-blur-lg border-b border-blue-700/30 py-2">
        <CountdownBanner timeLeft={timeLeft} />
      </div>

      {/* Main content container */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Hero section with animated title */}
        <div className="text-center space-y-6">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl sm:text-7xl md:text-8xl font-bold mb-8"
          >
            <motion.span 
              className="text-[#3B82F6] inline-block"
              animate={{ 
                opacity: [0.9, 1, 0.9],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              DeSpy AI
            </motion.span>
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="space-y-4"
          >
            <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              Protect your assets with AI-powered blockchain analysis, smart contract scanning,
              and real-time security monitoring.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-lg flex items-center gap-2"
            >
              Join the Waitlist <ChevronRight size={20} />
            </motion.button>

            <Link
              to="/dashboard"
              onClick={() => track('button_click', { button: 'demo' })}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium rounded-lg"
            >
              Try Demo
            </Link>
          </motion.div>

          {/* Waitlist count */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 mb-16 text-sm text-gray-400"
          >
            {waitlistCount.toLocaleString()} amazing people waiting
          </motion.p>
        </div>

        {/* Countdown display */}
        <div className="mb-2">
          {/* The CountdownTimer component is now rendered as a banner, so this div is no longer needed */}
        </div>
      </div>

      {/* Social links */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-10 text-gray-500">
        <button onClick={() => handleSocialClick('twitter', 'https://x.com/DeSpyAI')} className="hover:text-blue-400 transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
        </button>
        <button onClick={() => handleSocialClick('github', 'https://github.com/devjohxylon/despy-ai')} className="hover:text-gray-300 transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
        </button>
        <button onClick={() => handleSocialClick('discord', 'https://discord.gg/jNTHCjStaS')} className="hover:text-purple-400 transition-colors">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/></svg>
        </button>
      </div>

      {/* Waitlist modal */}
      <WaitlistModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleWaitlistSubmit}
      />
    </div>
  )
} 