// src/components/PredictionForm.jsx
import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, AlertCircle, Code2, ChevronDown } from 'lucide-react'
import { useData } from '../context/DataContext'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const buttonVariants = {
  rest: { scale: 1, rotateX: 0 },
  hover: { 
    scale: 1.02,
    rotateX: 5,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.98,
    rotateX: 2
  }
}

export default function PredictionForm({ resultsRef }) {
  const [mode, setMode] = useState('address')
  const [input, setInput] = useState('')
  const [chain, setChain] = useState('ethereum')
  const [isChainOpen, setIsChainOpen] = useState(false)
  const [error, setError] = useState('')
  const { loading, analyzeAddress, analyzeContract } = useData()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    
    if (!input.trim()) {
      setError('Please enter a valid address or contract code')
      return
    }

    if (mode === 'address') {
      // Basic address validation
      const addressRegex = /^0x[a-fA-F0-9]{40}$/
      if (!addressRegex.test(input.trim())) {
        setError('Please enter a valid Ethereum address (0x followed by 40 hex characters)')
        return
      }
      analyzeAddress(input.trim(), chain)
    } else {
      if (input.trim().length < 50) {
        setError('Please enter a valid contract code (minimum 50 characters)')
        return
      }
      analyzeContract(input.trim(), chain)
    }
    
    // Smooth scroll to results after a short delay
    setTimeout(() => {
      resultsRef?.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      })
    }, 800)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (error) setError('') // Clear error when user starts typing
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsChainOpen(false)
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="dashboard-card p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          AI-Powered Blockchain Analysis
        </h2>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
          Analyze wallet addresses and smart contracts for security risks, 
          transaction patterns, and potential vulnerabilities using advanced AI.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mode Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.button
            type="button"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setMode('address')}
            className={`relative overflow-hidden p-8 rounded-xl border transition-all duration-300 transform perspective-1000 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              mode === 'address'
                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-800/30 border-gray-700/50 text-gray-300 hover:border-gray-600/50 hover:bg-gray-800/50'
            }`}
            aria-pressed={mode === 'address'}
            aria-label="Select address analysis mode"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="p-3 bg-blue-500/20 rounded-xl"
              >
                <Search size={32} className="text-blue-400" aria-hidden="true" />
              </motion.div>
              <div className="text-center">
                <div className="font-semibold text-xl mb-2">Address Analysis</div>
                <div className="text-sm text-gray-400 leading-relaxed">
                  Analyze wallet addresses and token contracts for risk assessment
                </div>
              </div>
            </div>
            {mode === 'address' && (
              <motion.div
                className="absolute inset-0 border-2 border-blue-500/30 rounded-xl"
                layoutId="activeMode"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>

          <motion.button
            type="button"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setMode('contract')}
            className={`relative overflow-hidden p-8 rounded-xl border transition-all duration-300 transform perspective-1000 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
              mode === 'contract'
                ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/20'
                : 'bg-gray-800/30 border-gray-700/50 text-gray-300 hover:border-gray-600/50 hover:bg-gray-800/50'
            }`}
            aria-pressed={mode === 'contract'}
            aria-label="Select contract analysis mode"
          >
            <div className="flex flex-col items-center gap-4">
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
                className="p-3 bg-purple-500/20 rounded-xl"
              >
                <Code2 size={32} className="text-purple-400" aria-hidden="true" />
              </motion.div>
              <div className="text-center">
                <div className="font-semibold text-xl mb-2">Contract Scanner</div>
                <div className="text-sm text-gray-400 leading-relaxed">
                  Scan smart contracts for vulnerabilities and security issues
                </div>
              </div>
            </div>
            {mode === 'contract' && (
              <motion.div
                className="absolute inset-0 border-2 border-purple-500/30 rounded-xl"
                layoutId="activeMode"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        </div>

        {/* Chain Selection */}
        <div className="relative">
          <label htmlFor="chain-select" className="block text-sm font-semibold text-gray-200 mb-3">
            Blockchain Network
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsChainOpen(!isChainOpen)}
              onKeyDown={handleKeyDown}
              className="w-full flex items-center justify-between p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-left text-white hover:border-gray-600/70 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-haspopup="listbox"
              aria-expanded={isChainOpen}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${chain === 'ethereum' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                <span className="font-medium capitalize">{chain}</span>
              </div>
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 transition-transform ${isChainOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            <AnimatePresence>
              {isChainOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-xl"
                >
                  <div className="py-2">
                    <button
                      type="button"
                      onClick={() => {
                        setChain('ethereum')
                        setIsChainOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="font-medium">Ethereum</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChain('solana')
                        setIsChainOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-white hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="font-medium">Solana</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Field */}
        <div>
          <label htmlFor="analysis-input" className="block text-sm font-semibold text-gray-200 mb-3">
            {mode === 'address' ? 'Wallet Address' : 'Contract Code'}
          </label>
          <div className="relative">
            <textarea
              id="analysis-input"
              value={input}
              onChange={handleInputChange}
              placeholder={mode === 'address' 
                ? 'Enter Ethereum address (0x...) or Solana address' 
                : 'Paste smart contract code here...'
              }
              className="w-full p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 transition-colors"
              rows={mode === 'address' ? 2 : 8}
              style={{ minHeight: mode === 'address' ? '80px' : '200px' }}
            />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-8 left-0 flex items-center gap-2 text-red-400 text-sm"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>Analyzing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Search size={20} />
              <span>Start Analysis</span>
            </div>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}