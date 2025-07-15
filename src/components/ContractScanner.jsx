// src/components/ContractScanner.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

export default function ContractScanner() {
  const [contractCode, setContractCode] = useState('')
  const [scanResult, setScanResult] = useState('')
  const [loading, setLoading] = useState(false)

  const scanContract = () => {
    setLoading(true)
    setScanResult('')
    try {
      const lines = contractCode.split('\n')
      let result = 'Advanced Smart Contract Scan Report:\n'
      let hasIssues = false

      // Advanced vulnerability checks inspired by Slither
      lines.forEach((line, index) => {
        const trimmedLine = line.trim()

        // Reentrancy detection (e.g., unprotected external calls)
        if (trimmedLine.includes('transfer') || trimmedLine.includes('send') || trimmedLine.includes('call')) {
          if (!trimmedLine.includes('require') && !trimmedLine.includes('revert')) {
            result += `CRITICAL (Line ${index + 1}): Potential reentrancy vulnerability detected in '${trimmedLine.split('(')[0]}' without protection.\n`
            hasIssues = true
          }
        }

        // Integer overflow/underflow (simplified)
        if ((trimmedLine.includes('++') || trimmedLine.includes('--')) && !trimmedLine.includes('SafeMath')) {
          result += `HIGH (Line ${index + 1}): Possible integer overflow/underflow in '${trimmedLine}' without SafeMath.\n`
          hasIssues = true
        }

        // Unchecked external calls
        if (trimmedLine.includes('.call') || trimmedLine.includes('.delegatecall')) {
          if (!trimmedLine.includes('require') && !trimmedLine.includes('revert')) {
            result += `MEDIUM (Line ${index + 1}): Unchecked external call in '${trimmedLine}' may lead to exploits.\n`
            hasIssues = true
          }
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
      setScanResult('Error scanning contract: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <motion.textarea
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        value={contractCode}
        onChange={(e) => setContractCode(e.target.value)}
        placeholder="Paste your Solidity smart contract code here..."
        className="w-full h-64 bg-gray-900/50 text-gray-300 border border-gray-800 rounded-lg p-4 font-mono text-sm focus:outline-none focus:border-sky-600 transition-colors duration-200"
      />
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={scanContract}
          disabled={loading || !contractCode.trim()}
          className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search size={18} />
          <span>{loading ? 'Scanning...' : 'Scan Contract'}</span>
        </motion.button>
      </div>
      {scanResult && (
        <motion.pre
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg text-sm font-mono text-gray-300 whitespace-pre-wrap"
        >
          {scanResult}
        </motion.pre>
      )}
    </div>
  )
}