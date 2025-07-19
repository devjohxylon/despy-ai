// src/services/mlService.js

const API_BASE_URL = 'https://despy.io/api'

export class MLService {
  static async analyzeWallet(walletAddress, chain = 'ethereum', analysisType = 'full') {
    try {
      const response = await fetch(`${API_BASE_URL}/ml-threat-prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          chain,
          analysisType
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to analyze wallet')
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('ML Analysis Error:', error)
      throw error
    }
  }

  static async getAnalysisHistory(walletAddress, limit = 10) {
    try {
      const response = await fetch(`${API_BASE_URL}/ml-analysis-history?address=${walletAddress}&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis history')
      }

      const data = await response.json()
      return data.analyses
    } catch (error) {
      console.error('Analysis History Error:', error)
      throw error
    }
  }

  static async getModelPerformance() {
    try {
      const response = await fetch(`${API_BASE_URL}/ml-model-performance`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch model performance')
      }

      const data = await response.json()
      return data.performance
    } catch (error) {
      console.error('Model Performance Error:', error)
      throw error
    }
  }

  static async getThreatStatistics(timeRange = '7d') {
    try {
      const response = await fetch(`${API_BASE_URL}/ml-threat-stats?range=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch threat statistics')
      }

      const data = await response.json()
      return data.stats
    } catch (error) {
      console.error('Threat Statistics Error:', error)
      throw error
    }
  }

  // Simulate real-time threat monitoring
  static async startRealTimeMonitoring(walletAddress, callback) {
    // In a real implementation, this would use WebSockets or Server-Sent Events
    const interval = setInterval(async () => {
      try {
        const analysis = await this.analyzeWallet(walletAddress, 'ethereum', 'quick')
        if (analysis.threats.length > 0) {
          callback(analysis.threats)
        }
      } catch (error) {
        console.error('Real-time monitoring error:', error)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }

  // Get threat recommendations based on detected threats
  static getThreatRecommendations(threats) {
    const recommendations = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    }

    threats.forEach(threat => {
      switch (threat.type) {
        case 'phishing':
          recommendations.immediate.push('Disconnect wallet from suspicious dApps')
          recommendations.shortTerm.push('Review recent transactions for unauthorized activity')
          recommendations.longTerm.push('Enable hardware wallet for additional security')
          break
        case 'rug_pull':
          recommendations.immediate.push('Stop trading the affected token immediately')
          recommendations.shortTerm.push('Document all losses for potential recovery')
          recommendations.longTerm.push('Implement stricter token vetting procedures')
          break
        case 'wash_trading':
          recommendations.immediate.push('Avoid trading tokens with artificial volume')
          recommendations.shortTerm.push('Use volume-weighted analysis tools')
          recommendations.longTerm.push('Implement automated volume verification')
          break
        case 'frontrunning':
          recommendations.immediate.push('Use private transactions for large trades')
          recommendations.shortTerm.push('Monitor gas price spikes before transactions')
          recommendations.longTerm.push('Consider using MEV protection services')
          break
        case 'money_laundering':
          recommendations.immediate.push('Report suspicious activity to authorities')
          recommendations.shortTerm.push('Implement enhanced due diligence procedures')
          recommendations.longTerm.push('Establish compliance monitoring systems')
          break
        case 'bot_activity':
          recommendations.immediate.push('Verify transaction authenticity')
          recommendations.shortTerm.push('Monitor for automated trading patterns')
          recommendations.longTerm.push('Implement bot detection systems')
          break
      }
    })

    return recommendations
  }

  // Calculate risk score based on threats
  static calculateRiskScore(threats) {
    if (threats.length === 0) return 0

    const severityWeights = {
      high: 1.0,
      medium: 0.6,
      low: 0.3
    }

    const totalScore = threats.reduce((score, threat) => {
      const weight = severityWeights[threat.severity] || 0.5
      return score + (threat.confidence * weight)
    }, 0)

    return Math.min(100, Math.floor(totalScore / threats.length))
  }

  // Get threat category statistics
  static getThreatCategoryStats(threats) {
    const stats = {}
    
    threats.forEach(threat => {
      if (!stats[threat.category]) {
        stats[threat.category] = {
          count: 0,
          totalConfidence: 0,
          highSeverity: 0,
          mediumSeverity: 0,
          lowSeverity: 0
        }
      }
      
      stats[threat.category].count++
      stats[threat.category].totalConfidence += threat.confidence
      
      switch (threat.severity) {
        case 'high':
          stats[threat.category].highSeverity++
          break
        case 'medium':
          stats[threat.category].mediumSeverity++
          break
        case 'low':
          stats[threat.category].lowSeverity++
          break
      }
    })

    // Calculate averages
    Object.keys(stats).forEach(category => {
      stats[category].averageConfidence = Math.floor(
        stats[category].totalConfidence / stats[category].count
      )
    })

    return stats
  }

  // Export analysis results
  static exportAnalysisResults(analysis, format = 'json') {
    const exportData = {
      walletAddress: analysis.walletAddress,
      chain: analysis.chain,
      analysisType: analysis.analysisType,
      timestamp: analysis.timestamp,
      confidence: analysis.confidence,
      riskScore: analysis.riskScore,
      threats: analysis.threats,
      modelPerformance: analysis.modelPerformance,
      analysisMetrics: analysis.analysisMetrics
    }

    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2)
      case 'csv':
        return this.convertToCSV(exportData)
      case 'pdf':
        return this.convertToPDF(exportData)
      default:
        return exportData
    }
  }

  static convertToCSV(data) {
    // Simple CSV conversion for threats
    const headers = ['Type', 'Category', 'Confidence', 'Severity', 'Description', 'Model']
    const rows = data.threats.map(threat => [
      threat.type,
      threat.category,
      threat.confidence,
      threat.severity,
      threat.description,
      threat.model
    ])

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
  }

  static convertToPDF(data) {
    // This would integrate with a PDF generation library
    // For now, return a placeholder
    return {
      content: data,
      format: 'pdf',
      filename: `ml-analysis-${data.walletAddress}-${Date.now()}.pdf`
    }
  }
}

export default MLService 