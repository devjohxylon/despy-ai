// src/components/Topbar.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Settings, HelpCircle, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { toast } from 'react-hot-toast'

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()
  const { data } = useData()

  // Get real notifications from data context, or show empty state
  const notifications = data?.alerts?.slice(0, 3) || []

  const handleComingSoon = (e) => {
    e.preventDefault()
    toast.info('Coming Soon!', {
      duration: 2000,
      style: { background: '#141B2D', color: '#F8FAFC' }
    })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 topbar-glass">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-gray-200 hover:text-white transition-colors font-medium">
              Dashboard
            </Link>
            <button onClick={handleComingSoon} className="text-gray-500 cursor-not-allowed font-medium">
              Reports
            </button>
            <button onClick={handleComingSoon} className="text-gray-500 cursor-not-allowed font-medium">
              Monitoring
            </button>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Help */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
              <HelpCircle size={20} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-white transition-colors relative rounded-lg hover:bg-white/10"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-3 w-80 dashboard-card py-2"
                >
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const timeAgo = new Date(notification.timestamp) > new Date() - 86400000 ? 
                        Math.floor((new Date() - new Date(notification.timestamp)) / 60000) + ' min ago' :
                        new Date(notification.timestamp).toLocaleDateString()
                      
                      return (
                        <div
                          key={notification.id}
                          className="px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <div className="flex justify-between items-start">
                            <div className="text-sm text-gray-200">{notification.message}</div>
                            <div className="text-xs text-gray-500">{timeAgo}</div>
                          </div>
                          <div className={`text-xs mt-2 px-2 py-1 rounded-full inline-block ${
                            notification.type === 'critical' ? 'bg-red-500/20 text-red-400' :
                            notification.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {notification.type.toUpperCase()}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm text-gray-400 font-medium">No new notifications</p>
                      <p className="text-xs text-gray-500 mt-1">Analyze an address to see security alerts</p>
                    </div>
                  )}
                  <div className="border-t border-gray-700 mt-2 pt-2 px-4">
                    <button
                      onClick={handleComingSoon}
                      className="text-sm text-sky-400 hover:text-sky-300 transition-colors font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-200 font-medium">
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-400 hover:text-white transition-colors font-medium px-3 py-1 rounded-lg hover:bg-white/10"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/auth/google"
                  className="text-sm text-gray-200 hover:text-white transition-colors font-medium px-3 py-1 rounded-lg hover:bg-white/10"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-gray-700 bg-gray-900/95 backdrop-blur-xl"
        >
          <div className="px-6 py-4 space-y-4">
            <Link
              to="/dashboard"
              className="block text-gray-200 hover:text-white transition-colors font-medium"
            >
              Dashboard
            </Link>
            <button
              onClick={handleComingSoon}
              className="block w-full text-left text-gray-500 cursor-not-allowed font-medium"
            >
              Reports
            </button>
            <button
              onClick={handleComingSoon}
              className="block w-full text-left text-gray-500 cursor-not-allowed font-medium"
            >
              Monitoring
            </button>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="block w-full text-left text-gray-200 hover:text-white transition-colors font-medium"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/auth/google"
                className="block text-gray-200 hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </header>
  )
}