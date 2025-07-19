import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react'

const getTransactionIcon = (type) => {
  switch (type) {
    case 'incoming':
      return <ArrowDownRight className="w-4 h-4 text-green-400" />
    case 'outgoing':
      return <ArrowUpRight className="w-4 h-4 text-red-400" />
    case 'alert':
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />
    default:
      return <Clock className="w-4 h-4 text-gray-400" />
  }
}

const getTransactionColor = (type) => {
  switch (type) {
    case 'incoming':
      return 'border-green-500/20 bg-green-500/10'
    case 'outgoing':
      return 'border-red-500/20 bg-red-500/10'
    case 'alert':
      return 'border-yellow-500/20 bg-yellow-500/10'
    default:
      return 'border-gray-500/20 bg-gray-500/10'
  }
}

// Virtual scrolling component for large datasets
const VirtualizedTimeline = ({ events, itemHeight = 80 }) => {
  const [scrollTop, setScrollTop] = useState(0)
  const containerHeight = 400
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const totalHeight = events.length * itemHeight
  
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount + 1, events.length)
  const visibleEvents = events.slice(startIndex, endIndex)
  
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop)
  }
  
  return (
    <div 
      className="overflow-y-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="log"
      aria-label="Activity timeline"
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleEvents.map((event, index) => {
          const actualIndex = startIndex + index
          const top = actualIndex * itemHeight
          
          return (
            <div
              key={event.id || actualIndex}
              style={{
                position: 'absolute',
                top,
                height: itemHeight,
                width: '100%'
              }}
            >
              <TimelineItem event={event} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

const TimelineItem = ({ event }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className={`flex items-start gap-4 p-4 rounded-lg border ${getTransactionColor(event.type)}`}
  >
    <div className="flex-shrink-0 mt-1">
      {getTransactionIcon(event.type)}
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm font-medium text-white truncate">
          {event.title}
        </h4>
        <span className="text-xs text-gray-400">
          {event.timestamp}
        </span>
      </div>
      
      <p className="text-sm text-gray-300 mb-2">
        {event.description}
      </p>
      
      {event.amount && (
        <div className="text-sm font-mono text-gray-300">
          {event.amount} {event.currency || 'ETH'}
        </div>
      )}
      
      {event.hash && (
        <div className="text-xs text-gray-500 font-mono truncate">
          {event.hash}
        </div>
      )}
    </div>
  </motion.div>
)

export default function ActivityTimeline({ events = [] }) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }, [events])

  const shouldUseVirtualization = events.length > 50

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Activity Timeline</h2>
        <div className="text-sm text-gray-400">
          {events.length} events
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" aria-hidden="true" />
          <p className="text-gray-400">No activity yet</p>
          <p className="text-sm text-gray-500">Transaction history will appear here</p>
        </div>
      ) : shouldUseVirtualization ? (
        <VirtualizedTimeline events={sortedEvents} />
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto" role="log" aria-label="Activity timeline">
          {sortedEvents.map((event, index) => (
            <TimelineItem key={event.id || index} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}