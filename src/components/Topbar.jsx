// src/components/Topbar.jsx
import { User, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import PredictionForm from './PredictionForm'
import { useData } from '../context/DataContext'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react'
import { useState } from 'react'
import AlertsFeed from './AlertsFeed'

export default function Topbar({ onSubmit }) {
  const date = new Date().toLocaleString()
  const { loading, data } = useData()
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-primary border-b border-secondary p-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div className="text-lg font-semibold">Threat Intel Dashboard</div>
      <PredictionForm loading={loading} onSubmit={onSubmit} />
      <div className="flex items-center space-x-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-text-secondary"
        >
          Live: {date}
        </motion.div>
        <div className="relative">
          <Bell size={20} className="cursor-pointer" onClick={() => setShowNotifications(!showNotifications)} />
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 bg-secondary rounded-lg p-4 shadow-lg w-80 z-10"
            >
              <AlertsFeed alerts={data?.alerts || []} />
            </motion.div>
          )}
        </div>
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <User size={20} className="cursor-pointer" />
          </SignInButton>
        </SignedOut>
      </div>
    </header>
  )
}