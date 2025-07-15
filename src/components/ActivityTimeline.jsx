import { motion } from 'framer-motion'
import { Clock, AlertTriangle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

const getEventIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'warning':
      return <AlertTriangle className="text-amber-400" size={18} />
    case 'success':
      return <CheckCircle2 className="text-emerald-400" size={18} />
    case 'error':
      return <XCircle className="text-red-400" size={18} />
    case 'info':
      return <AlertCircle className="text-sky-400" size={18} />
    default:
      return <Clock className="text-gray-400" size={18} />
  }
}

const getEventClass = (type) => {
  switch (type?.toLowerCase()) {
    case 'warning':
      return 'text-amber-400'
    case 'success':
      return 'text-emerald-400'
    case 'error':
      return 'text-red-400'
    case 'info':
      return 'text-sky-400'
    default:
      return 'text-gray-400'
  }
}

export default function ActivityTimeline({ events }) {
  if (!events?.length) {
    return (
      <div className="glass-panel p-6">
        <h2 className="text-gray-400 text-xl font-light mb-4">Activity Timeline</h2>
        <div className="text-gray-500 text-center py-4">No activity recorded</div>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6">
      <h2 className="text-gray-400 text-xl font-light mb-6">Activity Timeline</h2>
      <div className="space-y-4">
        {events.map((event, i) => (
          <motion.div
            key={event.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative pl-6 pb-4 last:pb-0"
          >
            {/* Timeline line */}
            {i !== events.length - 1 && (
              <div className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-gray-800"></div>
            )}
            
            <div className="flex gap-3">
              {/* Icon */}
              <div className="absolute left-0 top-1 bg-gray-950 rounded-full p-0.5">
                {getEventIcon(event.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={`font-medium mb-1 ${getEventClass(event.type)}`}>
                  {event.event}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </div>
                {event.details && (
                  <div className="mt-2 text-sm text-gray-400">
                    {event.details}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}