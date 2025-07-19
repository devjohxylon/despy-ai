import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CreditCard, Lock, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import getApiUrl, { getApiUrlWithCacheBust } from '../utils/api';
import { secureTokenStorage } from '../utils/security';

// Load Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      '::placeholder': {
        color: '#aab7c4',
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

const CheckoutForm = ({ amount, description, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrlWithCacheBust('payment/create-intent'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secureTokenStorage.getToken()}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          description: description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret: secret } = await response.json();
      setClientSecret(secret);
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      toast.error('Failed to initialize payment. Please try again.');
      onCancel();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-300">Initializing payment...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Card Information
          </label>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
        </div>

        <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-400 text-sm">
            <Lock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Amount:</span>
            <span className="text-white font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-300">Description:</span>
            <span className="text-white text-sm">{description}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Pay ${amount.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const StripePayment = ({ amount, description, onSuccess, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Complete Payment</h2>
            <p className="text-gray-400">Enter your card details to purchase tokens</p>
          </div>
          
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm
            amount={amount}
            description={description}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Elements>
      </motion.div>
    </div>
  );
};

export default StripePayment; 