import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function Home() {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-50 relative overflow-hidden font-sans">
      <Toaster position="top-center" />
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-blue-950/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
        {/* Countdown Banner */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-0 left-0 w-full glass-panel py-3 z-50"
        >
          <div className="container mx-auto px-4">
            <div className="text-sm font-light tracking-wider text-center">
              <span className="text-gray-300">Public Launch in </span>
              <motion.span 
                className="font-mono font-medium text-white inline-flex gap-2"
                animate={{ scale: [1, 1.01, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="bg-gray-900/50 px-3 py-1 rounded">{timeLeft.days}d</span>
                <span className="text-gray-400">:</span>
                <span className="bg-gray-900/50 px-3 py-1 rounded">{timeLeft.hours}h</span>
                <span className="text-gray-400">:</span>
                <span className="bg-gray-900/50 px-3 py-1 rounded">{timeLeft.minutes}m</span>
                <span className="text-gray-400">:</span>
                <span className="bg-gray-900/50 px-3 py-1 rounded">{timeLeft.seconds}s</span>
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative mb-8"
          >
            <motion.h1 
              className="text-8xl sm:text-[12rem] font-bold heading-gradient leading-none"
              animate={{ 
                textShadow: [
                  "0 0 20px rgba(56, 189, 248, 0.2)",
                  "0 0 40px rgba(56, 189, 248, 0.3)",
                  "0 0 20px rgba(56, 189, 248, 0.2)"
                ]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              DeSpy AI
            </motion.h1>
          </motion.div>
          
          <motion.p 
            className="text-xl sm:text-3xl text-gray-400 mb-16 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Enterprise-Grade Web3 Security & Liquidity Protection Platform
          </motion.p>

          <motion.button
            className="btn-primary group relative text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
          >
            <span className="relative z-10 flex items-center gap-2">
              Join the Waitlist 
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronRight className="inline" />
              </motion.span>
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Waitlist Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="glass-panel p-8 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-50">Join the Waitlist</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="input-field"
                    placeholder="Enter your email"
                    required
                  />
                  {emailError && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-danger text-sm mt-2"
                    >
                      {emailError}
                    </motion.p>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full"
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