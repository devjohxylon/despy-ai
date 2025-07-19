// src/components/DashboardPage.jsx
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, TrendingUp, Users, Zap, Shield, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { useData } from '../context/DataContext'
import ScoreCard from './ScoreCard'
import RiskRadarChart from './RiskRadarChart'
import ActivityTimeline from './ActivityTimeline'
import AlertsFeed from './AlertsFeed'
import PredictionForm from './PredictionForm'
import Topbar from './Topbar'
import TokenDisplay from './TokenDisplay'
import Leaderboard from './Leaderboard'

// Simplified animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
}

const formVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  }
}

// Optimized background - static instead of animated
const StaticBackground = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div className="absolute inset-0 opacity-20" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }} />
  </div>
)

export default memo(function DashboardPage() {
  const { data, loading } = useData()
  const [userTokens, setUserTokens] = useState(500)
  const [showTokenSystem, setShowTokenSystem] = useState(false)
  const resultsRef = useRef(null)

  // Memoized dashboard content to prevent unnecessary re-renders
  const dashboardContent = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      )
    }

    return (
      <div className="space-y-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Scans</p>
                <p className="text-3xl font-bold text-white mt-1">1,247</p>
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% this week
                </p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Zap className="w-7 h-7 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Active Users</p>
                <p className="text-3xl font-bold text-white mt-1">892</p>
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +8% this week
                </p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Users className="w-7 h-7 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Risk Detected</p>
                <p className="text-3xl font-bold text-white mt-1">23</p>
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  -5% this week
                </p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-xl">
                <Shield className="w-7 h-7 text-red-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-white mt-1">98.2%</p>
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  +0.5% this week
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <TrendingUp className="w-7 h-7 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Analysis */}
          <div className="lg:col-span-2 space-y-8">
            {/* Risk Score and Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
                <ScoreCard score={data.score || 0} />
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-400" />
                  Risk Analysis
                </h3>
                <RiskRadarChart data={data.risks || []} />
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Activity Timeline
              </h3>
              <ActivityTimeline events={data.timeline || []} />
            </div>

            {/* AI Wallet Analysis */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-400" />
                AI Wallet Analysis
              </h3>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                  <h4 className="text-blue-400 font-semibold mb-3 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Wallet Type & Behavior
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    This is a <strong className="text-white">{data.walletProfile?.name || 'Unknown'}</strong> wallet with {data.transactions?.length || 0} transactions. 
                    {data.walletProfile?.description && ` ${data.walletProfile.description}.`} The wallet shows patterns consistent with 
                    {data.walletProfile?.transactionPattern === 'frequent_large' ? ' high-volume DeFi trading' : 
                     data.walletProfile?.transactionPattern === 'high_frequency' ? ' sophisticated arbitrage bot activity' :
                     data.walletProfile?.transactionPattern === 'nft_focused' ? ' active NFT trading and collection' :
                     ' normal crypto user behavior'}, 
                    including {data.walletProfile?.protocols?.length || 0} different protocol interactions.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-6">
                  <h4 className="text-green-400 font-semibold mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Risk Assessment
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Based on our AI analysis, this wallet has a risk score of <strong className="text-white">{data.score || 0}/100</strong>. 
                    {data.walletProfile?.riskLevel === 'high' ? 'High risk indicators detected include sophisticated trading patterns and large transaction volumes.' : 
                     data.walletProfile?.riskLevel === 'medium' ? 'Moderate risk factors present, including some unusual activity patterns and bot-like behavior.' : 
                     'Low risk profile with normal transaction patterns and standard wallet behavior.'}
                    The wallet has interacted with {data.walletProfile?.protocols?.join(', ') || 'multiple protocols'}.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
                  <h4 className="text-purple-400 font-semibold mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    AI Insights
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Our AI has identified <strong className="text-white">{data.alerts?.length || 0}</strong> potential risk factors and analyzed 
                    <strong className="text-white"> {data.transactions?.length || 0}</strong> transactions for patterns. The wallet's behavior suggests 
                    {data.walletProfile?.riskLevel === 'high' ? ' potential involvement in sophisticated trading strategies' : 
                     data.walletProfile?.riskLevel === 'medium' ? ' some automated trading patterns that warrant monitoring' : 
                     ' normal trading and investment behavior'}. 
                    Average transaction value: <strong className="text-white">{data.analytics?.averageTransactionValue || '0'} {data.chain === 'ethereum' ? 'ETH' : 'SOL'}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Token Display */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
              <TokenDisplay 
                tokens={userTokens}
                onPurchase={() => setShowTokenSystem(true)}
              />
            </div>

            {/* Leaderboard */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
                Top Scanners
              </h3>
              <Leaderboard />
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-orange-400" />
                Quick Actions
              </h3>
              <div className="space-y-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Scan New Wallet
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" />
                  View Reports
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                  <Coins className="w-4 h-4" />
                  Buy Tokens
                </button>
              </div>
            </div>

            {/* Alerts Feed */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                Recent Alerts
              </h3>
              <AlertsFeed alerts={data.alerts || []} />
            </div>
          </div>
        </div>

        {/* Prediction Form */}
        <motion.div
          variants={formVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300"
        >
          <PredictionForm onResults={resultsRef} />
        </motion.div>
      </div>
    )
  }, [data, loading])

  return (
    <div className="min-h-screen bg-slate-900 text-gray-50 relative overflow-hidden">
      <StaticBackground />
      
      <div className="relative z-10">
        <Topbar />
        
        <div className="container mx-auto px-4 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                <p className="text-gray-400">Monitor your blockchain security analysis and insights</p>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowTokenSystem(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Coins className="w-4 h-4" />
                  Buy Tokens
                </button>
              </div>
            </div>

            {dashboardContent}
          </motion.div>
        </div>
      </div>

      {/* Token System Modal */}
      {showTokenSystem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Token System</h2>
              <button
                onClick={() => setShowTokenSystem(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <TokenDisplay 
              tokens={userTokens}
              onPurchase={() => setShowTokenSystem(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
})