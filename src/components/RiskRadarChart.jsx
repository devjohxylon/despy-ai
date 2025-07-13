import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

export default function RiskRadarChart({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -10 }}
      animate={{ opacity: 1, rotate: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-primary rounded-lg p-4 shadow-lg"
    >
      <div className="text-text-secondary mb-2">Risk Radar</div>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="name" stroke="#9CA3AF" />
          <Radar name="Risk" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}