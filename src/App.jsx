import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import DashboardPage from './components/DashboardPage'

// Landing Page Component
function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState('')

  const countdown = new Date('2025-09-01').getTime()
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = countdown - Date.now()
    return difference > 0 ? {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    } : { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  const validateEmail = (value) => {
    if (!value) return 'Email is required'
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) return 'Invalid email address'
    return ''
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    setEmailError(validateEmail(value))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateEmail(email)
    if (validationError) {
      setEmailError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Joined waitlist successfully!', { 
        duration: 3000,
        style: { background: '#141B2D', color: '#F8FAFC' }
      })
      setIsModalOpen(false)
      setEmail('')
    } catch (error) {
      toast.error('Failed to join waitlist. Try again.', {
        duration: 3000,
        style: { background: '#141B2D', color: '#F8FAFC' }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-50 relative overflow-hidden font-sans">
      <Toaster position="top-center" />
      
      {/* Animated background effects */}
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
        <motion.div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 80% 20%, #1E40AF 0%, transparent 40%)',
            filter: 'blur(100px)',
            opacity: 0.05
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.05, 0.07, 0.05]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Hero Content */}
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
            className="flex justify-center pt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-lg flex items-center gap-2"
            >
              Join the Waitlist <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        </div>

        {/* Countdown Banner - Now at bottom center */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute bottom-12 left-0 right-0 z-50 text-gray-400"
        >
          <div className="text-base sm:text-lg font-light tracking-wider text-center">
            <span className="text-gray-300">Public Launch in </span>
            <motion.div 
              className="font-mono font-medium text-gray-200 flex gap-3 justify-center items-center mt-4"
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex flex-col items-center">
                <span className="bg-gray-900/30 px-4 py-2 rounded text-2xl sm:text-3xl min-w-[3ch] text-center">{timeLeft.days}</span>
                <span className="text-sm mt-1 text-gray-400">days</span>
              </div>
              <span className="text-2xl sm:text-3xl text-gray-500">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-gray-900/30 px-4 py-2 rounded text-2xl sm:text-3xl min-w-[3ch] text-center">{timeLeft.hours}</span>
                <span className="text-sm mt-1 text-gray-400">hours</span>
              </div>
              <span className="text-2xl sm:text-3xl text-gray-500">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-gray-900/30 px-4 py-2 rounded text-2xl sm:text-3xl min-w-[3ch] text-center">{timeLeft.minutes}</span>
                <span className="text-sm mt-1 text-gray-400">mins</span>
              </div>
              <span className="text-2xl sm:text-3xl text-gray-500">:</span>
              <div className="flex flex-col items-center">
                <span className="bg-gray-900/30 px-4 py-2 rounded text-2xl sm:text-3xl min-w-[3ch] text-center">{timeLeft.seconds}</span>
                <span className="text-sm mt-1 text-gray-400">secs</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Waitlist Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
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
    </div>
  )
}

// Main App Component with Routing
export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}