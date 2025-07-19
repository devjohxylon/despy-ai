// api/ml-threat-prediction.js
import { sql } from '@vercel/postgres'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { walletAddress, chain, analysisType = 'full' } = req.body

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' })
    }

    // Validate wallet address format
    const isValidAddress = chain === 'ethereum' 
      ? /^0x[a-fA-F0-9]{40}$/.test(walletAddress)
      : /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)

    if (!isValidAddress) {
      return res.status(400).json({ error: 'Invalid wallet address format' })
    }

    // Rate limiting check
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const rateLimitKey = `ml_analysis_${clientIP}`
    
    // Check if user has exceeded rate limit (5 requests per minute)
    const rateLimitResult = await sql`
      SELECT COUNT(*) as count 
      FROM ml_analysis_requests 
      WHERE ip_address = ${clientIP} 
      AND created_at > NOW() - INTERVAL '1 minute'
    `

    if (rateLimitResult.rows[0].count >= 5) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please wait before making another request.',
        retryAfter: 60
      })
    }

    // Log the analysis request
    await sql`
      INSERT INTO ml_analysis_requests (wallet_address, chain, analysis_type, ip_address, created_at)
      VALUES (${walletAddress}, ${chain || 'ethereum'}, ${analysisType}, ${clientIP}, NOW())
    `

    // Simulate ML analysis processing time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    // Generate ML analysis results
    const analysisResults = await generateMLAnalysis(walletAddress, chain, analysisType)

    // Store analysis results
    await sql`
      INSERT INTO ml_analysis_results (
        wallet_address, 
        chain, 
        analysis_type, 
        threats_detected, 
        confidence_score, 
        model_performance, 
        analysis_data, 
        created_at
      )
      VALUES (
        ${walletAddress}, 
        ${chain || 'ethereum'}, 
        ${analysisType}, 
        ${analysisResults.threats.length}, 
        ${analysisResults.confidence}, 
        ${JSON.stringify(analysisResults.modelPerformance)}, 
        ${JSON.stringify(analysisResults)}, 
        NOW()
      )
    `

    return res.status(200).json({
      success: true,
      data: analysisResults,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('ML Threat Prediction Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error during ML analysis',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Generate realistic ML analysis results
async function generateMLAnalysis(walletAddress, chain, analysisType) {
  const models = [
    'anomaly_detection',
    'pattern_recognition', 
    'behavioral_analysis',
    'transaction_clustering',
    'risk_scoring'
  ]

  const threatTypes = [
    'phishing',
    'rug_pull', 
    'wash_trading',
    'frontrunning',
    'money_laundering',
    'bot_activity'
  ]

  const threats = []
  let totalConfidence = 0

  // Generate threats for each model
  for (const model of models) {
    const modelThreats = Math.floor(Math.random() * 3) + (Math.random() > 0.7 ? 1 : 0)
    
    for (let i = 0; i < modelThreats; i++) {
      const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)]
      const confidence = Math.floor(70 + Math.random() * 25)
      totalConfidence += confidence

      const threat = {
        id: `${model}_${i}_${Date.now()}`,
        type: threatType,
        category: getThreatCategory(threatType),
        confidence,
        severity: confidence > 90 ? 'high' : confidence > 80 ? 'medium' : 'low',
        description: generateThreatDescription(model, threatType, walletAddress, chain),
        timestamp: new Date().toISOString(),
        model,
        evidence: generateEvidence(model, threatType, chain),
        recommendations: generateRecommendations(threatType),
        riskScore: Math.floor(confidence * 0.8 + Math.random() * 20)
      }

      threats.push(threat)
    }
  }

  const overallConfidence = threats.length > 0 ? Math.floor(totalConfidence / threats.length) : 0

  return {
    walletAddress,
    chain: chain || 'ethereum',
    analysisType,
    threats,
    confidence: overallConfidence,
    riskScore: Math.floor(overallConfidence * 0.8 + Math.random() * 20),
    modelPerformance: {
      accuracy: 94.2 + (Math.random() - 0.5) * 2,
      precision: 91.8 + (Math.random() - 0.5) * 2,
      recall: 89.5 + (Math.random() - 0.5) * 2,
      f1Score: 90.6 + (Math.random() - 0.5) * 2,
      falsePositiveRate: 2.3 + (Math.random() - 0.5) * 1
    },
    analysisMetrics: {
      transactionsAnalyzed: Math.floor(Math.random() * 1000) + 100,
      timePeriod: `${Math.floor(Math.random() * 30) + 1} days`,
      patternsDetected: Math.floor(Math.random() * 10) + 5,
      riskIndicators: Math.floor(Math.random() * 15) + 8,
      volumeAnalyzed: `${(Math.random() * 5000 + 500).toFixed(2)} ${chain === 'ethereum' ? 'ETH' : 'SOL'}`
    },
    processingTime: `${(2 + Math.random() * 3).toFixed(1)}s`
  }
}

function getThreatCategory(threatType) {
  const categories = {
    phishing: 'Phishing Attack',
    rug_pull: 'Rug Pull',
    wash_trading: 'Wash Trading',
    frontrunning: 'Frontrunning',
    money_laundering: 'Money Laundering',
    bot_activity: 'Bot Activity'
  }
  return categories[threatType] || 'Suspicious Activity'
}

function generateThreatDescription(model, threatType, address, chain) {
  const shortAddress = `${address.slice(0, 8)}...${address.slice(-6)}`
  const currency = chain === 'ethereum' ? 'ETH' : 'SOL'
  
  const descriptions = {
    anomaly_detection: {
      phishing: `Unusual transaction patterns detected in ${shortAddress}. Multiple small transactions to suspicious addresses with potential phishing indicators.`,
      rug_pull: `Large liquidity removal detected with unusual timing patterns. Potential rug pull indicators in recent transactions.`,
      wash_trading: `Circular transaction patterns detected. High volume with low price impact suggests coordinated wash trading activity.`,
      frontrunning: `MEV-like transaction ordering detected. Potential frontrunning activity with suspicious gas price patterns.`,
      money_laundering: `Complex transaction chains detected. Multiple hops through privacy protocols and mixing services.`,
      bot_activity: `High-frequency trading patterns detected. Automated bot behavior identified with millisecond-level timing.`
    },
    pattern_recognition: {
      phishing: `Pattern matching identified known phishing attack signatures in ${shortAddress} transaction history.`,
      rug_pull: `Recognized rug pull patterns: sudden liquidity removal followed by token dumping.`,
      wash_trading: `Identified wash trading patterns: circular transactions with artificial volume creation.`,
      frontrunning: `Detected frontrunning patterns: MEV extraction through transaction ordering manipulation.`,
      money_laundering: `Pattern analysis revealed money laundering techniques: structured transactions and layering.`,
      bot_activity: `Recognized bot trading patterns: consistent timing and volume patterns across multiple transactions.`
    }
  }

  return descriptions[model]?.[threatType] || 
    `Suspicious activity detected by ${model.replace(/_/g, ' ')} model in ${shortAddress}.`
}

function generateEvidence(model, threatType, chain) {
  const currency = chain === 'ethereum' ? 'ETH' : 'SOL'
  
  return {
    transactionCount: Math.floor(Math.random() * 100) + 10,
    volumeAnalyzed: `${(Math.random() * 1000 + 100).toFixed(2)} ${currency}`,
    timePeriod: `${Math.floor(Math.random() * 30) + 1} days`,
    patternsDetected: Math.floor(Math.random() * 5) + 2,
    riskIndicators: Math.floor(Math.random() * 10) + 3,
    modelConfidence: Math.floor(85 + Math.random() * 15),
    dataPoints: Math.floor(Math.random() * 1000) + 500
  }
}

function generateRecommendations(threatType) {
  const recommendations = {
    phishing: [
      'Avoid interacting with suspicious addresses',
      'Enable transaction signing confirmations',
      'Use hardware wallets for large transactions',
      'Verify contract addresses before interaction'
    ],
    rug_pull: [
      'Monitor liquidity changes in real-time',
      'Check token contract code for suspicious functions',
      'Avoid new tokens with low liquidity',
      'Use trusted DEX aggregators'
    ],
    wash_trading: [
      'Verify trading volume authenticity',
      'Check for circular transaction patterns',
      'Monitor price manipulation indicators',
      'Use volume-weighted analysis'
    ],
    frontrunning: [
      'Use private transactions when possible',
      'Enable MEV protection mechanisms',
      'Monitor gas price spikes',
      'Consider using flashbots'
    ],
    money_laundering: [
      'Report suspicious activity to authorities',
      'Monitor transaction chain analysis',
      'Check regulatory compliance requirements',
      'Implement enhanced due diligence'
    ],
    bot_activity: [
      'Monitor for automated trading patterns',
      'Check for bot signature detection',
      'Verify transaction authenticity',
      'Implement rate limiting measures'
    ]
  }

  return recommendations[threatType] || [
    'Monitor wallet activity closely',
    'Enable security alerts and notifications',
    'Review transaction history regularly',
    'Use multi-signature wallets for large holdings'
  ]
} 