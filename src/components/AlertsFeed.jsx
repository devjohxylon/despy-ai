import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, XCircle, Bell, Info } from 'lucide-react'

const getAlertIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'critical':
      return <XCircle className="text-red-400" size={20} />
    case 'warning':
      return <AlertTriangle className="text-amber-400" size={20} />
    case 'info':
      return <Info className="text-sky-400" size={20} />
    case 'notification':
      return <Bell className="text-emerald-400" size={20} />
    default:
      return <AlertCircle className="text-gray-400" size={20} />
  }
}

const getAlertClass = (type) => {
  switch (type?.toLowerCase()) {
    case 'critical':
      return 'bg-red-950/30 border-red-900/50'
    case 'warning':
      return 'bg-amber-950/30 border-amber-900/50'
    case 'info':
      return 'bg-sky-950/30 border-sky-900/50'
    case 'notification':
      return 'bg-emerald-950/30 border-emerald-900/50'
    default:
      return 'bg-gray-900/30 border-gray-800/50'
  }
}

const getAlertTextClass = (type) => {
  switch (type?.toLowerCase()) {
    case 'critical':
      return 'text-red-400'
    case 'warning':
      return 'text-amber-400'
    case 'info':
      return 'text-sky-400'
    case 'notification':
      return 'text-emerald-400'
    default:
      return 'text-gray-400'
  }
}

export default function AlertsFeed({ alerts }) {
  if (!alerts?.length) {
    return (
      <div className="glass-panel p-6">
        <h2 className="text-gray-400 text-xl font-light mb-4">Recent Alerts</h2>
        <div className="text-gray-500 text-center py-4">No alerts to display</div>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-400 text-xl font-light">Recent Alerts</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span className="text-gray-500">Critical</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-gray-500">Warning</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            <span className="text-gray-500">Info</span>
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`border rounded-lg p-4 ${getAlertClass(alert.type)}`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-1">
                {getAlertIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-medium mb-1 ${getAlertTextClass(alert.type)}`}>
                  {alert.message}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </div>
                {alert.details && (
                  <div className="mt-2 text-sm text-gray-400">
                    {alert.details}
                  </div>
                )}
                {alert.recommendation && (
                  <div className="mt-2 text-sm text-gray-400">
                    Recommendation: {alert.recommendation}
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