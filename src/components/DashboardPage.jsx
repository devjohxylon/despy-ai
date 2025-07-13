// src/components/DashboardPage.jsx
import { motion } from 'framer-motion'
import { useData } from '../context/DataContext'
import PredictionForm from './PredictionForm'
import ScoreCard from './ScoreCard'
import RiskRadarChart from './RiskRadarChart'
import ActivityTimeline from './ActivityTimeline'
import AlertsFeed from './AlertsFeed'
import TransactionGraph from './TransactionGraph'

export default function DashboardPage() {
  const { data, loading } = useData()

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <PredictionForm loading={loading} />
      {loading ? (
        <LoadingSkeleton />
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full text-text-secondary">Analyzing on {data.chain.charAt(0).toUpperCase() + data.chain.slice(1)}</div>
          <ScoreCard score={data.score} />
          <RiskRadarChart data={data.risks} />
          <ActivityTimeline events={data.timeline} />
          <AlertsFeed alerts={data.alerts} />
          <div className="md:col-span-2 lg:col-span-3">
            <TransactionGraph transactions={data.transactions} address={data.address} />
          </div>
          <div className="col-span-full bg-primary rounded-lg p-4 shadow-lg">
            <h2 className="text-text-secondary text-xl mb-4">Predictive Risk</h2>
            <p className="text-accent text-3xl">{data.predictiveRisk.toFixed(2)}%</p>
            <p className="text-text-secondary">Chance of anomaly (e.g., rug pull) based on AI analysis.</p>
          </div>
        </div>
      ) : (
        <div className="text-center mt-20 text-text-secondary">Enter a wallet or token to analyze</div>
      )}
    </motion.div>
  )
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-primary rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-secondary rounded w-3/4 mb-4"></div>
        <div className="h-32 bg-secondary rounded"></div>
      </div>
    ))}
    <div className="md:col-span-2 lg:col-span-3 bg-primary rounded-lg p-4 animate-pulse">
      <div className="h-4 bg-secondary rounded w-3/4 mb-4"></div>
      <div className="h-64 bg-secondary rounded"></div>
    </div>
  </div>
)