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
      className="glass-panel p-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          AI-Powered Blockchain Analysis
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Analyze wallet addresses and smart contracts for security risks, 
          transaction patterns, and potential vulnerabilities using advanced AI.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mode Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.button
            type="button"
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            onClick={() => setMode('address')}
            className={`relative overflow-hidden p-6 rounded-xl border transition-all duration-300 transform perspective-1000 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              mode === 'address'
                ? 'bg-sky-600/10 border-sky-500/50 text-white shadow-lg shadow-sky-500/10'
                : 'bg-gray-900/50 border-gray-800/50 text-gray-300 hover:border-gray-700/50'
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
              >
                <Search size={32} className="text-sky-400" aria-hidden="true" />
              </motion.div>
              <div>
                <div className="font-medium text-lg">Address Analysis</div>
                <div className="text-sm text-gray-400 mt-2">
                  Analyze wallet addresses and token contracts for risk assessment
                </div>
              </div>
            </div>
            {mode === 'address' && (
              <motion.div
                className="absolute inset-0 border-2 border-sky-500/20 rounded-xl"
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
            className={`relative overflow-hidden p-6 rounded-xl border transition-all duration-300 transform perspective-1000 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              mode === 'contract'
                ? 'bg-purple-600/10 border-purple-500/50 text-white shadow-lg shadow-purple-500/10'
                : 'bg-gray-900/50 border-gray-800/50 text-gray-300 hover:border-gray-700/50'
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
              >
                <Code2 size={32} className="text-purple-400" aria-hidden="true" />
              </motion.div>
              <div>
                <div className="font-medium text-lg">Contract Scanner</div>
                <div className="text-sm text-gray-400 mt-2">
                  Scan smart contracts for vulnerabilities and security issues
                </div>
              </div>
            </div>
            {mode === 'contract' && (
              <motion.div
                className="absolute inset-0 border-2 border-purple-500/20 rounded-xl"
                layoutId="activeMode"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </motion.button>
        </div>

        {/* Chain Selection */}
        <div className="relative">
          <label htmlFor="chain-select" className="block text-sm font-medium text-gray-300 mb-2">
            Blockchain Network
          </label>
          <div className="relative">
            <button
              type="button"
              id="chain-select"
              onClick={() => setIsChainOpen(!isChainOpen)}
              onKeyDown={handleKeyDown}
              className="w-full bg-gray-900/50 border border-gray-800 rounded-lg px-4 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-haspopup="listbox"
              aria-expanded={isChainOpen}
              aria-label={`Selected chain: ${chain}`}
            >
              <div className="flex items-center justify-between">
                <span className="capitalize">{chain}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-gray-400 transition-transform ${isChainOpen ? 'rotate-180' : ''}`} 
                  aria-hidden="true" 
                />
              </div>
            </button>
            
            <AnimatePresence>
              {isChainOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-800 rounded-lg shadow-lg"
                  role="listbox"
                >
                  {['ethereum', 'polygon', 'bsc', 'arbitrum'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setChain(option)
                        setIsChainOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-800 focus:outline-none focus:bg-gray-800 ${
                        chain === option ? 'text-blue-400 bg-gray-800' : 'text-gray-300'
                      }`}
                      role="option"
                      aria-selected={chain === option}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input Field */}
        <div>
          <label htmlFor="analysis-input" className="block text-sm font-medium text-gray-300 mb-2">
            {mode === 'address' ? 'Wallet Address' : 'Contract Code'}
          </label>
          <div className="relative">
            <textarea
              id="analysis-input"
              value={input}
              onChange={handleInputChange}
              placeholder={mode === 'address' 
                ? 'Enter wallet address (e.g., 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6)' 
                : 'Paste your smart contract code here...'
              }
              rows={mode === 'address' ? 3 : 8}
              className={`w-full bg-gray-900/50 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                error ? 'border-red-500' : 'border-gray-800'
              }`}
              aria-describedby={error ? 'input-error' : 'input-help'}
              aria-invalid={error ? 'true' : 'false'}
            />
            {error && (
              <div id="input-error" className="flex items-center gap-2 mt-2 text-red-400 text-sm" role="alert">
                <AlertCircle size={16} aria-hidden="true" />
                {error}
              </div>
            )}
            <div id="input-help" className="mt-2 text-sm text-gray-400">
              {mode === 'address' 
                ? 'Enter a valid Ethereum address to analyze wallet behavior and risk factors'
                : 'Paste your Solidity smart contract code to scan for vulnerabilities and security issues'
              }
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
          disabled={loading || !input.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={loading ? 'Analyzing...' : `Analyze ${mode === 'address' ? 'address' : 'contract'}`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" aria-hidden="true" />
              <span>Analyzing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Search size={20} aria-hidden="true" />
              <span>Analyze {mode === 'address' ? 'Address' : 'Contract'}</span>
            </div>
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}