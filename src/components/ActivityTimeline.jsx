import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

export default function ActivityTimeline({ events }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-primary rounded-lg p-4 shadow-lg"
    >
      <div className="text-text-secondary mb-2">Activity Timeline</div>
      <ul className="space-y-4">
        {events.map((event, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start space-x-2"
          >
            <Clock size={16} className="text-accent mt-1" />
            <div>
              <div className="font-semibold">{event.date}</div>
              <div className="text-text-secondary">{event.event}</div>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}