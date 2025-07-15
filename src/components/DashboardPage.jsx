// src/components/DashboardPage.jsx
import { motion } from 'framer-motion'
import { useData } from '../context/DataContext'
import ScoreCard from './ScoreCard'
import RiskRadarChart from './RiskRadarChart'
import ActivityTimeline from './ActivityTimeline'
import AlertsFeed from './AlertsFeed'
import TransactionGraph from './TransactionGraph'
import PredictionForm from './PredictionForm'
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
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="space-y-8 p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PredictionForm loading={loading} />
      </motion.div>
      {loading ? (
        <LoadingSkeleton />
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-full text-xl font-light text-text-secondary">
            Analyzing {data.address} on {data.chain.charAt(0).toUpperCase() + data.chain.slice(1)}
          </div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-primary/90 rounded-xl p-5 shadow-lg"
          >
            <ScoreCard score={data.score} />
          </motion.div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-primary/90 rounded-xl p-5 shadow-lg"
          >
            <RiskRadarChart data={data.risks} />
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-primary/90 rounded-xl p-5 shadow-lg"
          >
            <ActivityTimeline events={data.timeline} />
          </motion.div>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-primary/90 rounded-xl p-5 shadow-lg"
          >
            <AlertsFeed alerts={data.alerts} />
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="col-span-full bg-primary/90 rounded-xl p-5 shadow-lg"
          >
            {data.transactions && data.transactions.length > 0 ? (
              <TransactionGraph transactions={data.transactions} address={data.address} />
            ) : (
              <div className="text-center text-text-secondary">No transactions to display</div>
            )}
          </motion.div>
          {data.predictiveRisk !== undefined && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="col-span-full bg-primary/90 rounded-xl p-5 shadow-lg"
            >
              <h2 className="text-text-secondary text-xl font-light mb-3">Predictive Risk</h2>
              <p className="text-accent text-4xl font-bold">{data.predictiveRisk.toFixed(2)}%</p>
              <p className="text-text-secondary text-sm">Chance of anomaly (e.g., rug pull) based on AI analysis.</p>
            </motion.div>
          )}
          {data.reputationScore !== undefined && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="col-span-full bg-primary/90 rounded-xl p-5 shadow-lg"
            >
              <h2 className="text-text-secondary text-xl font-light mb-3">Wallet Reputation</h2>
              <p className="text-accent text-4xl font-bold">{data.reputationScore}%</p>
              <p className="text-text-secondary text-sm">Risk level based on known wallet behavior (mock data).</p>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center mt-20 text-text-secondary text-xl">Enter a wallet or token to analyze</div>
      )}
    </motion.div>
  )
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {[...Array(4)].map((_, i) => (
      <motion.div
        key={i}
        className="bg-primary/90 rounded-xl p-5 animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      >
        <div className="h-4 bg-secondary rounded w-3/4 mb-4"></div>
        <div className="h-32 bg-secondary rounded"></div>
      </motion.div>
    ))}
    <motion.div
      className="lg:col-span-3 bg-primary/90 rounded-xl p-5 animate-pulse"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <div className="h-4 bg-secondary rounded w-3/4 mb-4"></div>
      <div className="h-64 bg-secondary rounded"></div>
    </motion.div>
  </div>
)