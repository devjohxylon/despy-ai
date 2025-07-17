import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WaitlistModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    referralCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmit(formData);
      if (result?.referralCode) {
        setReferralCode(result.referralCode);
      }
      setSuccess(true);
      setFormData({
        email: '',
        name: '',
        referralCode: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = (platform) => {
    const text = encodeURIComponent("I just joined the DeSpy AI waitlist! Get early access to AI-powered blockchain security & analysis. Use my referral code:");
    const url = encodeURIComponent("https://despy.ai");
    const code = encodeURIComponent(referralCode);
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text} ${code} ${url}`, '_blank');
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral code copied!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="bg-[#0B0F17] border border-gray-800 p-8 max-w-md w-full rounded-xl"
            onClick={e => e.stopPropagation()}
          >
            {!success ? (
              <>
                <h2 className="text-3xl font-bold mb-6 text-gray-50">Join the Waitlist</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-800 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="you@example.com"
                      required
                    />
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>

                  {/* Name Field (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Name <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-800 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>

                  {/* Referral Code Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Referral Code <span className="text-gray-500 text-xs">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.referralCode}
                      onChange={e => setFormData(prev => ({ ...prev, referralCode: e.target.value.toUpperCase() }))}
                      className="w-full bg-gray-900/50 border border-gray-800 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Have a referral code?"
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-3 bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                  </motion.button>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-50 mb-2">You're on the list!</h2>
                <p className="text-gray-400 mb-8">Check your email for confirmation and updates.</p>
                
                {referralCode && (
                  <div className="mb-8">
                    <p className="text-sm text-gray-300 mb-2">Share your referral code to move up the waitlist:</p>
                    <div className="flex items-center justify-center gap-2 bg-gray-900/50 rounded-lg p-2 mb-4">
                      <code className="text-blue-400 font-mono text-lg">{referralCode}</code>
                      <button
                        onClick={copyReferralCode}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleShare('twitter')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] rounded-lg hover:bg-[#1a8cd8] transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                        Share on Twitter
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 