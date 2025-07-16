import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import analytics from '../utils/analytics';

const SimpleLandingPage = () => {
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [waitlistCount, setWaitlistCount] = useState(0);

  // Fetch waitlist count
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/waitlist/stats');
        if (response.ok) {
          const data = await response.json();
          setWaitlistCount(data.total || 0);
        }
      } catch (error) {
        console.log('Could not fetch waitlist count:', error);
        // Set a placeholder count if API is not available
        setWaitlistCount(127); // Placeholder number
      }
    };

    fetchWaitlistCount();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/api/waitlist/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setEmail('');
      setMessage('🎉 Success! You\'re now on the DeSpy AI waitlist. We\'ll notify you when we launch!');
      
      // Update count locally
      setWaitlistCount(prev => prev + 1);
      
      // Track successful signup
      analytics.trackEvent('waitlist_signup', { email, status: 'success' });
    } catch (error) {
      setMessage(`❌ ${error.message}`);
      // Track failed signup
      analytics.trackEvent('waitlist_signup', { email, status: 'error', error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = (buttonName) => {
    analytics.trackEvent('button_click', { button: buttonName });
  };

  const handleSocialClick = (platform, url) => {
    handleButtonClick(platform);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-white">
              DeSpy AI
            </div>
            <div className="flex items-center space-x-4">
              {isSignedIn && (
                <Link 
                  to="/dashboard"
                  className="px-4 py-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              The Future of
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"> Decentralized </span>
              Intelligence
            </h1>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Revolutionary smart contract auditing, MEV bot detection, and DeFi security tools powered by advanced AI algorithms. Smart contracts, smarter shaping the future of blockchain security.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/dashboard"
                onClick={() => handleButtonClick('demo')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Try Demo
              </Link>
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-400 mb-2">
                  {waitlistCount.toLocaleString()} developers waiting
                </div>
                <span className="text-gray-500">•</span>
              </div>
            </div>
          </div>
        </div>

        {/* Waitlist Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto glass-panel p-8">

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Join the Waitlist</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                onClick={() => handleButtonClick('join-waitlist')}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                {loading ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
            
            {message && (
              <div className={`mt-4 p-3 rounded-lg ${
                message.includes('Success') 
                  ? 'bg-green-500/20 border border-green-400/30 text-green-300' 
                  : 'bg-red-500/20 border border-red-400/30 text-red-300'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Beta Timeline */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Beta Launch Timeline</h3>
            <p className="text-gray-300">We're targeting Q2 2025 for our beta launch. Waitlist members get first access and exclusive early-bird pricing.</p>
          </div>

          {/* Pricing Preview */}
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">Early Bird Pricing</h3>
            <p className="text-gray-300">Waitlist members will get up to 50% off our standard pricing. Plans start from $99/month for individual users, with enterprise solutions available.</p>
          </div>

          {/* Key Features Preview */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Enterprise Security</h4>
              <p className="text-gray-300">Built on blockchain technology for maximum security and transparency in every transaction and analysis.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Real-time Insights</h4>
              <p className="text-gray-300">Live monitoring and analysis of blockchain transactions with instant alerts for suspicious activities.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">AI-Powered Analytics</h4>
              <p className="text-gray-300">Advanced machine learning algorithms detect patterns and anomalies in smart contract behavior.</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <p className="text-xl text-gray-300 mb-6">Join our waitlist and be among the first to experience the future of decentralized intelligence.</p>
          </div>
        </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-2xl font-bold text-white mb-4">DeSpy AI</div>
            <p className="text-gray-400 mb-8">Revolutionizing blockchain security through advanced AI analytics</p>
            
            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Smart Contract Auditing</h4>
                <p className="text-gray-400">Automated vulnerability detection and security analysis for smart contracts across multiple blockchains.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">MEV Bot Detection</h4>
                <p className="text-gray-400">Advanced algorithms to identify and analyze Maximum Extractable Value bots and their strategies.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">DeFi Security Tools</h4>
                <p className="text-gray-400">Comprehensive suite of tools for analyzing DeFi protocols and detecting potential risks.</p>
              </div>
            </div>

          {/* Social Media Links */}
          <div className="mt-16 text-center">
            <p className="text-gray-400 mb-4">Follow our journey</p>
            <div className="flex justify-center space-x-8 text-gray-500">
              <button 
                onClick={() => handleSocialClick('twitter', 'https://x.com/DeSpyAI')}
                className="hover:text-blue-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button 
                onClick={() => handleSocialClick('github', 'https://github.com/devjohxylon/despy-ai')}
                className="hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
              <button 
                onClick={() => handleSocialClick('discord', 'https://discord.gg/jNTHCjStaS')}
                className="hover:text-purple-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0002 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9554 2.4189-2.1568 2.4189Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        </footer>
      </div>
    </div>
  );
};

export default SimpleLandingPage; 