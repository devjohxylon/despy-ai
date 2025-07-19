// src/components/DashboardPage.jsx
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, TrendingUp, Users, Zap, Shield, Activity, AlertTriangle, CheckCircle, Eye, Lock, Cpu, BarChart3 } from 'lucide-react'
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
  <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Loading your dashboard...</p>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-12">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">Total Scans</p>
                <p className="text-4xl font-bold text-white mb-2">1,247</p>
                <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  +12% this week
                </p>
              </div>
              <div className="p-4 bg-blue-500/20 rounded-2xl">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">Active Users</p>
                <p className="text-4xl font-bold text-white mb-2">892</p>
                <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  +8% this week
                </p>
              </div>
              <div className="p-4 bg-green-500/20 rounded-2xl">
                <Users className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">Risk Detected</p>
                <p className="text-4xl font-bold text-white mb-2">23</p>
                <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  -5% this week
                </p>
              </div>
              <div className="p-4 bg-red-500/20 rounded-2xl">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">Success Rate</p>
                <p className="text-4xl font-bold text-white mb-2">98.2%</p>
                <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  +0.5% this week
                </p>
              </div>
              <div className="p-4 bg-purple-500/20 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Analysis */}
          <div className="lg:col-span-2 space-y-12">
            {/* Risk Score and Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300"
              >
                <ScoreCard score={data.score || 0} />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300"
              >
                <h3 className="text-2xl font-semibold text-white mb-8 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                  Risk Analysis
                </h3>
                <RiskRadarChart data={data.risks || []} />
              </motion.div>
            </div>

            {/* Activity Timeline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <Activity className="w-6 h-6 mr-3 text-green-400" />
                Activity Timeline
              </h3>
              <ActivityTimeline events={data.timeline || []} />
            </motion.div>

            {/* AI Wallet Analysis */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <Cpu className="w-6 h-6 mr-3 text-purple-400" />
                AI Wallet Analysis
              </h3>
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
                  <h4 className="text-blue-400 font-semibold text-lg mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-3" />
                    Wallet Type & Behavior
                  </h4>
                  <p className="text-gray-300 text-base leading-relaxed">
                    This is a <strong className="text-white">{data.walletProfile?.name || 'Unknown'}</strong> wallet with {data.transactions?.length || 0} transactions. 
                    {data.walletProfile?.description && ` ${data.walletProfile.description}.`} The wallet shows patterns consistent with 
                    {data.walletProfile?.transactionPattern === 'frequent_large' ? ' high-volume DeFi trading' : 
                     data.walletProfile?.transactionPattern === 'high_frequency' ? ' sophisticated arbitrage bot activity' :
                     data.walletProfile?.transactionPattern === 'nft_focused' ? ' active NFT trading and collection' :
                     ' normal crypto user behavior'}, 
                    including {data.walletProfile?.protocols?.length || 0} different protocol interactions.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-2xl p-8">
                  <h4 className="text-green-400 font-semibold text-lg mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-3" />
                    Risk Assessment
                  </h4>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Based on our AI analysis, this wallet has a risk score of <strong className="text-white">{data.score || 0}/100</strong>. 
                    {data.walletProfile?.riskLevel === 'high' ? 'High risk indicators detected include sophisticated trading patterns and large transaction volumes.' : 
                     data.walletProfile?.riskLevel === 'medium' ? 'Moderate risk factors present, including some unusual activity patterns and bot-like behavior.' : 
                     'Low risk profile with normal transaction patterns and standard wallet behavior.'}
                    The wallet has interacted with {data.walletProfile?.protocols?.join(', ') || 'multiple protocols'}.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8">
                  <h4 className="text-purple-400 font-semibold text-lg mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-3" />
                    AI Insights
                  </h4>
                  <p className="text-gray-300 text-base leading-relaxed">
                    Our AI has identified <strong className="text-white">{data.alerts?.length || 0}</strong> potential risk factors and analyzed 
                    <strong className="text-white"> {data.transactions?.length || 0}</strong> transactions for patterns. The wallet's behavior suggests 
                    {data.walletProfile?.riskLevel === 'high' ? ' potential involvement in sophisticated trading strategies' : 
                     data.walletProfile?.riskLevel === 'medium' ? ' some automated trading patterns that warrant monitoring' : 
                     ' normal trading and investment behavior'}. 
                    Average transaction value: <strong className="text-white">{data.analytics?.averageTransactionValue || '0'} {data.chain === 'ethereum' ? 'ETH' : 'SOL'}</strong>.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-12">
            {/* Token Display */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300"
            >
              <TokenDisplay 
                tokens={userTokens} 
                onTokenUpdate={setUserTokens}
                onOpenTokenSystem={() => setShowTokenSystem(true)}
              />
            </motion.div>

            {/* Recent Alerts */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-red-400" />
                Recent Alerts
              </h3>
              <AlertsFeed alerts={data.alerts || []} />
            </motion.div>

            {/* Leaderboard */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold text-white mb-8 flex items-center">
                <TrendingUp className="w-6 h-6 mr-3 text-yellow-400" />
                Top Scanners
              </h3>
              <Leaderboard />
            </motion.div>
          </div>
        </div>

        {/* Analysis Form */}
        <motion.div 
          ref={resultsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/70 transition-all duration-300"
        >
          <PredictionForm resultsRef={resultsRef} />
        </motion.div>
      </div>
    )
  }, [data, loading, userTokens])

  return (
    <div className="min-h-screen bg-slate-950 text-gray-50 relative overflow-hidden">
      <StaticBackground />
      
      <div className="relative z-10">
        <Topbar />
        
        <main className="container mx-auto px-6 py-8 pt-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Page Header */}
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                DeSpy AI Dashboard
              </h1>
              <p className="text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Advanced blockchain analysis for Ethereum & Solana with real-time risk assessment
              </p>
            </div>

            {dashboardContent}
          </motion.div>
        </main>
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