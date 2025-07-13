import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ScoreCard({ score }) {
  const [count, setCount] = useState(0)
  const color = score > 70 ? 'danger' : score > 40 ? 'warning' : 'success'
  const icon = score > 70 ? '🔴' : score > 40 ? '🟠' : '🟢'

  useEffect(() => {
    const timer = setInterval(() => {
      if (count < score) setCount(count + 1)
    }, 20)
    return () => clearInterval(timer)
  }, [count, score])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-primary rounded-lg p-4 shadow-lg"
    >
      <div className="text-text-secondary mb-2">Risk Score</div>
      <div className={`text-5xl font-bold text-${color}`}>
        {icon} {count}
      </div>
      <div className="text-text-secondary mt-2">Out of 100</div>
    </motion.div>
  )
}