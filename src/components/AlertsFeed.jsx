import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function AlertsFeed({ alerts }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-primary rounded-lg p-4 shadow-lg"
    >
      <div className="text-text-secondary mb-2">Recent Alerts</div>
      <ul className="space-y-4">
        {alerts.map((alert, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-start space-x-2 text-${alert.type}`}
          >
            <AlertTriangle size={16} className="mt-1" />
            <div>
              <div className="font-semibold">{alert.message}</div>
              <div className="text-text-secondary text-sm">{alert.date} - Score: {alert.score}</div>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}