import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import getApiUrl from '../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SubscriptionForm = ({ plan, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create subscription on backend
      const response = await fetch(`${getApiUrl()}/api/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.stripePriceId,
          customerEmail: 'user@example.com' // This should come from user context
        }),
      });

      const { subscriptionId, clientSecret, error: serverError } = await response.json();

      if (serverError) {
        throw new Error(serverError);
      }

      // Confirm payment with Stripe
      const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      toast.success(`Successfully subscribed to ${plan.name}!`);
      onSuccess(plan);
    } catch (err) {
      setError(err.message);
      toast.error('Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Card Details
            </label>
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <XCircle size={16} />
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-4">
        <h4 className="text-blue-400 font-medium mb-2">Subscription Summary</h4>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>Plan:</span>
            <span className="text-white">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Price:</span>
            <span className="text-white">${plan.price}/month</span>
          </div>
          <div className="flex justify-between">
            <span>Tokens Included:</span>
            <span className="text-white">{plan.tokens.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Scans per Month:</span>
            <span className="text-white">{plan.scans}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              Subscribe Now
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const StripeSubscription = ({ plan, onSuccess, onCancel }) => {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionForm plan={plan} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
};

export default StripeSubscription; 