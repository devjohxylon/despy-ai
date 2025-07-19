import React, { useState, useMemo } from 'react';
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
import { secureTokenStorage } from '../utils/security';
import StripePayment from './StripePayment';
import StripeSubscription from './StripeSubscription';

const TokenSystem = ({ isOpen, onClose, onTokenUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userTokens, setUserTokens] = useState(500);
  const [subscription, setSubscription] = useState(null);
  const [usageHistory, setUsageHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const [showStripeSubscription, setShowStripeSubscription] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = useMemo(() => [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      tokens: 100,
      scans: 1,
      features: ['Basic scanning', 'Email support', 'Standard analysis', '1 scan per month'],
      popular: false,
      stripePriceId: null // Free plan
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.99,
      tokens: 500,
      scans: 5,
      features: ['Advanced scanning', 'Priority support', 'Detailed reports', '5 scans per month', 'API access'],
      popular: true,
      stripePriceId: 'price_1OqX8X2eZvKYlo2C9qX8X2eZ' // Replace with your actual Stripe price ID
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 29.99,
      tokens: 2000,
      scans: 20,
      features: ['Unlimited scanning', '24/7 support', 'Custom reports', '20 scans per month', 'Dedicated account manager'],
      popular: false,
      stripePriceId: 'price_1OqX8X2eZvKYlo2C9qX8X2eZ' // Replace with your actual Stripe price ID
    }
  ], []);

  const tokenPackages = useMemo(() => [
    { tokens: 100, price: 2.99, bonus: 0, popular: false },
    { tokens: 250, price: 6.99, bonus: 25, popular: false },
    { tokens: 500, price: 10.00, bonus: 50, popular: true },
    { tokens: 1000, price: 18.00, bonus: 100, popular: false },
    { tokens: 2500, price: 40.00, bonus: 300, popular: false }
  ], []);

  const usageStats = useMemo(() => [
    { label: 'Total Scans', value: 12, icon: Zap },
    { label: 'Tokens Used', value: 1200, icon: Coins },
    { label: 'Tokens Remaining', value: userTokens, icon: Gift },
    { label: 'Days Active', value: 7, icon: Clock }
  ], [userTokens]);

  const handlePurchaseTokens = async (tokenPackage) => {
    setSelectedPackage(tokenPackage);
    setShowStripePayment(true);
  };

  const handlePaymentSuccess = (totalTokens) => {
    const newTokens = userTokens + totalTokens;
    setUserTokens(newTokens);
    setShowStripePayment(false);
    setSelectedPackage(null);
    
    toast.success(`Successfully purchased ${totalTokens} tokens!`);
    
    // Update parent component
    if (onTokenUpdate) {
      onTokenUpdate(newTokens);
    }
  };

  const handlePaymentCancel = () => {
    setShowStripePayment(false);
    setSelectedPackage(null);
  };

  const handleSubscribe = async (plan) => {
    if (plan.price === 0) {
      // Handle free plan
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubscription(plan);
        const newTokens = userTokens + plan.tokens;
        setUserTokens(newTokens);
        
        toast.success(`Successfully subscribed to ${plan.name}!`);
        
        if (onTokenUpdate) {
          onTokenUpdate(newTokens);
        }
      } catch (error) {
        toast.error('Subscription failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // Handle paid plan with Stripe
      setSelectedPlan(plan);
      setShowStripeSubscription(true);
    }
  };

  const handleSubscriptionSuccess = (plan) => {
    setSubscription(plan);
    const newTokens = userTokens + plan.tokens;
    setUserTokens(newTokens);
    setShowStripeSubscription(false);
    setSelectedPlan(null);
    
    toast.success(`Successfully subscribed to ${plan.name}!`);
    
    if (onTokenUpdate) {
      onTokenUpdate(newTokens);
    }
  };

  const handleSubscriptionCancel = () => {
    setShowStripeSubscription(false);
    setSelectedPlan(null);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="token-modal-title"
      aria-describedby="token-modal-description"
    >
      <div 
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        role="document"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="token-modal-title" className="text-2xl font-bold text-white">
              Token & Subscription Management
            </h2>
            <p id="token-modal-description" className="text-gray-300">
              Manage your tokens and subscription plans
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close token management modal"
          >
            <X className="w-6 h-6 text-gray-300" />
          </button>
        </div>

        {/* Token Balance Display */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-600/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600/20 rounded-xl" aria-hidden="true">
                <Coins className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{userTokens.toLocaleString()}</h3>
                <p className="text-gray-300">Available Tokens</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Cost per scan</p>
              <p className="text-xl font-bold text-white">100 tokens</p>
            </div>
          </div>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className="bg-green-600/10 border border-green-600/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-green-400" />
              <div>
                <h4 className="text-green-400 font-medium">Active Subscription: {subscription.name}</h4>
                <p className="text-gray-300 text-sm">
                  {subscription.tokens.toLocaleString()} tokens included • {subscription.scans} scans per month
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-800/50 rounded-lg p-1" role="tablist" aria-label="Token management tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            role="tab"
            aria-selected={activeTab === 'overview'}
            aria-controls="overview-panel"
          >
            <TrendingUp className="w-4 h-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('purchase')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeTab === 'purchase' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            role="tab"
            aria-selected={activeTab === 'purchase'}
            aria-controls="purchase-panel"
          >
            <CreditCard className="w-4 h-4" />
            Buy Tokens
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeTab === 'subscription' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            role="tab"
            aria-selected={activeTab === 'subscription'}
            aria-controls="subscription-panel"
          >
            <Crown className="w-4 h-4" />
            Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              activeTab === 'usage' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            role="tab"
            aria-selected={activeTab === 'usage'}
            aria-controls="usage-panel"
          >
            <Clock className="w-4 h-4" />
            Usage History
          </button>
        </div>

        {/* Tab Panels */}
        <div role="tabpanel" id={`${activeTab}-panel`} aria-labelledby={`${activeTab}-tab`}>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Usage Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {usageStats.map((stat, index) => (
                  <div key={stat.label} className="bg-gray-800/50 rounded-lg p-4 text-center">
                    <div className="flex justify-center mb-2">
                      <stat.icon className="w-6 h-6 text-blue-400" aria-hidden="true" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</div>
                    <div className="text-sm text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('purchase')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <CreditCard className="w-4 h-4" />
                    Buy More Tokens
                  </button>
                  <button
                    onClick={() => setActiveTab('subscription')}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <Crown className="w-4 h-4" />
                    View Plans
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'purchase' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Purchase Tokens</h3>
                <p className="text-gray-300">Choose a token package that fits your needs</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokenPackages.map((pkg, index) => (
                  <div
                    key={pkg.tokens}
                    className={`relative bg-gray-800/50 rounded-lg p-6 border transition-all duration-200 hover:border-blue-500/50 focus-within:border-blue-500/50 ${
                      pkg.popular ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-gray-700/50'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-white mb-2">
                        {pkg.tokens.toLocaleString()}
                      </div>
                      <div className="text-gray-300">Tokens</div>
                      {pkg.bonus > 0 && (
                        <div className="text-sm text-green-400 mt-1">
                          +{pkg.bonus} Bonus
                        </div>
                      )}
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-white">${pkg.price}</div>
                      <div className="text-sm text-gray-400">
                        ${(pkg.price / (pkg.tokens + pkg.bonus)).toFixed(3)} per token
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchaseTokens(pkg)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Purchase ${pkg.tokens} tokens for $${pkg.price}`}
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Subscription Plans</h3>
                <p className="text-gray-300">Choose a plan that works best for your usage</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-gray-800/50 rounded-lg p-6 border transition-all duration-200 hover:border-blue-500/50 ${
                      plan.popular ? 'border-blue-500/50 ring-2 ring-blue-500/20' : 'border-gray-700/50'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h4 className="text-xl font-semibold text-white mb-2">{plan.name}</h4>
                      <div className="text-3xl font-bold text-white mb-1">
                        ${plan.price}
                        <span className="text-sm text-gray-400 font-normal">/month</span>
                      </div>
                      <div className="text-gray-300">{plan.tokens} tokens included</div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                      aria-label={`Subscribe to ${plan.name} plan for $${plan.price} per month`}
                    >
                      {loading ? 'Processing...' : plan.price === 0 ? 'Get Free Plan' : 'Subscribe'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Usage History</h3>
                <p className="text-gray-300">Track your token usage over time</p>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-6">
                <div className="space-y-4">
                  {usageHistory.length > 0 ? (
                    usageHistory.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Zap className="w-4 h-4 text-blue-400" aria-hidden="true" />
                          </div>
                          <div>
                            <div className="text-white font-medium">{entry.action}</div>
                            <div className="text-sm text-gray-400">{entry.timestamp}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">-{entry.tokens} tokens</div>
                          <div className="text-sm text-gray-400">Remaining: {entry.remaining}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" aria-hidden="true" />
                      <p className="text-gray-400">No usage history yet</p>
                      <p className="text-sm text-gray-500">Your token usage will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stripe Payment Modal */}
        {showStripePayment && selectedPackage && (
          <StripePayment
            package={selectedPackage}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        )}

        {/* Stripe Subscription Modal */}
        {showStripeSubscription && selectedPlan && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Subscribe to {selectedPlan.name}</h3>
                <button
                  onClick={handleSubscriptionCancel}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <StripeSubscription
                plan={selectedPlan}
                onSuccess={handleSubscriptionSuccess}
                onCancel={handleSubscriptionCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TokenSystem; 