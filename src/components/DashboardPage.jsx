// src/components/DashboardPage.jsx
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Coins } from 'lucide-react'
import { useData } from '../context/DataContext'
import ScoreCard from './ScoreCard'
import RiskRadarChart from './RiskRadarChart'
import ActivityTimeline from './ActivityTimeline'
import AlertsFeed from './AlertsFeed'
import PredictionForm from './PredictionForm'
import Topbar from './Topbar'
import TokenDisplay from './TokenDisplay'
import AuthDebug from './AuthDebug'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  exit: { opacity: 0, y: -20 }
}

const formVariants = {
  hidden: { scale: 0.95 },
  visible: { 
    scale: 1,
    transition: { duration: 0.4 }
  }
}

// Memoized components
const AnimatedBackground = memo(() => (
  <div className="fixed inset-0 pointer-events-none">
    <motion.div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #1E40AF 0%, transparent 50%)',
        filter: 'blur(120px)',
        opacity: 0.07
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.07, 0.05, 0.07]
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    {/* Additional gradient layers for better blending */}
    <motion.div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(circle at 80% 20%, #3B82F6 0%, transparent 40%)',
        filter: 'blur(100px)',
        opacity: 0.05
      }}
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.05, 0.07, 0.05]
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
    <motion.div 
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(circle at 20% 80%, #8B5CF6 0%, transparent 40%)',
        filter: 'blur(80px)',
        opacity: 0.04
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.04, 0.06, 0.04]
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </div>
))

const LoadingSkeleton = memo(() => (
  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        className="glass-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-800 rounded w-3/4"></div>
          <div className="h-32 bg-gray-800/50 rounded backdrop-blur"></div>
        </div>
      </motion.div>
    ))}
    <motion.div
      className="lg:col-span-3 glass-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
        <div className="h-64 bg-gray-800/50 rounded backdrop-blur"></div>
      </div>
    </motion.div>
  </div>
))

const VulnerabilityItem = memo(({ issue }) => (
  <div
    className={`p-4 rounded-lg ${
      issue.type === 'critical' ? 'bg-red-950/20 border border-red-900/50' :
      issue.type === 'high' ? 'bg-orange-950/20 border border-orange-900/50' :
      issue.type === 'medium' ? 'bg-yellow-950/20 border border-yellow-900/50' :
      'bg-blue-950/20 border border-blue-900/50'
    }`}
  >
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <div className="font-medium text-gray-200">
          Line {issue.line}: {issue.description}
        </div>
        <div className="text-sm text-gray-400">{issue.recommendation}</div>
      </div>
      <div className={`text-sm font-medium px-2 py-1 rounded ${
        issue.type === 'critical' ? 'bg-red-500/20 text-red-400' :
        issue.type === 'high' ? 'bg-orange-500/20 text-orange-400' :
        issue.type === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-blue-500/20 text-blue-400'
      }`}>
        {issue.type.toUpperCase()}
      </div>
    </div>
  </div>
))

const AnalysisHeader = memo(({ data }) => (
  <div className="col-span-full text-xl font-light text-gray-400">
    {data.code ? (
      <>Analyzing Smart Contract</>
    ) : (
      <>
        Analyzing <span className="text-sky-400">{data.address || 'Contract'}</span> on{' '}
        <span className="text-sky-400">{data.chain ? data.chain.charAt(0).toUpperCase() + data.chain.slice(1) : 'Blockchain'}</span>
      </>
    )}
  </div>
))

const VulnerabilityAnalysis = memo(({ issues }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.5 }}
    className="lg:col-span-3"
  >
    <div className="glass-panel p-6">
      <h2 className="text-gray-400 text-xl font-light mb-4">Vulnerability Analysis</h2>
      <div className="space-y-4">
        {issues.map((issue, index) => (
          <VulnerabilityItem key={index} issue={issue} />
        ))}
      </div>
    </div>
  </motion.div>
))

export default function DashboardPage() {
  const { data, loading } = useData()
  const resultsRef = useRef(null)
  const [userTokens, setUserTokens] = useState(500)

  useEffect(() => {
    if (data?.transactions) {
      
    }
  }, [data?.transactions])

  const dashboardContent = useMemo(() => {
    if (loading) return <LoadingSkeleton />
    if (!data) return null

    // Check if user has enough tokens for scanning
    const hasEnoughTokens = userTokens >= 100;

    return (
      <div className="relative z-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnalysisHeader data={data} />

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <ScoreCard score={data.score} />
            {!hasEnoughTokens && (
              <div className="mt-4 p-4 bg-orange-600/20 border border-orange-600/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-medium">
                    Insufficient tokens for scanning. You need 100 tokens per scan.
                  </span>
                </div>
              </div>
            )}
          </motion.div>

        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <RiskRadarChart data={data.risks} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <ActivityTimeline events={data.timeline} />
        </motion.div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1"
        >
          <AlertsFeed alerts={data.alerts} />
        </motion.div>

        {/* AI Wallet Analysis */}
        <div className="glass-panel p-6">
          <h2 className="text-gray-400 text-xl font-light mb-4">AI Wallet Analysis</h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-4 border border-blue-500/20">
              <h3 className="text-blue-400 font-medium mb-2">Wallet Type & Behavior</h3>
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
            
            <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-lg p-4 border border-green-500/20">
              <h3 className="text-green-400 font-medium mb-2">Risk Assessment</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Based on our AI analysis, this wallet has a risk score of {data.score || 0}/100. 
                {data.walletProfile?.riskLevel === 'high' ? 'High risk indicators detected include sophisticated trading patterns and large transaction volumes.' : 
                 data.walletProfile?.riskLevel === 'medium' ? 'Moderate risk factors present, including some unusual activity patterns and bot-like behavior.' : 
                 'Low risk profile with normal transaction patterns and standard wallet behavior.'}
                The wallet has interacted with {data.walletProfile?.protocols?.join(', ') || 'multiple protocols'}.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/20">
              <h3 className="text-purple-400 font-medium mb-2">AI Insights</h3>
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

        {data.code && data.issues && <VulnerabilityAnalysis issues={data.issues} />}
        </div>
      </div>
    )
  }, [data, loading, userTokens])

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-50 relative overflow-hidden">
      <AnimatedBackground />
      <Topbar />
      
      {/* BETA Indicator */}
      <div className="fixed top-24 right-8 z-40">
        <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          BETA
        </div>
      </div>

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Prominent Token Display */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-600/30 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600/20 rounded-xl">
                  <Coins className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Token Balance</h2>
                  <p className="text-gray-400">Manage your scanning credits</p>
                </div>
              </div>
              <TokenDisplay onTokenUpdate={setUserTokens} />
            </div>
          </div>
        </motion.div>

        <motion.div
          key="dashboard"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
          ref={resultsRef}
        >
          <motion.div
            variants={formVariants}
            className="relative z-10"
          >
            <PredictionForm resultsRef={resultsRef} />
          </motion.div>

          {dashboardContent}
        </motion.div>
      </main>
      <AuthDebug />
    </div>
  )
}