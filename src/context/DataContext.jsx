// src/context/DataContext.jsx
import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { useAuth } from '@clerk/clerk-react'

const DataContext = createContext()

// Security constants
const MAX_CODE_SIZE = 1024 * 1024 // 1MB
const MAX_REQUESTS_PER_MINUTE = 30
const REQUEST_TIMEOUT = 30000 // 30 seconds

// Rate limiting
const requestCounts = new Map()
const resetTime = new Map()

// Address validation with strict regex
const isValidEthereumAddress = (address) => {
  return /^0x[a-fA-F0-9]{40}$/i.test(address?.trim())
}

const isValidSolanaAddress = (address) => {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/i.test(address?.trim())
}

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s-:]/g, '') // Remove special characters except allowed ones
    .trim()
}

// Contract scanning with improved security checks
const scanContract = (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Invalid contract code')
  }

  if (code.length > MAX_CODE_SIZE) {
    throw new Error('Contract code size exceeds limit')
  }

  const sanitizedCode = code.replace(/<[^>]*>/g, '') // Remove potential XSS
  const lines = sanitizedCode.split('\n')
  let issues = []
  let riskLevel = 'LOW'

  // Advanced vulnerability checks
  const vulnerabilityPatterns = {
    reentrancy: {
      pattern: /(transfer|send|call)(?![a-zA-Z])/,
      requireCheck: /(require|revert|assert).*\}/,
      type: 'critical',
      description: 'Potential reentrancy vulnerability',
      recommendation: 'Implement checks-effects-interactions pattern and consider using ReentrancyGuard.'
    },
    overflow: {
      pattern: /(\+\+|\-\-)(?![a-zA-Z])/,
      safeCheck: /SafeMath|0\.8\./,
      type: 'high',
      description: 'Possible integer overflow/underflow',
      recommendation: 'Use SafeMath library or Solidity 0.8+ built-in overflow checks.'
    },
    uncheckedCall: {
      pattern: /\.(call|delegatecall)\{/,
      requireCheck: /(require|revert|assert).*\}/,
      type: 'medium',
      description: 'Unchecked external call',
      recommendation: 'Add success checks and error handling for external calls.'
    },
    // Add more security patterns here
  }

  let context = ''
  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    context += trimmedLine + '\n'

    // Keep only last 5 lines of context
    const contextLines = context.split('\n').slice(-5)
    context = contextLines.join('\n')

    Object.entries(vulnerabilityPatterns).forEach(([key, pattern]) => {
      if (pattern.pattern.test(trimmedLine)) {
        // Check surrounding context for safety checks
        const isSafe = pattern.requireCheck?.test(context) || pattern.safeCheck?.test(context)
        
        if (!isSafe) {
          issues.push({
            type: pattern.type,
            line: index + 1,
            description: `${pattern.description} in '${trimmedLine}'`,
            recommendation: pattern.recommendation,
            context: contextLines.join('\n')
          })

          if (pattern.type === 'critical') riskLevel = 'CRITICAL'
          else if (pattern.type === 'high' && riskLevel !== 'CRITICAL') riskLevel = 'HIGH'
          else if (pattern.type === 'medium' && !['CRITICAL', 'HIGH'].includes(riskLevel)) riskLevel = 'MEDIUM'
        }
      }
    })
  })

  return { issues, riskLevel }
}

// Rate limiting function
const checkRateLimit = (userId) => {
  const now = Date.now()
  
  if (!requestCounts.has(userId)) {
    requestCounts.set(userId, 1)
    resetTime.set(userId, now + 60000) // Reset after 1 minute
    return true
  }

  if (now > resetTime.get(userId)) {
    requestCounts.set(userId, 1)
    resetTime.set(userId, now + 60000)
    return true
  }

  const currentCount = requestCounts.get(userId)
  if (currentCount >= MAX_REQUESTS_PER_MINUTE) {
    return false
  }

  requestCounts.set(userId, currentCount + 1)
  return true
}

// Enhanced mock data for testing
const generateMockData = (address, chain) => {
  const isEthereum = chain === 'ethereum'
  const tokenSymbol = isEthereum ? 'ETH' : 'SOL'
  
  // Create a realistic wallet profile based on address
  const addressHash = address.slice(-8)
  const walletType = parseInt(addressHash, 16) % 4 // 0-3 for different wallet types
  
  // Define wallet profiles
  const walletProfiles = {
    0: { // DeFi Whale
      name: 'DeFi Whale',
      description: 'High-volume DeFi trader with sophisticated strategies',
      riskLevel: 'high',
      transactionPattern: 'frequent_large',
      protocols: ['Uniswap V3', 'Aave', 'Compound', 'Curve'],
      avgTransactionValue: isEthereum ? 25.5 : 1200,
      transactionCount: 45
    },
    1: { // MEV Bot
      name: 'MEV Bot',
      description: 'Sophisticated arbitrage bot with consistent profits',
      riskLevel: 'medium',
      transactionPattern: 'high_frequency',
      protocols: ['Uniswap V2', 'SushiSwap', 'Balancer'],
      avgTransactionValue: isEthereum ? 0.8 : 50,
      transactionCount: 120
    },
    2: { // NFT Collector
      name: 'NFT Collector',
      description: 'Active NFT trader and collector',
      riskLevel: 'low',
      transactionPattern: 'nft_focused',
      protocols: ['OpenSea', 'Blur', 'LooksRare'],
      avgTransactionValue: isEthereum ? 3.2 : 150,
      transactionCount: 28
    },
    3: { // Regular User
      name: 'Regular User',
      description: 'Standard crypto user with normal activity',
      riskLevel: 'low',
      transactionPattern: 'normal',
      protocols: ['Uniswap V1', 'MetaMask'],
      avgTransactionValue: isEthereum ? 1.5 : 75,
      transactionCount: 15
    }
  }
  
  const profile = walletProfiles[walletType]
  
  // Generate realistic transactions based on wallet profile
  const transactions = Array.from({ length: profile.transactionCount }, (_, i) => {
    let value, gasUsed, type, details
    
    switch (profile.transactionPattern) {
      case 'frequent_large':
        value = (profile.avgTransactionValue * (0.5 + Math.random() * 1.5)).toFixed(3)
        gasUsed = Math.floor(150000 + Math.random() * 300000)
        type = i % 5 === 0 ? 'large_transfer' : 'defi_interaction'
        details = i % 5 === 0 ? 'Large liquidity provision' : 'DeFi protocol interaction'
        break
      case 'high_frequency':
        value = (profile.avgTransactionValue * (0.2 + Math.random() * 0.8)).toFixed(4)
        gasUsed = Math.floor(80000 + Math.random() * 120000)
        type = 'arbitrage'
        details = 'MEV arbitrage transaction'
        break
      case 'nft_focused':
        value = (profile.avgTransactionValue * (0.3 + Math.random() * 1.2)).toFixed(3)
        gasUsed = Math.floor(100000 + Math.random() * 200000)
        type = i % 3 === 0 ? 'nft_mint' : 'nft_trade'
        details = i % 3 === 0 ? 'NFT mint transaction' : 'NFT marketplace trade'
        break
      default: // normal
        value = (profile.avgTransactionValue * (0.4 + Math.random() * 1.1)).toFixed(3)
        gasUsed = Math.floor(50000 + Math.random() * 100000)
        type = 'normal'
        details = 'Standard transaction'
        break
    }
    
    return {
      hash: `0x${Math.random().toString(16).slice(2, 42)}`,
      value,
      tokenDecimal: isEthereum ? '18' : '9',
      tokenSymbol,
      gasUsed: gasUsed.toString(),
      timestamp: new Date(Date.now() - i * 3600000 * (1 + Math.random() * 3)).toISOString(),
      type,
      from: `0x${Math.random().toString(16).slice(2, 42)}`,
      to: address,
      status: Math.random() > 0.02 ? 'success' : 'failed',
      details
    }
  })

  // Generate realistic risk metrics based on wallet profile
  const baseRisks = {
    liquidity: profile.riskLevel === 'high' ? 65 : profile.riskLevel === 'medium' ? 45 : 25,
    volatility: profile.riskLevel === 'high' ? 75 : profile.riskLevel === 'medium' ? 55 : 35,
    concentration: profile.riskLevel === 'high' ? 70 : profile.riskLevel === 'medium' ? 50 : 30,
    manipulation: profile.riskLevel === 'high' ? 60 : profile.riskLevel === 'medium' ? 40 : 20,
    smartContract: profile.riskLevel === 'high' ? 55 : profile.riskLevel === 'medium' ? 35 : 25
  }
  
  const risks = Object.fromEntries(
    Object.entries(baseRisks).map(([key, value]) => [
      key, 
      Math.floor(value + (Math.random() - 0.5) * 20)
    ])
  )

  // Generate timeline events that tell a story
  const timeline = [
    {
      id: 1,
      type: 'success',
      event: 'Wallet Creation',
      timestamp: new Date(Date.now() - 60 * 86400000).toISOString(),
      details: `Wallet created and received initial ${(10 + Math.random() * 40).toFixed(2)} ${tokenSymbol}`,
      category: 'creation'
    },
    {
      id: 2,
      type: 'info',
      event: 'First DeFi Interaction',
      timestamp: new Date(Date.now() - 45 * 86400000).toISOString(),
      details: `First interaction with ${profile.protocols[0]} - ${profile.description.toLowerCase()}`,
      category: 'defi'
    },
    ...(profile.riskLevel === 'high' ? [{
      id: 3,
      type: 'warning',
      event: 'High-Value Transaction',
      timestamp: new Date(Date.now() - 35 * 86400000).toISOString(),
      details: `Large transfer of ${(100 + Math.random() * 300).toFixed(2)} ${tokenSymbol} detected`,
      category: 'transaction'
    }] : []),
    ...(profile.transactionPattern === 'high_frequency' ? [{
      id: 4,
      type: 'info',
      event: 'MEV Bot Detection',
      timestamp: new Date(Date.now() - 25 * 86400000).toISOString(),
      details: 'Address identified as sophisticated MEV arbitrage bot',
      category: 'analysis'
    }] : []),
    {
      id: 5,
      type: 'info',
      event: 'Protocol Diversity',
      timestamp: new Date(Date.now() - 20 * 86400000).toISOString(),
      details: `Interacted with ${profile.protocols.length} different DeFi protocols`,
      category: 'defi'
    },
    ...(profile.transactionPattern === 'nft_focused' ? [{
      id: 6,
      type: 'info',
      event: 'NFT Collection Activity',
      timestamp: new Date(Date.now() - 15 * 86400000).toISOString(),
      details: `Minted ${Math.floor(3 + Math.random() * 8)} NFTs from verified collections`,
      category: 'nft'
    }] : []),
    {
      id: 7,
      type: 'success',
      event: 'Staking Activity',
      timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
      details: `Staked ${(50 + Math.random() * 200).toFixed(2)} ${tokenSymbol} in validator`,
      category: 'staking'
    },
    {
      id: 8,
      type: profile.riskLevel === 'high' ? 'warning' : 'info',
      event: 'Recent Activity Pattern',
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
      details: `${profile.transactionPattern === 'high_frequency' ? 'High-frequency trading' : 'Normal activity'} pattern detected`,
      category: 'activity'
    }
  ]

  // Generate alerts based on wallet profile and risk level
  const alerts = [
    ...(profile.riskLevel === 'high' ? [{
      id: 1,
      type: 'critical',
      message: 'High-Risk Trading Patterns',
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      details: `Address shows ${profile.transactionPattern === 'frequent_large' ? 'large-value trading patterns' : 'high-frequency arbitrage'} with ${profile.transactionCount} transactions in 45 days.`,
      recommendation: 'Monitor for potential market manipulation. Consider implementing trading limits.',
      severity: 85,
      category: 'trading'
    }] : []),
    ...(profile.transactionPattern === 'high_frequency' ? [{
      id: 2,
      type: 'warning',
      message: 'MEV Bot Activity Detected',
      timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      details: `Sophisticated arbitrage patterns detected. Success rate: ${(85 + Math.random() * 12).toFixed(1)}%.`,
      recommendation: 'Consider flagging as institutional/bot traffic for analytics.',
      severity: 65,
      category: 'mev'
    }] : []),
    {
      id: 3,
      type: 'info',
      message: 'Multi-Protocol Activity',
      timestamp: new Date(Date.now() - 6 * 3600000).toISOString(),
      details: `Active on ${profile.protocols.length} different protocols: ${profile.protocols.join(', ')}.`,
      recommendation: 'Monitor for cross-protocol arbitrage opportunities.',
      severity: 35,
      category: 'defi'
    },
    ...(profile.riskLevel === 'medium' ? [{
      id: 4,
      type: 'warning',
      message: 'Moderate Risk Exposure',
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
      details: `Address shows moderate risk patterns with ${profile.transactionCount} transactions.`,
      recommendation: 'Continue monitoring for unusual activity patterns.',
      severity: 55,
      category: 'risk'
    }] : []),
    {
      id: 5,
      type: 'info',
      message: 'Network Activity Analysis',
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      details: `Total transaction value: ${(profile.avgTransactionValue * profile.transactionCount).toFixed(2)} ${tokenSymbol}. Average: ${profile.avgTransactionValue.toFixed(2)} ${tokenSymbol}.`,
      recommendation: 'Track wallet for potential whale movements.',
      severity: 25,
      category: 'analytics'
    }
  ]

  // Calculate sophisticated metrics
  const criticalAlerts = alerts.filter(a => a.type === 'critical').length
  const warningAlerts = alerts.filter(a => a.type === 'warning').length
  const totalValue = transactions.reduce((sum, tx) => sum + parseFloat(tx.value), 0)
  const avgRisk = Object.values(risks).reduce((sum, risk) => sum + risk, 0) / Object.keys(risks).length
  
  // Calculate composite scores based on profile
  const baseScore = profile.riskLevel === 'high' ? 35 : profile.riskLevel === 'medium' ? 65 : 85
  const score = Math.max(0, Math.min(100, baseScore - (criticalAlerts * 15) - (warningAlerts * 5)))
  const reputationScore = Math.max(0, Math.min(100, 100 - (criticalAlerts * 20) - (warningAlerts * 10)))
  const predictiveRisk = Math.min(100, Math.floor(avgRisk + (criticalAlerts * 10) + (warningAlerts * 5)))

  return {
    address,
    chain,
    score,
    risks,
    timeline,
    alerts,
    transactions,
    predictiveRisk,
    reputationScore,
    walletProfile: profile,
    // Additional metrics for enhanced analytics
    analytics: {
      totalTransactionValue: totalValue.toFixed(3),
      averageTransactionValue: (totalValue / transactions.length).toFixed(3),
      transactionFrequency: Math.floor(transactions.length / 45), // per day over 45 days
      criticalRiskCount: criticalAlerts,
      warningRiskCount: warningAlerts,
      riskTrend: profile.riskLevel === 'high' ? 'increasing' : 'stable',
      confidenceScore: Math.floor(80 + Math.random() * 15), // 80-95%
      lastAnalyzed: new Date().toISOString(),
      networkActivity: Math.floor(profile.transactionCount * 2 + Math.random() * 20), // Based on activity
      protocolDiversity: profile.protocols.length
    }
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
  const { userId } = useAuth()

  const validateAddress = useCallback((address, chain) => {
    if (!address) throw new Error('Address is required')
    
    const sanitizedAddress = sanitizeInput(address)
    if (!sanitizedAddress) throw new Error('Invalid address format')

    if (chain === 'ethereum' && !isValidEthereumAddress(sanitizedAddress)) {
      throw new Error('Invalid Ethereum address format')
    }
    if (chain === 'solana' && !isValidSolanaAddress(sanitizedAddress)) {
      throw new Error('Invalid Solana address format')
    }

    return sanitizedAddress
  }, [])

  const analyzeAddress = useCallback(async (address, chain) => {
    try {
      // if (!userId) throw new Error('Authentication required')
      // if (!checkRateLimit(userId)) throw new Error('Rate limit exceeded')

      setLoading(true)
      setError(null)

      const sanitizedAddress = validateAddress(address, chain)
      
      // Simulate API call with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      try {
        // Replace with actual API call when ready
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockData = generateMockData(sanitizedAddress, chain)
        setData(mockData)
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [userId, validateAddress])

  const analyzeContract = useCallback(async (code, chain) => {
    try {
      // if (!userId) throw new Error('Authentication required')
      // if (!checkRateLimit(userId)) throw new Error('Rate limit exceeded')
      if (!code) throw new Error('Contract code is required')
      if (code.length > MAX_CODE_SIZE) throw new Error('Contract code size exceeds limit')

      setLoading(true)
      setError(null)

      const sanitizedCode = sanitizeInput(code)
      const scanResults = scanContract(sanitizedCode)
      
      // Simulate API call with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

      try {
        // Replace with actual API call when ready
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockData = generateContractMockData(sanitizedCode, scanResults)
        setData({ ...mockData, code: sanitizedCode })
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const value = useMemo(() => ({
    data,
    loading,
    error,
    analyzeAddress,
    analyzeContract
  }), [data, loading, error, analyzeAddress, analyzeContract])

  return (
    <DataContext.Provider value={value}>
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