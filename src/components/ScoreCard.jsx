import { useEffect, useState, useCallback, useMemo } from 'react'
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
  const { level, color, bg } = useMemo(() => getRiskLevel(score), [score])
  const description = useMemo(() => getRiskDescription(score), [score])

  const animateScore = useCallback(() => {
    const duration = 1500 // Animation duration in ms
    const steps = 60 // Number of steps
    const increment = score / steps
    let currentStep = 0
    let timer = null

    const animate = () => {
      if (currentStep < steps) {
        setCount(prev => Math.min(score, prev + increment))
        currentStep++
        timer = setTimeout(animate, duration / steps)
      } else {
        setCount(score)
      }
    }

    animate()

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [score])

  useEffect(() => {
    const cleanup = animateScore()
    return cleanup
  }, [animateScore])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-panel p-6 ${bg}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Risk Score</h3>
        <Info className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="text-center mb-4">
        <div className="text-4xl font-bold text-white mb-2">
          {Math.round(count)}
        </div>
        <div className={`text-sm font-medium ${color}`}>
          {level}
        </div>
      </div>
      
      <p className="text-gray-300 text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  )
}