import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Zap, TrendingUp, Gift, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import TokenSystem from './TokenSystem';
import getApiUrl, { getApiUrlWithCacheBust } from '../utils/api';
import { secureTokenStorage } from '../utils/security';

const TokenDisplay = ({ tokens: propTokens, onPurchase, onTokenUpdate }) => {
  const [tokens, setTokens] = useState(propTokens || 500);
  const [subscription, setSubscription] = useState('starter');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propTokens !== undefined) {
      setTokens(propTokens);
    } else {
      fetchTokenInfo();
    }
  }, [propTokens]);

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

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase();
    } else {
      setShowTokenModal(true);
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
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Coins className="w-5 h-5 mr-2 text-blue-400" />
          Token Balance
        </h3>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Token Balance */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Coins className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Available Tokens</p>
                  <p className="text-2xl font-bold text-white">{tokens.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm font-medium">+50 daily</p>
                <p className="text-gray-400 text-xs">Free tier</p>
              </div>
            </div>
          </div>

          {/* Subscription Badge */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  {getSubscriptionIcon()}
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Subscription</p>
                  <p className={`text-lg font-semibold capitalize ${getSubscriptionColor()}`}>
                    {subscription}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Plan</p>
                <p className="text-gray-300 text-sm font-medium">
                  {subscription === 'pro' ? 'Pro Features' : 
                   subscription === 'enterprise' ? 'Enterprise' : 'Starter'}
                </p>
              </div>
            </div>
          </div>

          {/* Manage Tokens Button */}
          <button
            onClick={handlePurchase}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 font-medium"
          >
            <Gift className="w-5 h-5" />
            <span>Buy More Tokens</span>
          </button>
        </motion.div>
      </div>

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