// src/components/DashboardPage.jsx
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, TrendingUp, Users, Zap, Shield, Activity } from 'lucide-react'
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
    <div className="absolute inset-0 opacity-30" style={{
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
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Scans</p>
                <p className="text-2xl font-bold text-white">1,247</p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">892</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Risk Detected</p>
                <p className="text-2xl font-bold text-white">23</p>
              </div>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-white">98.2%</p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Risk Score and Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScoreCard score={data.score || 0} />
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Analysis</h3>
                <RiskRadarChart data={data.risks || []} />
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>
              <ActivityTimeline events={data.timeline || []} />
            </div>

            {/* AI Wallet Analysis */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Wallet Analysis</h3>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Wallet Type & Behavior</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    This is a <strong>{data.walletProfile?.name || 'Unknown'}</strong> wallet with {data.transactions?.length || 0} transactions. 
                    {data.walletProfile?.description && ` ${data.walletProfile.description}.`} The wallet shows patterns consistent with 
                    {data.walletProfile?.transactionPattern === 'frequent_large' ? ' high-volume DeFi trading' : 
                     data.walletProfile?.transactionPattern === 'high_frequency' ? ' sophisticated arbitrage bot activity' :
                     data.walletProfile?.transactionPattern === 'nft_focused' ? ' active NFT trading and collection' :
                     ' normal crypto user behavior'}, 
                    including {data.walletProfile?.protocols?.length || 0} different protocol interactions.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">Risk Assessment</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Based on our AI analysis, this wallet has a risk score of {data.score || 0}/100. 
                    {data.walletProfile?.riskLevel === 'high' ? 'High risk indicators detected include sophisticated trading patterns and large transaction volumes.' : 
                     data.walletProfile?.riskLevel === 'medium' ? 'Moderate risk factors present, including some unusual activity patterns and bot-like behavior.' : 
                     'Low risk profile with normal transaction patterns and standard wallet behavior.'}
                    The wallet has interacted with {data.walletProfile?.protocols?.join(', ') || 'multiple protocols'}.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-purple-400 font-medium mb-2">AI Insights</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Our AI has identified {data.alerts?.length || 0} potential risk factors and analyzed 
                    {data.transactions?.length || 0} transactions for patterns. The wallet's behavior suggests 
                    {data.walletProfile?.riskLevel === 'high' ? ' potential involvement in sophisticated trading strategies' : 
                     data.walletProfile?.riskLevel === 'medium' ? ' some automated trading patterns that warrant monitoring' : 
                     ' normal trading and investment behavior'}. 
                    Average transaction value: {data.analytics?.averageTransactionValue || '0'} {data.chain === 'ethereum' ? 'ETH' : 'SOL'}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Token Display */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <TokenDisplay 
                tokens={userTokens} 
                onTokenUpdate={setUserTokens}
                onOpenTokenSystem={() => setShowTokenSystem(true)}
              />
            </div>

            {/* Recent Alerts */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Alerts</h3>
              <AlertsFeed alerts={data.alerts || []} />
            </div>

            {/* Leaderboard */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Top Scanners</h3>
              <Leaderboard />
            </div>
          </div>
        </div>

        {/* Analysis Form */}
        <div ref={resultsRef}>
          <PredictionForm resultsRef={resultsRef} />
        </div>
      </div>
    )
  }, [data, loading, userTokens])

  return (
    <div className="min-h-screen bg-slate-900 text-gray-50 relative overflow-hidden">
      <StaticBackground />
      
      <div className="relative z-10">
        <Topbar />
        
        <main className="container mx-auto px-4 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Page Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">
                DeSpy AI Dashboard
              </h1>
              <p className="text-gray-400 text-lg">
                Advanced blockchain analysis for Ethereum & Solana
              </p>
            </div>

            {dashboardContent}
          </motion.div>
        </main>
      </div>
    </div>
  )
})