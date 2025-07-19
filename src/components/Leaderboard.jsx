import React, { memo, useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users, FileText } from 'lucide-react';

const Leaderboard = memo(() => {
  const [activeTab, setActiveTab] = useState('wallets');
  const [activeChain, setActiveChain] = useState('eth');

  // Mock data - replace with real data from your backend
  const leaderboardData = {
    wallets: {
      eth: [
        { rank: 1, address: '0x1234...5678', scans: 1247, icon: Trophy, color: 'text-yellow-400' },
        { rank: 2, address: '0x8765...4321', scans: 1156, icon: Medal, color: 'text-gray-400' },
        { rank: 3, address: '0xabcd...efgh', scans: 1043, icon: Award, color: 'text-amber-600' },
        { rank: 4, address: '0xfedc...ba98', scans: 987, icon: null, color: 'text-gray-500' },
        { rank: 5, address: '0x9999...8888', scans: 876, icon: null, color: 'text-gray-500' }
      ],
      sol: [
        { rank: 1, address: 'ABC123...XYZ789', scans: 892, icon: Trophy, color: 'text-yellow-400' },
        { rank: 2, address: 'DEF456...UVW012', scans: 756, icon: Medal, color: 'text-gray-400' },
        { rank: 3, address: 'GHI789...RST345', scans: 654, icon: Award, color: 'text-amber-600' },
        { rank: 4, address: 'JKL012...OPQ678', scans: 543, icon: null, color: 'text-gray-500' },
        { rank: 5, address: 'MNO345...PQR901', scans: 432, icon: null, color: 'text-gray-500' }
      ]
    },
    contracts: {
      eth: [
        { rank: 1, address: '0xcontract1...', scans: 2156, icon: Trophy, color: 'text-yellow-400' },
        { rank: 2, address: '0xcontract2...', scans: 1987, icon: Medal, color: 'text-gray-400' },
        { rank: 3, address: '0xcontract3...', scans: 1876, icon: Award, color: 'text-amber-600' },
        { rank: 4, address: '0xcontract4...', scans: 1654, icon: null, color: 'text-gray-500' },
        { rank: 5, address: '0xcontract5...', scans: 1432, icon: null, color: 'text-gray-500' }
      ],
      sol: [
        { rank: 1, address: 'ContractABC...', scans: 1654, icon: Trophy, color: 'text-yellow-400' },
        { rank: 2, address: 'ContractDEF...', scans: 1432, icon: Medal, color: 'text-gray-400' },
        { rank: 3, address: 'ContractGHI...', scans: 1298, icon: Award, color: 'text-amber-600' },
        { rank: 4, address: 'ContractJKL...', scans: 1156, icon: null, color: 'text-gray-500' },
        { rank: 5, address: 'ContractMNO...', scans: 987, icon: null, color: 'text-gray-500' }
      ]
    }
  };

  const currentData = leaderboardData[activeTab][activeChain];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('wallets')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'wallets'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1" />
          Wallets
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'contracts'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1" />
          Contracts
        </button>
      </div>

      {/* Chain Selection */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setActiveChain('eth')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeChain === 'eth'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Ethereum
        </button>
        <button
          onClick={() => setActiveChain('sol')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeChain === 'sol'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Solana
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {currentData.map((item) => (
          <div
            key={item.rank}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8">
                {item.icon ? (
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                ) : (
                  <span className={`text-sm font-bold ${item.color}`}>
                    {item.rank}
                  </span>
                )}
              </div>
              <div>
                <div className="text-white font-medium text-sm">
                  {item.address}
                </div>
                <div className="text-gray-400 text-xs">
                  {activeChain.toUpperCase()} {activeTab.slice(0, -1)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-white font-semibold text-sm">
                {item.scans.toLocaleString()}
              </span>
              <span className="text-gray-400 text-xs">scans</span>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <button className="w-full mt-4 py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors">
        View Full Leaderboard
      </button>
    </div>
  );
});

Leaderboard.displayName = 'Leaderboard';

export default Leaderboard; 