import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

// Test with a test publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OqXXXXXXXXXX');

const TestPaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Test with a simple $1 payment
      const response = await fetch('https://despy-ai-production.up.railway.app/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          amount: 100, // $1.00 in cents
          description: 'Test payment'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (stripeError) {
        setError(stripeError.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
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
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Test Stripe Integration</h3>
      
      {success ? (
        <div className="flex items-center gap-2 text-green-400 bg-green-900/20 border border-green-900/30 rounded-lg p-3">
          <CheckCircle className="w-5 h-5" />
          <span>Payment successful!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
            <CardElement options={cardElementOptions} />
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/20 border border-red-900/30 rounded-lg p-3">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Test $1 Payment
              </>
            )}
          </button>
        </form>
      )}
      
      <div className="mt-4 text-xs text-gray-400">
        <p>Use test card: 4242 4242 4242 4242</p>
        <p>Any future date, any CVC</p>
      </div>
    </div>
  );
};

const StripeTest = () => {
  return (
    <Elements stripe={stripePromise}>
      <TestPaymentForm />
    </Elements>
  );
};

export default StripeTest; 