import { motion } from 'framer-motion'

export default function SettingsPage() {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-primary rounded-lg p-6 shadow-lg h-full text-text-secondary"
    >
      <h2 className="text-xl mb-4">Settings</h2>
      <p>This page is under development. Check back later for customization options!</p>
    </motion.div>
  )
}