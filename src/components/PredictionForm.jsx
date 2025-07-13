import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

export default function PredictionForm({ onSubmit, loading }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input) onSubmit(input)
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <motion.input
        whileFocus={{ scale: 1.02 }}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter wallet address or token..."
        className="flex-1 bg-primary border border-secondary rounded-lg p-2 focus:outline-none focus:border-accent"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={loading}
        className="bg-accent text-primary px-4 py-2 rounded-lg flex items-center space-x-1"
      >
        <Search size={16} />
        <span>Analyze</span>
      </motion.button>
    </form>
  )
}