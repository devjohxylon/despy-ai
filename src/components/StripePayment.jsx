import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import getApiUrl from '../utils/api';

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

const PaymentForm = ({ amount, description, onSuccess, onError, loading, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on your server
      const response = await fetch(getApiUrl('payment/create-intent'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          description
        })
      });

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        onError?.(stripeError.message);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      onError?.(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        '::placeholder': {
          color: '#9ca3af',
        },
        backgroundColor: 'transparent',
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-300">
          <CreditCard className="w-5 h-5" />
          <span className="font-medium">Payment Details</span>
        </div>
        
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <CardElement options={cardElementOptions} />
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg p-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Lock className="w-4 h-4" />
          <span>Your payment is secure and encrypted</span>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={!stripe || processing || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};

const StripePayment = ({ amount, description, onSuccess, onError, loading, setLoading }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        amount={amount}
        description={description}
        onSuccess={onSuccess}
        onError={onError}
        loading={loading}
        setLoading={setLoading}
      />
    </Elements>
  );
};

export default StripePayment; 