// src/components/ContractScanner.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

export default function ContractScanner() {
  const [contractCode, setContractCode] = useState('')
  const [scanResult, setScanResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const scanContract = async () => {
    if (!contractCode.trim()) {
      setError('Please enter contract code to scan')
      return
    }

    if (contractCode.trim().length < 50) {
      setError('Contract code must be at least 50 characters long')
      return
    }

    setLoading(true)
    setError('')
    setScanResult('')

    try {
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      let result = ''
      let hasIssues = false
      const lines = contractCode.split('\n')

      lines.forEach((line, index) => {
        const trimmedLine = line.trim().toLowerCase()
        
        // Check for common vulnerabilities
        if (trimmedLine.includes('selfdestruct') || trimmedLine.includes('suicide')) {
          result += `HIGH (Line ${index + 1}): Self-destruct function detected in '${trimmedLine}'. This can lead to permanent loss of funds.\n`
          hasIssues = true
        }
        
        if (trimmedLine.includes('delegatecall') && !trimmedLine.includes('//')) {
          result += `HIGH (Line ${index + 1}): Unchecked delegatecall in '${trimmedLine}'. Potential for arbitrary code execution.\n`
          hasIssues = true
        }
        
        if (trimmedLine.includes('tx.origin') && !trimmedLine.includes('//')) {
          result += `MEDIUM (Line ${index + 1}): tx.origin usage in '${trimmedLine}'. Use msg.sender instead for authentication.\n`
          hasIssues = true
        }
        
        if (trimmedLine.includes('block.timestamp') && !trimmedLine.includes('//')) {
          result += `MEDIUM (Line ${index + 1}): block.timestamp in '${trimmedLine}'. Can be manipulated by miners.\n`
          hasIssues = true
        }
        
        if (trimmedLine.includes('reentrancy') || trimmedLine.includes('re-entrancy')) {
          result += `HIGH (Line ${index + 1}): Potential reentrancy vulnerability in '${trimmedLine}'.\n`
          hasIssues = true
        }
        
        // Missing events for state changes
        if (trimmedLine.includes('state') && !trimmedLine.includes('emit')) {
          result += `LOW (Line ${index + 1}): State change in '${trimmedLine}' lacks event emission for transparency.\n`
          hasIssues = true
        }
      })

      if (!hasIssues) {
        result += 'No critical vulnerabilities detected. Advanced audit recommended for full validation.'
      }
      setScanResult(result)
    } catch (err) {
      setError('Error scanning contract: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setContractCode(e.target.value)
    if (error) setError('') // Clear error when user starts typing
  }

  const getVulnerabilityCount = () => {
    if (!scanResult) return 0
    return (scanResult.match(/HIGH|MEDIUM|LOW/g) || []).length
  }

  const getSeverityLevel = () => {
    const count = getVulnerabilityCount()
    if (count === 0) return 'none'
    if (scanResult.includes('HIGH')) return 'high'
    if (scanResult.includes('MEDIUM')) return 'medium'
    return 'low'
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Smart Contract Scanner</h2>
        <p className="text-gray-300">Analyze Solidity contracts for security vulnerabilities and best practices</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="contract-code" className="block text-sm font-medium text-gray-300 mb-2">
            Contract Code
          </label>
          <motion.textarea
            id="contract-code"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            value={contractCode}
            onChange={handleInputChange}
            placeholder="Paste your Solidity smart contract code here..."
            className={`w-full h-64 bg-gray-900/50 text-gray-300 border rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-none ${
              error ? 'border-red-500' : 'border-gray-800'
            }`}
            aria-describedby={error ? 'contract-error' : 'contract-help'}
            aria-invalid={error ? 'true' : 'false'}
          />
          {error && (
            <div id="contract-error" className="flex items-center gap-2 mt-2 text-red-400 text-sm" role="alert">
              <XCircle size={16} aria-hidden="true" />
              {error}
            </div>
          )}
          <div id="contract-help" className="mt-2 text-sm text-gray-400">
            Paste your Solidity contract code to scan for common vulnerabilities and security issues
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={scanContract}
            disabled={loading || !contractCode.trim()}
            className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={loading ? 'Scanning contract...' : 'Scan contract for vulnerabilities'}
          >
            <Search size={18} aria-hidden="true" />
            <span>{loading ? 'Scanning...' : 'Scan Contract'}</span>
          </motion.button>
        </div>
      </div>

      {scanResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Scan Summary */}
          <div className={`p-4 rounded-lg border ${
            getSeverityLevel() === 'high' ? 'border-red-500/20 bg-red-500/10' :
            getSeverityLevel() === 'medium' ? 'border-yellow-500/20 bg-yellow-500/10' :
            getSeverityLevel() === 'low' ? 'border-blue-500/20 bg-blue-500/10' :
            'border-green-500/20 bg-green-500/10'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {getSeverityLevel() === 'none' ? (
                <CheckCircle className="w-5 h-5 text-green-400" aria-hidden="true" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-400" aria-hidden="true" />
              )}
              <h3 className="text-lg font-semibold text-white">
                Scan Results
              </h3>
            </div>
            <p className="text-gray-300">
              {getVulnerabilityCount() === 0 
                ? 'No vulnerabilities detected'
                : `${getVulnerabilityCount()} potential issue${getVulnerabilityCount() > 1 ? 's' : ''} found`
              }
            </p>
          </div>

          {/* Detailed Results */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Detailed Analysis</h4>
            <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap leading-relaxed">
              {scanResult}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  )
}