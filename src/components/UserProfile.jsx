// src/components/UserProfile.jsx
import { useUser } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Shield } from 'lucide-react'

export default function UserProfile() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-20 bg-gray-700/50 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900/60 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6"
    >
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <img
            src={user.profileImageUrl}
            alt={user.fullName || 'User'}
            className="w-16 h-16 rounded-full border-2 border-blue-500/30"
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">
            {user.fullName || user.firstName || 'Anonymous User'}
          </h2>
          <p className="text-gray-400">Premium Beta User</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-gray-300">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-sm">{user.primaryEmailAddress?.emailAddress}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-300">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm">Joined {formatDate(user.createdAt)}</span>
          </div>
          
          <div className="flex items-center space-x-3 text-gray-300">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm">Account Verified</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <h3 className="text-sm font-medium text-blue-400 mb-1">API Usage</h3>
            <p className="text-xs text-gray-400">1,247 / 10,000 calls this month</p>
            <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
              <div className="bg-blue-500 h-1 rounded-full w-1/8"></div>
            </div>
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <h3 className="text-sm font-medium text-purple-400 mb-1">Beta Status</h3>
            <p className="text-xs text-gray-400">Early Access • All Features</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 