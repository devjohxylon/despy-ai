# Stripe Subscription Setup Guide

## Overview
This guide will help you set up Stripe subscriptions for DeSpy AI. The subscription system allows users to subscribe to monthly plans and receive tokens automatically.

## Prerequisites
- Stripe account with API keys
- Backend server running on Railway
- Frontend deployed on Vercel

## Step 1: Create Stripe Products and Prices

### 1.1 Create Products in Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create the following products:

#### Pro Plan
- **Name**: DeSpy AI Pro
- **Description**: Advanced scanning with 500 tokens and 5 scans per month
- **Price**: $9.99/month

#### Enterprise Plan
- **Name**: DeSpy AI Enterprise
- **Description**: Unlimited scanning with 2000 tokens and 20 scans per month
- **Price**: $29.99/month

### 1.2 Get Price IDs
After creating each product, copy the Price ID (starts with `price_`). You'll need these for the frontend configuration.

## Step 2: Update Frontend Configuration

### 2.1 Update TokenSystem.jsx
Replace the placeholder price IDs in `src/components/TokenSystem.jsx`:

```javascript
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
    stripePriceId: 'price_YOUR_PRO_PRICE_ID_HERE' // Replace with actual Stripe price ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    tokens: 2000,
    scans: 20,
    features: ['Unlimited scanning', '24/7 support', 'Custom reports', '20 scans per month', 'Dedicated account manager'],
    popular: false,
    stripePriceId: 'price_YOUR_ENTERPRISE_PRICE_ID_HERE' // Replace with actual Stripe price ID
  }
], []);
```

## Step 3: Set Up Webhooks

### 3.1 Create Webhook Endpoint
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL to: `https://your-railway-app.railway.app/api/subscription/webhook`
4. Select the following events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 3.2 Get Webhook Secret
After creating the webhook, copy the signing secret (starts with `whsec_`).

## Step 4: Update Environment Variables

### 4.1 Railway Backend Variables
Add these to your Railway backend environment variables:

```bash
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your webhook signing secret
```

### 4.2 Vercel Frontend Variables
Add these to your Vercel frontend environment variables:

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key
```

## Step 5: Test the Integration

### 5.1 Test with Stripe Test Cards
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### 5.2 Test Subscription Flow
1. Go to your DeSpy AI dashboard
2. Click on "Token & Subscription Management"
3. Go to "Subscriptions" tab
4. Try subscribing to a paid plan
5. Use a test card number
6. Verify the subscription is created in Stripe

## Step 6: Database Schema (Optional)

If you want to track subscriptions in your database, add this table:

```sql
CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start INTEGER,
  current_period_end INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Common Issues

1. **"No such price" error**
   - Verify the price ID is correct in TokenSystem.jsx
   - Ensure the price exists in your Stripe dashboard

2. **Webhook signature verification failed**
   - Check that STRIPE_WEBHOOK_SECRET is correct
   - Ensure the webhook URL is accessible

3. **Payment fails**
   - Verify STRIPE_SECRET_KEY is correct
   - Check that the customer email is valid

4. **Subscription not showing in dashboard**
   - Check webhook events in Stripe dashboard
   - Verify webhook endpoint is receiving events

### Debug Steps

1. Check Railway logs for backend errors
2. Check Vercel logs for frontend errors
3. Monitor Stripe dashboard for failed payments
4. Test webhook endpoint with Stripe CLI

## Stripe CLI Testing

Install Stripe CLI for local testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5174/api/subscription/webhook
```

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment methods
- [ ] Set up proper error monitoring
- [ ] Configure subscription management features
- [ ] Set up automated token distribution
- [ ] Test subscription cancellation flow

## Support

If you encounter issues:
1. Check Stripe dashboard for error logs
2. Review Railway deployment logs
3. Verify all environment variables are set
4. Test with Stripe CLI locally
5. Contact support with specific error messages 