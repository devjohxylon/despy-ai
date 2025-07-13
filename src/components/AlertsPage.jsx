import { motion } from 'framer-motion'
import { useData } from '../context/DataContext'
import AlertsFeed from './AlertsFeed'

export default function AlertsPage() {
  const { data } = useData()

  return (
    <motion.div
      key="alerts"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-primary rounded-lg p-6 shadow-lg h-full"
    >
      <h2 className="text-text-secondary text-xl mb-4">Alerts Overview</h2>
      {data?.alerts?.length > 0 ? (
        <AlertsFeed alerts={data.alerts} />
      ) : (
        <div className="text-text-secondary text-center mt-10">No alerts detected</div>
      )}
    </motion.div>
  )
}