// src/components/DashboardPage.jsx
import { motion } from 'framer-motion'
import { useData } from '../context/DataContext'
import ScoreCard from './ScoreCard'
import RiskRadarChart from './RiskRadarChart'
import ActivityTimeline from './ActivityTimeline'
import AlertsFeed from './AlertsFeed'
import TransactionGraph from './TransactionGraph'
import PredictionForm from './PredictionForm'
import Topbar from './Topbar'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data, loading } = useData()

  useEffect(() => {
    if (data?.transactions) {
      console.log('Transactions data:', data.transactions)
    } else {
      console.log('No transactions data available')
    }
  }, [data?.transactions])

  return (
    <div className="min-h-screen bg-[#0B0F17] text-gray-50 relative overflow-hidden">
      {/* Animated background effects */}
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
        <motion.div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 80% 20%, #1E40AF 0%, transparent 40%)',
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
      </div>

      <Topbar />
      
      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-8"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            <PredictionForm />
          </motion.div>

          {loading ? (
            <LoadingSkeleton />
          ) : data ? (
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-full text-xl font-light text-gray-400">
                {data.code ? (
                  <>Analyzing Smart Contract</>
                ) : (
                  <>
                    Analyzing <span className="text-sky-400">{data.address}</span> on{' '}
                    <span className="text-sky-400">{data.chain.charAt(0).toUpperCase() + data.chain.slice(1)}</span>
                  </>
                )}
              </div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-1"
              >
                <ScoreCard score={data.score} />
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

              {data.transactions && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="lg:col-span-3"
                >
                  <div className="glass-panel p-6">
                    <h2 className="text-gray-400 text-xl font-light mb-4">Transaction History</h2>
                    <TransactionGraph transactions={data.transactions} address={data.address} />
                  </div>
                </motion.div>
              )}

              {data.code && data.issues && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="lg:col-span-3"
                >
                  <div className="glass-panel p-6">
                    <h2 className="text-gray-400 text-xl font-light mb-4">Vulnerability Analysis</h2>
                    <div className="space-y-4">
                      {data.issues.map((issue, index) => (
                        <div
                          key={index}
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
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : null}
        </motion.div>
      </main>
    </div>
  )
}

const LoadingSkeleton = () => (
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
)