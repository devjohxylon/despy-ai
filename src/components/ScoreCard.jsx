import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const ScoreCard = memo(({ score = 0 }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-green-400';
  };

  const getScoreLevel = (score) => {
    if (score >= 80) return 'High Risk';
    if (score >= 60) return 'Medium Risk';
    if (score >= 40) return 'Low Risk';
    return 'Safe';
  };

  const getScoreIcon = (score) => {
    if (score >= 60) return <AlertTriangle className="w-6 h-6" />;
    if (score >= 40) return <Clock className="w-6 h-6" />;
    return <CheckCircle className="w-6 h-6" />;
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-red-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    if (score >= 40) return 'bg-orange-500/20';
    return 'bg-green-500/20';
  };

  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
        Risk Score
      </h3>
      
      <div className="relative mb-6">
        <div className="w-32 h-32 mx-auto relative">
          {/* Background circle */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={getScoreColor(score)}
              initial={{ strokeDasharray: 0, strokeDashoffset: 0 }}
              animate={{ 
                strokeDasharray: `${2 * Math.PI * 54}`,
                strokeDashoffset: `${2 * Math.PI * 54 * (1 - score / 100)}`
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}
              </div>
              <div className="text-sm text-gray-400">/ 100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score details */}
      <div className="space-y-4">
        <div className={`${getScoreBg(score)} rounded-lg p-4 border border-white/10`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {getScoreIcon(score)}
            <span className={`font-semibold ${getScoreColor(score)}`}>
              {getScoreLevel(score)}
            </span>
          </div>
          <p className="text-gray-300 text-sm">
            {score >= 80 ? 'High risk detected. Immediate attention required.' :
             score >= 60 ? 'Moderate risk factors present. Monitor closely.' :
             score >= 40 ? 'Low risk profile. Standard monitoring recommended.' :
             'Safe profile. Normal activity detected.'}
          </p>
        </div>

        {/* Risk indicators */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Suspicious Activity</div>
            <div className="text-lg font-semibold text-white">
              {score >= 60 ? 'High' : score >= 40 ? 'Medium' : 'Low'}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <div className="text-xs text-gray-400 mb-1">Transaction Volume</div>
            <div className="text-lg font-semibold text-white">
              {score >= 80 ? 'Very High' : score >= 60 ? 'High' : 'Normal'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ScoreCard.displayName = 'ScoreCard';

export default ScoreCard;