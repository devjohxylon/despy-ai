import React, { memo } from 'react';
import { motion } from 'framer-motion';

const RiskRadarChart = memo(({ data = [] }) => {
  // Default risk categories if no data provided
  const defaultRisks = [
    { name: 'Smart Contract', value: 75 },
    { name: 'Liquidity', value: 45 },
    { name: 'Volume', value: 60 },
    { name: 'Age', value: 30 },
    { name: 'Complexity', value: 80 },
    { name: 'Interactions', value: 55 }
  ];

  const risks = data.length > 0 ? data : defaultRisks;
  const maxValue = Math.max(...risks.map(r => r.value), 100);
  
  // SVG dimensions
  const size = 200;
  const center = size / 2;
  const radius = 80;
  const numPoints = risks.length;
  
  // Calculate polygon points
  const getPolygonPoints = (values, scale = 1) => {
    return values.map((value, index) => {
      const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
      const r = (value / maxValue) * radius * scale;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // Calculate axis points
  const getAxisPoints = (index) => {
    const angle = (index * 2 * Math.PI) / numPoints - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y, angle };
  };

  // Get color based on risk value
  const getRiskColor = (value) => {
    if (value >= 80) return '#ef4444'; // red
    if (value >= 60) return '#f59e0b'; // yellow
    if (value >= 40) return '#f97316'; // orange
    return '#10b981'; // green
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="mx-auto">
          {/* Background circles */}
          {[0.2, 0.4, 0.6, 0.8, 1].map((scale, index) => (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius * scale}
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          ))}
          
          {/* Axis lines */}
          {risks.map((_, index) => {
            const axis = getAxisPoints(index);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={axis.x}
                y2={axis.y}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Risk area */}
          <motion.polygon
            points={getPolygonPoints(risks.map(r => r.value))}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth="2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
          
          {/* Risk points */}
          {risks.map((risk, index) => {
            const axis = getAxisPoints(index);
            const pointRadius = (risk.value / maxValue) * radius;
            const x = center + pointRadius * Math.cos(axis.angle);
            const y = center + pointRadius * Math.sin(axis.angle);
            
            return (
              <motion.circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={getRiskColor(risk.value)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            );
          })}
        </svg>
        
        {/* Risk labels */}
        <div className="absolute inset-0 pointer-events-none">
          {risks.map((risk, index) => {
            const axis = getAxisPoints(index);
            const labelRadius = radius + 25;
            const x = center + labelRadius * Math.cos(axis.angle);
            const y = center + labelRadius * Math.sin(axis.angle);
            
            return (
              <div
                key={index}
                className="absolute text-xs font-medium text-gray-300 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: x,
                  top: y,
                  textAlign: 'center',
                  minWidth: '60px'
                }}
              >
                <div className="mb-1">{risk.name}</div>
                <div 
                  className="text-xs font-bold"
                  style={{ color: getRiskColor(risk.value) }}
                >
                  {risk.value}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-4 w-full">
        {risks.map((risk, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getRiskColor(risk.value) }}
            />
            <span className="text-xs text-gray-400">{risk.name}</span>
            <span className="text-xs font-semibold text-white ml-auto">
              {risk.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

RiskRadarChart.displayName = 'RiskRadarChart';

export default RiskRadarChart;