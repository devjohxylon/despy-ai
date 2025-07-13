// src/components/ContractScanner.jsx
import { useState } from 'react'

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
    <div className="p-4 bg-primary rounded-lg shadow-lg">
      <h2 className="text-2xl text-accent mb-4">Advanced Smart Contract Scanner</h2>
      <textarea
        value={contractCode}
        onChange={(e) => setContractCode(e.target.value)}
        placeholder="Paste your Solidity code here..."
        className="w-full h-64 p-2 bg-secondary border border-secondary rounded-lg mb-4"
      />
      <button
        onClick={scanContract}
        disabled={loading}
        className="bg-accent text-primary px-4 py-2 rounded-lg flex items-center space-x-1"
      >
        {loading ? 'Scanning...' : 'Scan Contract'}
      </button>
      {scanResult && <pre className="mt-4 text-text-secondary whitespace-pre-wrap">{scanResult}</pre>}
    </div>
  )
}