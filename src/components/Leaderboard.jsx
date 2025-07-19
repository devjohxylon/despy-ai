import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Users, Zap } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([
    {
      id: 1,
      username: 'CryptoWhale',
      scans: 247,
      chain: 'ETH',
      type: 'Wallets',
      avatar: '🐋',
      rank: 1,
      score: 98.5
    },
    {
      id: 2,
      username: 'SmartContractor',
      scans: 189,
      chain: 'SOL',
      type: 'Contracts',
      avatar: '⚡',
      rank: 2,
      score: 96.2
    },
    {
      id: 3,
      username: 'DeFiDetective',
      scans: 156,
      chain: 'ETH',
      type: 'Wallets',
      avatar: '🔍',
      rank: 3,
      score: 94.8
    },
    {
      id: 4,
      username: 'BlockchainBuddy',
      scans: 134,
      chain: 'SOL',
      type: 'Contracts',
      avatar: '🤖',
      rank: 4,
      score: 92.1
    },
    {
      id: 5,
      username: 'TokenTracker',
      scans: 98,
      chain: 'ETH',
      type: 'Wallets',
      avatar: '🎯',
      rank: 5,
      score: 89.7
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('all');

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getChainColor = (chain) => {
    return chain === 'ETH' ? 'text-blue-400' : 'text-purple-400';
  };

  const getTypeColor = (type) => {
    return type === 'Wallets' ? 'text-green-400' : 'text-orange-400';
  };

  const filteredData = leaderboardData.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'eth') return item.chain === 'ETH';
    if (activeFilter === 'sol') return item.chain === 'SOL';
    if (activeFilter === 'wallets') return item.type === 'Wallets';
    if (activeFilter === 'contracts') return item.type === 'Contracts';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('eth')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeFilter === 'eth'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          ETH
        </button>
        <button
          onClick={() => setActiveFilter('sol')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeFilter === 'sol'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          SOL
        </button>
        <button
          onClick={() => setActiveFilter('wallets')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeFilter === 'wallets'
              ? 'bg-green-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Wallets
        </button>
        <button
          onClick={() => setActiveFilter('contracts')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            activeFilter === 'contracts'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Contracts
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {filteredData.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8">
                {getRankIcon(user.rank)}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-2xl">{user.avatar}</span>
                <div>
                  <div className="text-white font-medium text-sm">{user.username}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={getChainColor(user.chain)}>{user.chain}</span>
                    <span className="text-gray-500">•</span>
                    <span className={getTypeColor(user.type)}>{user.type}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-white font-bold text-sm">{user.scans}</div>
              <div className="text-gray-400 text-xs">scans</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Summary */}
      <div className="pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">824</div>
            <div className="text-gray-400 text-xs">Total Scans</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">156</div>
            <div className="text-gray-400 text-xs">Active Users</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 