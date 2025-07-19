// src/components/Sidebar.jsx
import { motion } from 'framer-motion'
import { Home, AlertTriangle, Activity, FileText, Settings, Code } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: AlertTriangle, label: 'Alerts', path: '/alerts' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: FileText, label: 'Investigation', path: '/investigation' },
  { icon: Code, label: 'Contract Scanner', path: '/contract-scanner' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <motion.aside
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-primary border-r border-secondary flex flex-col p-4 space-y-4"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="text-2xl font-bold text-accent">DeSpy AI</div>
      <nav className="space-y-2" role="menubar">
        {navItems.map(({ icon: Icon, label, path }, i) => {
          const isActive = location.pathname === path
          return (
            <Link 
              to={path} 
              key={label}
              className={`w-full flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-secondary ${
                isActive 
                  ? 'bg-secondary text-white' 
                  : 'text-gray-300 hover:bg-secondary hover:text-white'
              }`}
              role="menuitem"
              aria-label={`Navigate to ${label}`}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </motion.aside>
  )
}