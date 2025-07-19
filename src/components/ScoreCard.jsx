import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Info, Shield, AlertTriangle, CheckCircle } from 'lucide-react'

const getRiskLevel = (score) => {
  if (score >= 75) return { level: 'Critical Risk', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertTriangle }
  if (score >= 50) return { level: 'High Risk', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertTriangle }
  if (score >= 25) return { level: 'Medium Risk', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Shield }
  return { level: 'Low Risk', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle }
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
  const { level, color, bg, border, icon: Icon } = useMemo(() => getRiskLevel(score), [score])
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
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 ${bg} ${border}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Risk Score</h3>
        <Icon className="w-5 h-5 text-gray-400" />
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
    </div>
  )
}