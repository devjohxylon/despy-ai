import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

export default function RiskRadarChart({ data }) {
  // Transform data into the format Recharts expects
  const chartData = [
    { name: 'Liquidity Risk', value: data?.liquidity || 0 },
    { name: 'Volatility', value: data?.volatility || 0 },
    { name: 'Concentration', value: data?.concentration || 0 },
    { name: 'Manipulation', value: data?.manipulation || 0 },
    { name: 'Smart Contract', value: data?.smartContract || 0 }
  ]

  return (
    <div className="glass-panel p-6">
      <h2 className="text-gray-400 text-xl font-light mb-4">Risk Analysis</h2>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
            <PolarAngleAxis 
              dataKey="name" 
              tick={{ fill: 'rgb(148, 163, 184)', fontSize: 12 }}
              stroke="rgba(148, 163, 184, 0.2)"
            />
            <Radar
              name="Risk Level"
              dataKey="value"
              stroke="rgba(56, 189, 248, 0.8)"
              fill="rgba(56, 189, 248, 0.4)"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '8px',
                padding: '12px'
              }}
              itemStyle={{ color: 'rgb(226, 232, 240)' }}
              labelStyle={{ color: 'rgb(148, 163, 184)' }}
              formatter={(value) => [`${value.toFixed(1)}%`, 'Risk Level']}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Risk Level Legend */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400"></div>
              <span className="text-gray-400">{item.name}:</span>
              <span className="text-sky-400 font-medium">{item.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}