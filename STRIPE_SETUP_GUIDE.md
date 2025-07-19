# Stripe Setup Guide

## 🚨 **Current Issues**
1. **Card input not working** - likely missing Stripe publishable key
2. **No Stripe products configured** - but this isn't required for payment intents

## 🔧 **Step 1: Add Stripe Environment Variables to Railway**

### **Go to Railway Dashboard:**
1. **Open**: https://railway.app/dashboard
2. **Select your DeSpy AI project**
3. **Go to "Variables" tab**
4. **Add these environment variables:**

```
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
```

### **Get Your Stripe Keys:**
1. **Go to**: https://dashboard.stripe.com/test/apikeys
2. **Copy the "Publishable key"** (starts with `pk_test_`)
3. **Copy the "Secret key"** (starts with `sk_test_`)

## 🔧 **Step 2: Add Stripe Environment Variables to Vercel**

### **Go to Vercel Dashboard:**
1. **Open**: https://vercel.com/dashboard
2. **Select your DeSpy AI project**
3. **Go to "Settings" → "Environment Variables"**
4. **Add this environment variable:**

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
```

## 🔧 **Step 3: Test the Configuration**

### **After adding environment variables:**
1. **Redeploy Railway** (trigger a new deployment)
2. **Redeploy Vercel** (trigger a new deployment)
3. **Test the payment flow**

## 🎯 **How Payment Intents Work (No Products Needed)**

### **Stripe Payment Intents:**
- **Don't require pre-configured products**
- **Create charges dynamically** based on amount and description
- **Perfect for token purchases** where amounts vary

### **Our Implementation:**
```javascript
// Backend creates payment intent
{
  amount: 1000, // $10.00 in cents
  description: "Purchase 500 tokens"
}

// Stripe creates a payment intent
// User pays with card
// Payment is processed
// Tokens are added to account
```

## 🧪 **Test Cards**

### **Successful Payment:**
- **Card**: `4242 4242 4242 4242`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

### **Declined Payment:**
- **Card**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## 🔍 **Troubleshooting**

### **If card input doesn't work:**
1. **Check browser console** for errors
2. **Verify `VITE_STRIPE_PUBLISHABLE_KEY`** is set in Vercel
3. **Check if Stripe.js loads** in network tab

### **If payment intent fails:**
1. **Check Railway logs** for backend errors
2. **Verify `STRIPE_SECRET_KEY`** is set in Railway
3. **Test with smaller amounts** first

### **If authentication fails:**
1. **Make sure user is logged in**
2. **Check AuthDebug panel** for token status
3. **Try logging in again**

## 🚀 **Expected Results**

After setup:
- ✅ **Card input field appears** and accepts input
- ✅ **Payment intent creates** successfully
- ✅ **Payment processes** through Stripe
- ✅ **Tokens are added** to account
- ✅ **Success/error messages** display properly

## 📞 **Need Help?**

If you're still having issues:
1. **Check Railway logs** for backend errors
2. **Check browser console** for frontend errors
3. **Verify all environment variables** are set correctly
4. **Test with Stripe test cards** only 