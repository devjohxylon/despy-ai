// src/context/DataContext.jsx
import { createContext, useContext, useState } from 'react'

const DataContext = createContext()

// Address validation functions
const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

const isValidSolanaAddress = (address) => {
  // Solana addresses are 32-44 characters long and use base58 encoding
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

// Contract scanning function
const scanContract = (code) => {
  const lines = code.split('\n')
  let issues = []
  let riskLevel = 'LOW'

  // Advanced vulnerability checks
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()

    // Reentrancy detection
    if (trimmedLine.includes('transfer') || trimmedLine.includes('send') || trimmedLine.includes('call')) {
      if (!trimmedLine.includes('require') && !trimmedLine.includes('revert')) {
        issues.push({
          type: 'critical',
          line: index + 1,
          description: `Potential reentrancy vulnerability in '${trimmedLine.split('(')[0]}'`,
          recommendation: 'Implement checks-effects-interactions pattern and consider using ReentrancyGuard.'
        })
        riskLevel = 'CRITICAL'
      }
    }

    // Integer overflow/underflow
    if ((trimmedLine.includes('++') || trimmedLine.includes('--')) && !trimmedLine.includes('SafeMath')) {
      issues.push({
        type: 'high',
        line: index + 1,
        description: `Possible integer overflow/underflow in '${trimmedLine}'`,
        recommendation: 'Use SafeMath library or Solidity 0.8+ built-in overflow checks.'
      })
      riskLevel = riskLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
    }

    // Unchecked external calls
    if (trimmedLine.includes('.call') || trimmedLine.includes('.delegatecall')) {
      if (!trimmedLine.includes('require') && !trimmedLine.includes('revert')) {
        issues.push({
          type: 'medium',
          line: index + 1,
          description: `Unchecked external call in '${trimmedLine}'`,
          recommendation: 'Add success checks and error handling for external calls.'
        })
        riskLevel = riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? riskLevel : 'MEDIUM'
      }
    }

    // Missing events for state changes
    if (trimmedLine.includes('state') && !trimmedLine.includes('emit')) {
      issues.push({
        type: 'low',
        line: index + 1,
        description: `State change in '${trimmedLine}' lacks event emission`,
        recommendation: 'Emit events for state changes to improve transparency.'
      })
    }
  })

  return { issues, riskLevel }
}

// Mock data for testing
const generateMockData = (address, chain) => {
  // Generate 10 mock transactions
  const transactions = Array.from({ length: 10 }, (_, i) => ({
    hash: `0x${Math.random().toString(16).slice(2, 10)}...`,
    value: (Math.random() * 10).toString(),
    tokenDecimal: '18',
    tokenSymbol: chain === 'ethereum' ? 'ETH' : 'SOL',
    gasUsed: Math.floor(Math.random() * 100000).toString(),
    timestamp: new Date(Date.now() - i * 86400000).toISOString() // Last 10 days
  }))

  // Generate risk metrics
  const risks = {
    liquidity: 35 + Math.random() * 30,
    volatility: 40 + Math.random() * 30,
    concentration: 25 + Math.random() * 40,
    manipulation: 15 + Math.random() * 25,
    smartContract: 20 + Math.random() * 35
  }

  // Generate timeline events
  const timeline = [
    {
      id: 1,
      type: 'success',
      event: 'Contract Deployed',
      timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
      details: 'Smart contract successfully deployed and verified'
    },
    {
      id: 2,
      type: 'info',
      event: 'Liquidity Added',
      timestamp: new Date(Date.now() - 25 * 86400000).toISOString(),
      details: `Initial liquidity pool created with ${(Math.random() * 100).toFixed(2)} ${chain === 'ethereum' ? 'ETH' : 'SOL'}`
    },
    {
      id: 3,
      type: 'warning',
      event: 'Large Transfer Detected',
      timestamp: new Date(Date.now() - 15 * 86400000).toISOString(),
      details: 'Unusual transfer pattern detected from major holder'
    },
    {
      id: 4,
      type: 'info',
      event: 'New Trading Pair',
      timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
      details: 'New trading pair established with USDT'
    },
    {
      id: 5,
      type: 'error',
      event: 'Failed Transaction',
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString(),
      details: 'Multiple failed transaction attempts detected'
    },
    {
      id: 6,
      type: 'success',
      event: 'Security Audit Completed',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      details: 'Smart contract successfully audited by trusted firm'
    }
  ]

  // Generate alerts
  const alerts = [
    {
      id: 1,
      type: 'critical',
      message: 'Large Token Transfer Pattern Detected',
      timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
      details: 'Multiple large transfers (>5% of total supply) detected in the last hour from major holders.',
      recommendation: 'Monitor closely for potential dump. Consider implementing transfer limits.'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Unusual Trading Volume Spike',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      details: 'Trading volume increased by 300% in the last 2 hours.',
      recommendation: 'Check for market manipulation or coordinated trading activity.'
    },
    {
      id: 3,
      type: 'info',
      message: 'New Contract Interaction',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      details: 'Contract interacted with a newly deployed DEX router.',
      recommendation: 'Verify the new DEX router contract for legitimacy.'
    },
    {
      id: 4,
      type: 'warning',
      message: 'Liquidity Pool Changes',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      details: '20% of liquidity removed from main trading pair.',
      recommendation: 'Monitor for further liquidity removals. Check holder announcements.'
    },
    {
      id: 5,
      type: 'critical',
      message: 'Smart Contract Vulnerability',
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
      details: 'Potential reentrancy vulnerability detected in token contract.',
      recommendation: 'Immediate audit recommended. Consider pausing transfers if possible.'
    }
  ]

  return {
    address,
    chain,
    score: Math.floor(Math.random() * 100),
    risks,
    timeline,
    alerts,
    transactions,
    predictiveRisk: 25 + Math.random() * 50,
    reputationScore: Math.floor(Math.random() * 100),
  }
}

// Generate mock data for contract analysis
const generateContractMockData = (code, scanResults) => {
  const { issues, riskLevel } = scanResults
  
  // Calculate risk metrics based on issues
  const risks = {
    liquidity: 20 + Math.random() * 30,
    volatility: 30 + Math.random() * 30,
    concentration: 25 + Math.random() * 30,
    manipulation: issues.length * 10 + Math.random() * 20,
    smartContract: issues.length * 15 + Math.random() * 20
  }

  // Generate timeline events based on scan results
  const timeline = [
    {
      id: 1,
      type: 'info',
      event: 'Contract Scan Initiated',
      timestamp: new Date().toISOString(),
      details: 'Smart contract code submitted for analysis'
    },
    ...issues.map((issue, index) => ({
      id: index + 2,
      type: issue.type === 'critical' ? 'error' : 
            issue.type === 'high' ? 'warning' : 
            issue.type === 'medium' ? 'warning' : 'info',
      event: `${issue.type.toUpperCase()} Risk Detected`,
      timestamp: new Date(Date.now() - (index * 1000)).toISOString(),
      details: issue.description
    }))
  ]

  // Generate alerts based on scan results
  const alerts = issues.map((issue, index) => ({
    id: index + 1,
    type: issue.type === 'critical' ? 'critical' : 
          issue.type === 'high' ? 'warning' : 
          issue.type === 'medium' ? 'warning' : 'info',
    message: issue.description,
    timestamp: new Date(Date.now() - (index * 3600000)).toISOString(),
    details: `Found on line ${issue.line}`,
    recommendation: issue.recommendation
  }))

  return {
    code,
    score: Math.max(0, 100 - (issues.length * 15)),
    riskLevel,
    risks,
    timeline,
    alerts,
    issues,
    predictiveRisk: issues.length * 10 + Math.random() * 30,
    reputationScore: Math.max(0, 100 - (issues.length * 10))
  }
}

export function DataProvider({ children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validateAddress = (address, chain) => {
    switch (chain) {
      case 'ethereum':
        if (!isValidEthereumAddress(address)) {
          throw new Error('Invalid Ethereum address format. Address must start with 0x and be 42 characters long.')
        }
        break
      case 'solana':
        if (!isValidSolanaAddress(address)) {
          if (isValidEthereumAddress(address)) {
            throw new Error('You provided an Ethereum address but selected Solana chain. Please provide a valid Solana address.')
          }
          throw new Error('Invalid Solana address format. Address must be 32-44 characters long and use base58 encoding.')
        }
        break
      default:
        throw new Error('Unsupported chain selected')
    }
  }

  const analyzeAddress = async (address, chain) => {
    setLoading(true)
    setError(null)
    try {
      validateAddress(address, chain)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      const mockData = generateMockData(address, chain)
      setData(mockData)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const analyzeContract = async (code, chain) => {
    setLoading(true)
    setError(null)
    try {
      if (!code.trim()) {
        throw new Error('Please provide the contract code')
      }
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      const scanResults = scanContract(code)
      const mockData = generateContractMockData(code, scanResults)
      setData(mockData)
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DataContext.Provider value={{ data, loading, error, analyzeAddress, analyzeContract }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}