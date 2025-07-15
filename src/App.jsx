import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronRight, Shield, Lock, Eye, ShieldAlert } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

const DigitalRain = () => {
  useEffect(() => {
    const chars = '01'.split('')
    const rain = document.querySelector('.digital-rain')
    const createRainDrop = () => {
      const column = document.createElement('div')
      column.className = 'rain-column'
      column.style.left = `${Math.random() * 100}%`
      column.textContent = chars[Math.floor(Math.random() * chars.length)]
      rain.appendChild(column)
      setTimeout(() => rain.removeChild(column), 3000)
    }
    const interval = setInterval(createRainDrop, 100)
    return () => clearInterval(interval)
  }, [])
  return <div className="digital-rain" />
}

const ParticleEffect = () => {
  return (
    <div className="particle-container">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className={`particle particle-${i + 1}`}
          style={{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--duration': `${Math.random() * 20 + 10}s`,
            '--delay': `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  )
}

const FloatingIcons = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-1/4 left-1/4 opacity-10"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Shield size={200} strokeWidth={0.5} />
      </motion.div>
      <motion.div
        className="absolute top-2/3 right-1/4 opacity-10"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <Lock size={150} strokeWidth={0.5} />
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-1/3 opacity-10"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <Eye size={100} strokeWidth={0.5} />
      </motion.div>
    </div>
  )
}

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
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      if (!response.ok) throw new Error('Submission failed')
      toast.success('Joined waitlist successfully!', { 
        duration: 3000,
        style: { background: '#1a202c', color: '#e2e8f0' }
      })
      setIsModalOpen(false)
      setEmail('')
    } catch (error) {
      toast.error('Failed to join waitlist. Try again.', {
        duration: 3000,
        style: { background: '#1a202c', color: '#e2e8f0' }
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary text-gray-100 relative overflow-hidden font-sans perspective-1000">
      <Toaster position="top-center" />
      
      {/* Cybersecurity Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="hex-grid" />
        <DigitalRain />
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        <ParticleEffect />
        <FloatingIcons />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
        {/* Countdown Banner */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed top-0 left-0 w-full bg-secondary/40 backdrop-blur-md text-center py-3 z-50 border-b border-accent/20"
        >
          <div className="text-sm font-light tracking-wider">
            <span className="text-accent neon-text">Public Launch in </span>
            <motion.span 
              className="font-mono font-bold text-white inline-flex gap-1"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="bg-secondary/50 px-2 py-1 rounded">{timeLeft.days}d</span>:
              <span className="bg-secondary/50 px-2 py-1 rounded">{timeLeft.hours}h</span>:
              <span className="bg-secondary/50 px-2 py-1 rounded">{timeLeft.minutes}m</span>:
              <span className="bg-secondary/50 px-2 py-1 rounded">{timeLeft.seconds}s</span>
            </motion.span>
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto pt-16 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative inline-block"
          >
            <motion.div
              className="flex items-center justify-center gap-3 mb-6"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ShieldAlert size={48} className="text-accent" />
              <h1 className="text-7xl sm:text-8xl font-bold bg-gradient-to-r from-accent via-cyan-400 to-emerald-400 text-transparent bg-clip-text neon-text">
                DeSpy AI
              </h1>
            </motion.div>
            <div className="absolute -inset-4 bg-gradient-to-r from-accent to-emerald-400 opacity-20 blur-xl rounded-full"></div>
          </motion.div>
          
          <motion.p 
            className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Enterprise-Grade Web3 Security & Liquidity Protection
          </motion.p>

          <motion.button
            className="cyber-button group relative bg-transparent text-accent px-10 py-5 rounded-lg font-semibold text-lg shadow-xl hover:shadow-accent/25 transition-all duration-500"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
          >
            <span className="relative z-10 flex items-center gap-2 neon-text">
              Join the Waitlist 
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronRight className="inline" />
              </motion.span>
            </span>
          </motion.button>

          <motion.p 
            className="mt-8 text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Be the first to experience next-generation blockchain security
          </motion.p>
        </motion.div>
      </div>

      {/* Enhanced Waitlist Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-secondary/90 backdrop-blur-xl p-8 rounded-2xl max-w-md w-full border border-accent/20 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-6 neon-text">Join the Waitlist</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full px-4 py-4 bg-primary/50 border border-accent/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-accent transition-all duration-300"
                    placeholder="Enter your email"
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent to-emerald-400 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
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
                  className="cyber-button group relative w-full bg-transparent border-accent text-accent px-6 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10 neon-text">
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </span>
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}