import { memo } from 'react'
import { motion } from 'framer-motion'

const RiskRadarChart = memo(({ data = [] }) => {
  // Default risk categories for ETH and SOL
  const riskCategories = [
    'Liquidity Risk',
    'Concentration',
    'Smart Contract',
    'Volatility',
    'Manipulation',
    'Regulatory'
  ]

  // Use provided data or default to zeros
  const riskValues = data.length > 0 ? data : riskCategories.map(() => 0)

  const maxValue = Math.max(...riskValues, 1) // Prevent division by zero
  const radius = 60
  const centerX = 120
  const centerY = 120

  // Generate polygon points
  const generatePolygonPoints = (values, radius, centerX, centerY) => {
    return values.map((value, index) => {
      const angle = (index * 2 * Math.PI) / values.length - Math.PI / 2
      const r = (value / maxValue) * radius
      const x = centerX + r * Math.cos(angle)
      const y = centerY + r * Math.sin(angle)
      return `${x},${y}`
    }).join(' ')
  }

  const polygonPoints = generatePolygonPoints(riskValues, radius, centerX, centerY)

  return (
    <div className="flex flex-col items-center">
      {/* Radar Chart */}
      <div className="relative mb-6">
        <svg width="240" height="240" className="transform -rotate-90">
          {/* Background grid */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, index) => (
            <g key={index}>
              {/* Circular grid lines */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius * level}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
              
              {/* Radial grid lines */}
              {riskCategories.map((_, categoryIndex) => {
                const angle = (categoryIndex * 2 * Math.PI) / riskCategories.length
                const x = centerX + radius * Math.cos(angle)
                const y = centerY + radius * Math.sin(angle)
                return (
                  <line
                    key={categoryIndex}
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="1"
                  />
                )
              })}
            </g>
          ))}

          {/* Risk area polygon */}
          <motion.polygon
            points={polygonPoints}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Center point */}
          <circle
            cx={centerX}
            cy={centerY}
            r="3"
            fill="rgba(59, 130, 246, 1)"
          />
        </svg>
      </div>

      {/* Risk Categories Legend */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {riskCategories.map((category, index) => (
          <div key={category} className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{category}</span>
            <span className="text-white font-medium">
              {riskValues[index] ? `${riskValues[index].toFixed(1)}%` : '0.0%'}
            </span>
          </div>
        ))}
      </div>

      {/* Summary */}
      {riskValues.some(v => v > 0) ? (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-blue-400 text-sm text-center">
            {riskValues.filter(v => v > 50).length > 0 
              ? `${riskValues.filter(v => v > 50).length} high-risk factors detected`
              : 'All risk factors within normal range'
            }
          </p>
        </div>
      ) : (
        <div className="mt-4 p-3 bg-gray-500/10 border border-gray-500/20 rounded-lg">
          <p className="text-gray-400 text-sm text-center">
            No risk data available
          </p>
        </div>
      )}
    </div>
  )
})

RiskRadarChart.displayName = 'RiskRadarChart'

export default RiskRadarChart