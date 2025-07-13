import { motion } from 'framer-motion'
import { Home, AlertTriangle, Activity, Map, Settings } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Dashboard' },
  { icon: AlertTriangle, label: 'Alerts' },
  { icon: Activity, label: 'Activity' },
  { icon: Map, label: 'Map' },
  { icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-primary border-r border-secondary flex flex-col p-4 space-y-4"
    >
      <div className="text-2xl font-bold text-accent">DeSpy AI</div>
      <nav className="space-y-2">
        {navItems.map(({ icon: Icon, label }, i) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary"
          >
            <Icon size={20} />
            <span>{label}</span>
          </motion.button>
        ))}
      </nav>
    </motion.aside>
  )
}