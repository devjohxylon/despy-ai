// src/components/PredictionForm.jsx
import { useState } from 'react'
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

export default function PredictionForm() {
  const [input, setInput] = useState('')
  const [chain, setChain] = useState('ethereum')
  const [mode, setMode] = useState('address')
  const [isChainOpen, setIsChainOpen] = useState(false)
  const { loading, error, analyzeAddress, analyzeContract } = useData()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      if (mode === 'address') {
        analyzeAddress(input.trim(), chain)
      } else {
        analyzeContract(input.trim(), chain)
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] relative">
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

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative w-full max-w-4xl mx-4"
      >
        <form onSubmit={handleSubmit} className="relative glass-panel p-8 rounded-xl backdrop-blur-xl border border-white/5">
          <motion.div className="space-y-6" variants={itemVariants}>
            <div className="text-center mb-8">
              <motion.h2 
                className="text-2xl font-semibold bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Choose Your Analysis Mode
              </motion.h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.button
                type="button"
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={() => setMode('address')}
                className={`relative overflow-hidden p-6 rounded-xl border transition-all duration-300 transform perspective-1000 ${
                  mode === 'address'
                    ? 'bg-sky-600/10 border-sky-500/50 text-white shadow-lg shadow-sky-500/10'
                    : 'bg-gray-900/50 border-gray-800/50 text-gray-400 hover:border-gray-700/50'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Search size={32} className="text-sky-400" />
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
                className={`relative overflow-hidden p-6 rounded-xl border transition-all duration-300 transform perspective-1000 ${
                  mode === 'contract'
                    ? 'bg-purple-600/10 border-purple-500/50 text-white shadow-lg shadow-purple-500/10'
                    : 'bg-gray-900/50 border-gray-800/50 text-gray-400 hover:border-gray-700/50'
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{
                      rotateY: [0, 360],
                      transition: { duration: 3, repeat: Infinity, ease: "linear" }
                    }}
                  >
                    <Code2 size={32} className="text-purple-400" />
                  </motion.div>
                  <div>
                    <div className="font-medium text-lg">Contract Scanner</div>
                    <div className="text-sm text-gray-400 mt-2">
                      Scan smart contract code for vulnerabilities and security risks
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

            <motion.div 
              className="space-y-4 mt-8"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-300">
                  {mode === 'address' ? 'Address Details' : 'Contract Code'}
                </h3>
                {mode === 'address' && (
                  <div className="relative">
                    <motion.button
                      type="button"
                      onClick={() => setIsChainOpen(!isChainOpen)}
                      className="flex items-center gap-2 bg-gray-900/50 text-gray-300 border border-gray-800 rounded-lg py-2 px-4 focus:outline-none focus:border-sky-600 transition-colors duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-sm">{chain.charAt(0).toUpperCase() + chain.slice(1)}</span>
                      <motion.div
                        animate={{ rotate: isChainOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </motion.button>
                    
                    <AnimatePresence>
                      {isChainOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-full bg-gray-900 border border-gray-800 rounded-lg shadow-xl z-10"
                        >
                          {['ethereum', 'solana'].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setChain(option)
                                setIsChainOpen(false)
                              }}
                              className={`w-full text-left px-4 py-2 text-sm first:rounded-t-lg last:rounded-b-lg hover:bg-gray-800 transition-colors ${
                                chain === option ? 'text-sky-400' : 'text-gray-300'
                              }`}
                            >
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {mode === 'address' ? (
                  <motion.div
                    key="address-input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="relative"
                  >
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={`Enter ${chain} address to analyze...`}
                      className="w-full bg-gray-900/50 text-gray-300 border border-gray-800 rounded-lg p-4 focus:outline-none focus:border-sky-600 transition-all duration-200 placeholder-gray-600"
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      Enter a wallet address or token contract address to analyze its risk profile
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="contract-input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="relative"
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Paste your smart contract code here..."
                      className="w-full bg-gray-900/50 text-gray-300 border border-gray-800 rounded-lg p-4 h-64 font-mono text-sm focus:outline-none focus:border-purple-600 transition-all duration-200 placeholder-gray-600"
                    />
                    <div className="mt-2 text-sm text-gray-500">
                      Paste your Solidity smart contract code to scan for vulnerabilities
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div 
              className="flex items-center justify-end gap-4 mt-8"
              variants={itemVariants}
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || !input.trim()}
                className={`relative overflow-hidden px-8 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] ${
                  mode === 'address' 
                    ? 'bg-gradient-to-r from-sky-600 to-sky-400'
                    : 'bg-gradient-to-r from-purple-600 to-purple-400'
                }`}
              >
                <motion.div
                  className="absolute inset-0 bg-white mix-blend-overlay"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 2, opacity: 0.1 }}
                  transition={{ duration: 0.3 }}
                />
                <span className="relative flex items-center justify-center gap-2">
                  {mode === 'address' ? <Search size={18} /> : <Code2 size={18} />}
                  <span>
                    {loading 
                      ? mode === 'address' ? 'Analyzing...' : 'Scanning...'
                      : mode === 'address' ? 'Analyze' : 'Scan'
                    }
                  </span>
                </span>
              </motion.button>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-red-400 bg-red-950/20 px-4 py-3 rounded-lg mt-4"
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </form>
      </motion.div>
    </div>
  )
}