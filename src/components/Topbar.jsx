import { User, Bell } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Topbar() {
  const date = new Date().toLocaleString()

  return (
    <header className="bg-primary border-b border-secondary p-4 flex justify-between items-center">
      <div className="text-lg font-semibold">Threat Intel Dashboard</div>
      <div className="flex items-center space-x-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-text-secondary"
        >
          Live: {date}
        </motion.div>
        <Bell size={20} className="cursor-pointer" />
        <User size={20} className="cursor-pointer" />
      </div>
    </header>
  )
}