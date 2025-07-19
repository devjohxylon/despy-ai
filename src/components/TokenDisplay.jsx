import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Zap, TrendingUp, Gift, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import TokenSystem from './TokenSystem';
import getApiUrl, { getApiUrlWithCacheBust } from '../utils/api';
import { secureTokenStorage } from '../utils/security';

const TokenDisplay = ({ onTokenUpdate }) => {
  const [tokens, setTokens] = useState(500);
  const [subscription, setSubscription] = useState('starter');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTokenInfo();
  }, []);

  const fetchTokenInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrlWithCacheBust('user/tokens'), {
        headers: {
          'Authorization': `Bearer ${secureTokenStorage.getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens);
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch token info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenUpdate = (newTokens) => {
    setTokens(newTokens);
    if (onTokenUpdate) {
      onTokenUpdate(newTokens);
    }
  };

  const getSubscriptionIcon = () => {
    switch (subscription) {
      case 'pro':
        return <Crown className="w-4 h-4 text-purple-400" />;
      case 'enterprise':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      default:
        return <Zap className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSubscriptionColor = () => {
    switch (subscription) {
      case 'pro':
        return 'text-purple-400';
      case 'enterprise':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        {/* Token Balance */}
        <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
          <Coins className="w-5 h-5 text-blue-400" />
          <span className="text-white font-medium">{tokens.toLocaleString()}</span>
          <span className="text-gray-400 text-sm">tokens</span>
        </div>

        {/* Subscription Badge */}
        <div className="flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2">
          {getSubscriptionIcon()}
          <span className={`text-sm font-medium capitalize ${getSubscriptionColor()}`}>
            {subscription}
          </span>
        </div>

        {/* Manage Tokens Button */}
        <button
          onClick={() => setShowTokenModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Gift className="w-4 h-4" />
          <span className="text-sm font-medium">Buy Tokens</span>
        </button>
      </motion.div>

      {/* Token System Modal */}
      <TokenSystem
        isOpen={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onTokenUpdate={handleTokenUpdate}
      />
    </>
  );
};

export default TokenDisplay; 