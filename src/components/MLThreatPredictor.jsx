// src/components/MLThreatPredictor.jsx
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Activity, 
  Zap, 
  Target, 
  BarChart3,
  Cpu,
  Eye,
  Lock,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Settings,
  Database
} from 'lucide-react'

// ML Model Types
const ML_MODELS = {
  ANOMALY_DETECTION: 'anomaly_detection',
  PATTERN_RECOGNITION: 'pattern_recognition',
  BEHAVIORAL_ANALYSIS: 'behavioral_analysis',
  TRANSACTION_CLUSTERING: 'transaction_clustering',
  RISK_SCORING: 'risk_scoring'
}

// Threat Categories
const THREAT_CATEGORIES = {
  PHISHING: { name: 'Phishing Attack', color: 'red', icon: AlertTriangle },
  RUG_PULL: { name: 'Rug Pull', color: 'orange', icon: Shield },
  WASH_TRADING: { name: 'Wash Trading', color: 'yellow', icon: TrendingUp },
  FRONTRUNNING: { name: 'Frontrunning', color: 'purple', icon: Zap },
  MONEY_LAUNDERING: { name: 'Money Laundering', color: 'pink', icon: Lock },
  BOT_ACTIVITY: { name: 'Bot Activity', color: 'blue', icon: Cpu }
}

export default function MLThreatPredictor({ walletAddress, onThreatDetected }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentModel, setCurrentModel] = useState('')
  const [threats, setThreats] = useState([])
  const [confidence, setConfidence] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const [modelPerformance, setModelPerformance] = useState({})
  const [lastUpdated, setLastUpdated] = useState(null)

  // Simulated ML analysis with realistic progress
  const runMLAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setThreats([])
    setConfidence(0)

    const models = Object.values(ML_MODELS)
    const totalSteps = models.length * 20 // 20 steps per model

    for (let i = 0; i < models.length; i++) {
      const model = models[i]
      setCurrentModel(model.replace(/_/g, ' ').toUpperCase())

      // Simulate model processing
      for (let step = 0; step < 20; step++) {
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))
        setAnalysisProgress(prev => prev + (100 / totalSteps))
      }

      // Generate threats for this model
      const modelThreats = generateModelThreats(model, walletAddress)
      setThreats(prev => [...prev, ...modelThreats])
    }

    // Calculate overall confidence
    const overallConfidence = Math.floor(75 + Math.random() * 20)
    setConfidence(overallConfidence)

    // Update model performance
    setModelPerformance({
      accuracy: 94.2,
      precision: 91.8,
      recall: 89.5,
      f1Score: 90.6,
      falsePositiveRate: 2.3
    })

    setLastUpdated(new Date())
    setIsAnalyzing(false)
    setCurrentModel('')

    // Notify parent component
    if (onThreatDetected) {
      onThreatDetected(threats)
    }
  }, [walletAddress, onThreatDetected])

  // Generate realistic threats based on model type
  const generateModelThreats = (modelType, address) => {
    const threats = []
    const numThreats = Math.floor(Math.random() * 3) + 1

    for (let i = 0; i < numThreats; i++) {
      const threatTypes = Object.keys(THREAT_CATEGORIES)
      const threatType = threatTypes[Math.floor(Math.random() * threatTypes.length)]
      const category = THREAT_CATEGORIES[threatType]

      const threat = {
        id: `${modelType}_${i}_${Date.now()}`,
        type: threatType,
        category: category.name,
        confidence: Math.floor(70 + Math.random() * 25),
        severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
        description: generateThreatDescription(modelType, threatType, address),
        timestamp: new Date(),
        model: modelType,
        evidence: generateEvidence(modelType, threatType),
        recommendations: generateRecommendations(threatType)
      }

      threats.push(threat)
    }

    return threats
  }

  const generateThreatDescription = (modelType, threatType, address) => {
    const descriptions = {
      anomaly_detection: {
        phishing: `Unusual transaction patterns detected in ${address.slice(0, 8)}...${address.slice(-6)}. Multiple small transactions to suspicious addresses.`,
        rug_pull: `Large liquidity removal detected with unusual timing patterns. Potential rug pull indicators.`,
        wash_trading: `Circular transaction patterns detected. High volume with low price impact suggests wash trading.`,
        frontrunning: `MEV-like transaction ordering detected. Potential frontrunning activity.`,
        money_laundering: `Complex transaction chains detected. Multiple hops through privacy protocols.`,
        bot_activity: `High-frequency trading patterns detected. Automated bot behavior identified.`
      }
    }

    return descriptions[modelType]?.[threatType] || `Suspicious activity detected by ${modelType.replace(/_/g, ' ')} model.`
  }

  const generateEvidence = (modelType, threatType) => {
    const evidence = {
      transaction_count: Math.floor(Math.random() * 100) + 10,
      volume_analyzed: `${(Math.random() * 1000 + 100).toFixed(2)} ETH`,
      time_period: `${Math.floor(Math.random() * 30) + 1} days`,
      patterns_detected: Math.floor(Math.random() * 5) + 2,
      risk_indicators: Math.floor(Math.random() * 10) + 3
    }

    return evidence
  }

  const generateRecommendations = (threatType) => {
    const recommendations = {
      phishing: ['Avoid interacting with suspicious addresses', 'Enable transaction signing confirmations', 'Use hardware wallets for large transactions'],
      rug_pull: ['Monitor liquidity changes', 'Check token contract code', 'Avoid new tokens with low liquidity'],
      wash_trading: ['Verify trading volume authenticity', 'Check for circular transactions', 'Monitor price manipulation'],
      frontrunning: ['Use private transactions', 'Enable MEV protection', 'Monitor gas price spikes'],
      money_laundering: ['Report suspicious activity', 'Monitor transaction chains', 'Check regulatory compliance'],
      bot_activity: ['Monitor for automated patterns', 'Check for bot signatures', 'Verify transaction authenticity']
    }

    return recommendations[threatType] || ['Monitor wallet activity', 'Enable security alerts', 'Review transaction history']
  }

  // Calculate threat statistics
  const threatStats = useMemo(() => {
    const stats = {
      total: threats.length,
      high: threats.filter(t => t.severity === 'high').length,
      medium: threats.filter(t => t.severity === 'medium').length,
      low: threats.filter(t => t.severity === 'low').length,
      byCategory: {}
    }

    threats.forEach(threat => {
      if (!stats.byCategory[threat.category]) {
        stats.byCategory[threat.category] = 0
      }
      stats.byCategory[threat.category]++
    })

    return stats
  }, [threats])

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  // Get confidence color
  const getConfidenceColor = (conf) => {
    if (conf >= 90) return 'text-green-400'
    if (conf >= 80) return 'text-yellow-400'
    if (conf >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl">
            <Brain className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white">ML Threat Predictor</h3>
            <p className="text-gray-400">Advanced machine learning security analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-3 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-slate-700/50"
          >
            {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          
          <button
            onClick={runMLAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Run Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Progress */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <div className="bg-slate-700/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
                <span className="text-white font-medium">{currentModel}</span>
              </div>
              <span className="text-gray-400">{Math.round(analysisProgress)}%</span>
            </div>
            
            <div className="w-full bg-slate-600/30 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${analysisProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              {Object.values(ML_MODELS).map((model, index) => (
                <div key={model} className="text-center">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    analysisProgress > (index * 20) ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/30 text-gray-500'
                  }`}>
                    {analysisProgress > (index * 20) ? <CheckCircle size={16} /> : <Database size={16} />}
                  </div>
                  <p className="text-xs text-gray-400">{model.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {!isAnalyzing && (threats.length > 0 || confidence > 0) && (
        <div className="space-y-8">
          {/* Overall Confidence */}
          <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-white">Analysis Confidence</h4>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {lastUpdated?.toLocaleTimeString()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getConfidenceColor(confidence)}`}>
                  {confidence}%
                </div>
                <p className="text-sm text-gray-400">Overall Confidence</p>
              </div>
              
              <div className="flex-1">
                <div className="w-full bg-slate-600/30 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      confidence >= 90 ? 'bg-green-500' :
                      confidence >= 80 ? 'bg-yellow-500' :
                      confidence >= 70 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Threat Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-slate-700/30 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-white mb-2">{threatStats.total}</div>
              <p className="text-sm text-gray-400">Total Threats</p>
            </div>
            <div className="bg-red-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-red-400 mb-2">{threatStats.high}</div>
              <p className="text-sm text-gray-400">High Risk</p>
            </div>
            <div className="bg-yellow-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{threatStats.medium}</div>
              <p className="text-sm text-gray-400">Medium Risk</p>
            </div>
            <div className="bg-blue-500/20 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{threatStats.low}</div>
              <p className="text-sm text-gray-400">Low Risk</p>
            </div>
          </div>

          {/* Model Performance */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-700/30 rounded-2xl p-6"
            >
              <h4 className="text-xl font-semibold text-white mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-3 text-blue-400" />
                Model Performance Metrics
              </h4>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {Object.entries(modelPerformance).map(([metric, value]) => (
                  <div key={metric} className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                      {typeof value === 'number' ? value.toFixed(1) : value}
                      {metric === 'falsePositiveRate' ? '%' : '%'}
                    </div>
                    <p className="text-sm text-gray-400 capitalize">
                      {metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Threat List */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-3 text-red-400" />
              Detected Threats
            </h4>
            
            <AnimatePresence>
              {threats.map((threat, index) => (
                <motion.div
                  key={threat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-700/30 rounded-2xl p-6 border border-slate-600/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${getSeverityColor(threat.severity)}`}>
                        {React.createElement(THREAT_CATEGORIES[threat.type].icon, { size: 20 })}
                      </div>
                      <div>
                        <h5 className="text-lg font-semibold text-white">{threat.category}</h5>
                        <p className="text-sm text-gray-400">{threat.model.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getConfidenceColor(threat.confidence)}`}>
                        {threat.confidence}%
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(threat.severity)}`}>
                        {threat.severity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{threat.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{threat.evidence.transaction_count}</div>
                      <p className="text-xs text-gray-400">Transactions</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{threat.evidence.volume_analyzed}</div>
                      <p className="text-xs text-gray-400">Volume</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{threat.evidence.patterns_detected}</div>
                      <p className="text-xs text-gray-400">Patterns</p>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{threat.evidence.risk_indicators}</div>
                      <p className="text-xs text-gray-400">Risk Indicators</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-600/30 rounded-xl p-4">
                    <h6 className="text-sm font-semibold text-white mb-2">Recommendations:</h6>
                    <ul className="space-y-1">
                      {threat.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isAnalyzing && threats.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-white mb-2">Ready for Analysis</h4>
          <p className="text-gray-400 mb-6">
            Click "Run Analysis" to start the machine learning threat detection process.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Anomaly Detection
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Pattern Recognition
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Behavioral Analysis
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 