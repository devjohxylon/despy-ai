import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Coins, 
  Zap, 
  Crown, 
  Star, 
  Check, 
  X, 
  CreditCard, 
  Gift,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import getApiUrl, { getApiUrlWithCacheBust } from '../utils/api';
import StripePayment from './StripePayment';

const TokenSystem = ({ isOpen, onClose, onTokenUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userTokens, setUserTokens] = useState(500);
  const [subscription, setSubscription] = useState(null);
  const [usageHistory, setUsageHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      tokens: 100,
      scans: 1,
      features: ['Basic scanning', 'Email support', 'Standard analysis', '1 scan per month'],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      tokens: 500,
      scans: 5,
      features: ['Advanced scanning', 'Priority support', 'Detailed reports', '5 scans per month', 'API access'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 29.99,
      tokens: 2000,
      scans: 20,
      features: ['Unlimited scanning', '24/7 support', 'Custom reports', '20 scans per month', 'Dedicated account manager'],
      popular: false
    }
  ];

  const tokenPackages = [
    { tokens: 100, price: 2.99, bonus: 0, popular: false },
    { tokens: 250, price: 6.99, bonus: 25, popular: false },
    { tokens: 500, price: 10.00, bonus: 50, popular: true },
    { tokens: 1000, price: 18.00, bonus: 100, popular: false },
    { tokens: 2500, price: 40.00, bonus: 300, popular: false }
  ];

  const usageStats = [
    { label: 'Total Scans', value: 12, icon: Zap },
    { label: 'Tokens Used', value: 1200, icon: Coins },
    { label: 'Tokens Remaining', value: userTokens, icon: Gift },
    { label: 'Days Active', value: 7, icon: Clock }
  ];

  const handlePurchaseTokens = async (tokenPackage) => {
    setLoading(true);
    try {
      const totalTokens = tokenPackage.tokens + tokenPackage.bonus;
      const amount = tokenPackage.price;
      
      // Call backend to create payment intent
      const response = await fetch(getApiUrlWithCacheBust('payment/create-intent'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          description: `Purchase ${totalTokens} tokens`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();
      
      // For now, simulate successful payment
      // In production, this would integrate with Stripe Elements
      const newTokens = userTokens + totalTokens;
      setUserTokens(newTokens);
      
      toast.success(`Successfully purchased ${totalTokens} tokens!`);
      
      // Update parent component
      if (onTokenUpdate) {
        onTokenUpdate(newTokens);
      }
    } catch (error) {
      toast.error('Purchase failed. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    setLoading(true);
    try {
      // Simulate subscription processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubscription(plan);
      const newTokens = userTokens + plan.tokens;
      setUserTokens(newTokens);
      
      toast.success(`Successfully subscribed to ${plan.name}!`);
      
      // Update parent component
      if (onTokenUpdate) {
        onTokenUpdate(newTokens);
      }
    } catch (error) {
      toast.error('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Token & Subscription Management</h2>
            <p className="text-gray-400">Manage your tokens and subscription plans</p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Token Balance Display */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-600/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/20 rounded-xl">
                <Coins className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{userTokens.toLocaleString()}</h3>
                <p className="text-gray-400">Available Tokens</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Cost per scan</p>
              <p className="text-xl font-bold text-white">100 tokens</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('purchase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'purchase' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Buy Tokens
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'subscription' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Crown className="w-4 h-4" />
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === 'usage' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            Usage History
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {usageStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <stat.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                      <p className="text-xl font-bold text-white">{stat.value.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Current Subscription</h3>
                {subscription ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <div>
                        <p className="font-medium text-white">{subscription.name} Plan</p>
                        <p className="text-sm text-gray-400">${subscription.price}/month</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {subscription.tokens} tokens included monthly
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">No active subscription</p>
                    <button
                      onClick={() => setActiveTab('subscription')}
                      className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      View Plans
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab('purchase')}
                    className="w-full flex items-center justify-between p-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 rounded-lg transition-colors"
                  >
                    <span className="text-white">Buy More Tokens</span>
                    <Coins className="w-5 h-5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => setActiveTab('subscription')}
                    className="w-full flex items-center justify-between p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 rounded-lg transition-colors"
                  >
                    <span className="text-white">Upgrade Subscription</span>
                    <Crown className="w-5 h-5 text-purple-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Tokens Tab */}
        {activeTab === 'purchase' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Purchase Additional Tokens</h3>
              <p className="text-gray-400 mb-6">Buy tokens to continue scanning contracts and analyzing security</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tokenPackages.map((pkg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-800/50 border rounded-xl p-6 transition-colors ${
                    pkg.popular 
                      ? 'border-purple-600/50 bg-purple-600/10' 
                      : 'border-gray-700 hover:border-blue-600/50'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Coins className="w-6 h-6 text-blue-400" />
                      <span className="text-2xl font-bold text-white">{pkg.tokens}</span>
                    </div>
                    
                    {pkg.bonus > 0 && (
                      <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-2">
                        <p className="text-sm text-green-400">+{pkg.bonus} Bonus</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-3xl font-bold text-white">${pkg.price}</p>
                      <p className="text-sm text-gray-400">One-time payment</p>
                      <p className="text-xs text-gray-500 mt-1">
                        ${(pkg.price / (pkg.tokens + pkg.bonus)).toFixed(3)} per token
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handlePurchaseTokens(pkg)}
                      disabled={loading}
                      className={`w-full px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                        pkg.popular
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {loading ? 'Processing...' : 'Purchase'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">💡 Token Pricing</h4>
              <p className="text-gray-400 text-sm">
                Our token pricing is designed to be fair and accessible. Each scan costs 100 tokens, 
                and we offer bonus tokens on larger packages to give you better value.
              </p>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Choose Your Plan</h3>
              <p className="text-gray-400 mb-6">Get more tokens and features with our subscription plans</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-gray-800/50 border rounded-xl p-6 ${
                    plan.popular 
                      ? 'border-purple-600/50 bg-purple-600/10' 
                      : 'border-gray-700 hover:border-blue-600/50'
                  } transition-colors`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      {plan.popular ? (
                        <Crown className="w-6 h-6 text-purple-400" />
                      ) : (
                        <Star className="w-6 h-6 text-blue-400" />
                      )}
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>
                    
                    <div>
                      <p className="text-4xl font-bold text-white">${plan.price}</p>
                      <p className="text-sm text-gray-400">per month</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-blue-400" />
                        <span className="text-white">{plan.tokens} tokens/month</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-white">{plan.scans} scans included</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-left">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loading}
                      className={`w-full px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                        plan.popular
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {loading ? 'Processing...' : plan.price === 0 ? 'Get Started' : 'Subscribe'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Usage History Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Usage History</h3>
              <p className="text-gray-400 mb-6">Track your token usage and scanning activity</p>
            </div>

            <div className="bg-gray-800/50 rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  {usageHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-400">No usage history yet</p>
                      <p className="text-sm text-gray-500">Start scanning contracts to see your activity</p>
                    </div>
                  ) : (
                    usageHistory.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">{item.action}</p>
                            <p className="text-sm text-gray-400">{item.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">-{item.tokens} tokens</p>
                          <p className="text-sm text-gray-400">{item.contract}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default TokenSystem; 