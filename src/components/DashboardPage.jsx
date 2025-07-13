import { motion } from 'framer-motion'
import { useData } from '../context/DataContext'
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
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {loading ? (
        <div className="col-span-full">
          <LoadingSkeleton />
        </div>
      ) : data ? (
        <>
          <ScoreCard score={data.score} />
          <RiskRadarChart data={data.risks} />
          <ActivityTimeline events={data.timeline} />
          <AlertsFeed alerts={data.alerts} />
          <div className="md:col-span-2 lg:col-span-3">
            <TransactionGraph transactions={data.transactions} address={data.address} />
          </div>
        </>
      ) : (
        <div className="text-center mt-20 text-text-secondary col-span-full">Enter a wallet or token to analyze</div>
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