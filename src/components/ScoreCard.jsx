import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

const getRiskLevel = (score) => {
  if (score >= 75) return { level: 'Critical Risk', color: 'text-red-400', bg: 'bg-red-950/30' }
  if (score >= 50) return { level: 'High Risk', color: 'text-amber-400', bg: 'bg-amber-950/30' }
  if (score >= 25) return { level: 'Medium Risk', color: 'text-yellow-400', bg: 'bg-yellow-950/30' }
  return { level: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-950/30' }
}

const getRiskDescription = (score) => {
  if (score >= 75) {
    return "Immediate attention required. High probability of malicious activity or severe vulnerabilities."
  }
  if (score >= 50) {
    return "Significant risks detected. Careful investigation recommended before proceeding."
  }
  if (score >= 25) {
    return "Moderate risk level. Some concerns identified but no critical issues."
  }
  return "Low risk profile. Basic security measures in place with minimal concerns."
}

export default function ScoreCard({ score }) {
  const [count, setCount] = useState(0)
  const { level, color, bg } = getRiskLevel(score)
  const description = getRiskDescription(score)

  useEffect(() => {
    const duration = 1500 // Animation duration in ms
    const steps = 60 // Number of steps
    const increment = score / steps
    let currentStep = 0

    const timer = setInterval(() => {
      if (currentStep < steps) {
        setCount(prev => Math.min(score, prev + increment))
        currentStep++
      } else {
        setCount(score)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-gray-400 text-xl font-light">Risk Analysis Score</h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-gray-400 hover:text-sky-400 transition-colors"
          title="About Risk Score"
        >
          <Info size={18} />
        </motion.button>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`w-36 h-36 rounded-full ${bg} flex items-center justify-center`}
          >
            <div className={`text-5xl font-bold ${color}`}>
              {Math.round(count)}
            </div>
          </motion.div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-400 whitespace-nowrap">
            out of 100
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xl font-medium ${color} text-center mb-4`}
        >
          {level}
        </motion.div>
      </div>

      <div className="space-y-6">
        <div className="text-gray-400 text-sm leading-relaxed bg-gray-900/30 rounded-lg p-4">
          {description}
        </div>

        <div className="space-y-3">
          <h3 className="text-gray-400 font-medium">Risk Breakdown:</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              <span className="text-gray-400">75-100: Critical</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-gray-400">50-74: High</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              <span className="text-gray-400">25-49: Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-gray-400">0-24: Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}