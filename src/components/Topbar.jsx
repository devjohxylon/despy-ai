// src/components/Topbar.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Settings, HelpCircle, User, LogOut, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function Topbar() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const notifications = [
    {
      id: 1,
      type: 'info',
      message: 'New security update available',
      time: '2 min ago'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Unusual activity detected in monitored contract',
      time: '15 min ago'
    },
    {
      id: 3,
      type: 'success',
      message: 'Analysis report ready for download',
      time: '1 hour ago'
    }
  ]

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setShowUserMenu(false)
  }

  const handleComingSoon = (e) => {
    e.preventDefault()
    toast.info('Coming Soon!', {
      duration: 2000,
      style: { background: '#141B2D', color: '#F8FAFC' }
    })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          {/* Desktop Navigation */}
          <nav className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <button onClick={handleComingSoon} className="text-gray-500 cursor-not-allowed">
              Reports
            </button>
            <button onClick={handleComingSoon} className="text-gray-500 cursor-not-allowed">
              Monitoring
            </button>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Help */}
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <HelpCircle size={20} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-white transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-sky-500 rounded-full" />
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-lg border border-gray-800 py-2"
                >
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-gray-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm text-gray-300">{notification.message}</div>
                        <div className="text-xs text-gray-500">{notification.time}</div>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-800 mt-2 pt-2 px-4">
                    <button
                      onClick={handleComingSoon}
                      className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-medium">
                    J
                  </div>
                  <span className="text-gray-300">John Doe</span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-gray-800 py-2"
                  >
                    <button
                      onClick={handleComingSoon}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800/50 transition-colors flex items-center space-x-2"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={handleComingSoon}
                      className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800/50 transition-colors flex items-center space-x-2"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <div className="border-t border-gray-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800/50 transition-colors flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
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
          className="md:hidden border-t border-gray-800"
        >
          <div className="px-4 py-4 space-y-4">
            <Link
              to="/dashboard"
              className="block text-gray-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <button
              onClick={handleComingSoon}
              className="block w-full text-left text-gray-500 cursor-not-allowed"
            >
              Reports
            </button>
            <button
              onClick={handleComingSoon}
              className="block w-full text-left text-gray-500 cursor-not-allowed"
            >
              Monitoring
            </button>
            {!isLoggedIn && (
              <button
                onClick={handleLogin}
                className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </motion.div>
      )}
    </header>
  )
}