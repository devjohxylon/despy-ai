// src/components/Sidebar.jsx
import { motion } from 'framer-motion'
import { Home, AlertTriangle, Activity, FileText, Settings, Code } from 'lucide-react'
import { Link } from 'react-router-dom'

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: AlertTriangle, label: 'Alerts', path: '/alerts' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: FileText, label: 'Investigation', path: '/investigation' },
  { icon: Code, label: 'Contract Scanner', path: '/contract-scanner' },
  { icon: Settings, label: 'Settings', path: '/settings' },
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
        {navItems.map(({ icon: Icon, label, path }, i) => (
          <Link to={path} key={label}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary cursor-pointer"
            >
              <Icon size={20} />
              <span>{label}</span>
            </motion.div>
          </Link>
        ))}
      </nav>
    </motion.aside>
  )
}