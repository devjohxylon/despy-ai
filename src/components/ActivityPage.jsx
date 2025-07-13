import { motion } from 'framer-motion'
import { useData } from '../context/DataContext'
import ActivityTimeline from './ActivityTimeline'

export default function ActivityPage() {
  const { data } = useData()

  return (
    <motion.div
      key="activity"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5 }}
      className="bg-primary rounded-lg p-6 shadow-lg h-full"
    >
      <h2 className="text-text-secondary text-xl mb-4">Activity History</h2>
      {data?.timeline?.length > 0 ? (
        <ActivityTimeline events={data.timeline} />
      ) : (
        <div className="text-text-secondary text-center mt-10">No activity recorded</div>
      )}
    </motion.div>
  )
}