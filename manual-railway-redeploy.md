# Manual Railway Redeploy Instructions

## 🚨 **Railway Auto-Deploy Not Working**

The Git pushes aren't triggering Railway to redeploy. We need to manually trigger the deployment.

## 🔧 **Step-by-Step Manual Redeploy**

### **Step 1: Go to Railway Dashboard**
1. **Open**: https://railway.app/dashboard
2. **Sign in** to your account
3. **Find your DeSpy AI project**

### **Step 2: Force Manual Redeploy**
1. **Click on your DeSpy AI project**
2. **Go to "Deployments" tab**
3. **Find the latest deployment**
4. **Click "Redeploy" button**
5. **Wait for deployment to complete** (2-3 minutes)

### **Step 3: Check Deployment Logs**
1. **Go to "Logs" tab**
2. **Look for these messages**:
   ```
   🚀 DeSpy AI Backend with Stripe Integration Ready! - DEPLOYMENT V2
   💳 Payment endpoints: /api/payment/create-intent, /api/payment/confirm
   🔧 Stripe integration: MISSING KEY
   ```

### **Step 4: Add Stripe Environment Variables**
1. **Go to "Variables" tab**
2. **Add these environment variables**:
   ```
   STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
   ```

### **Step 5: Test the Endpoints**
After redeploy, test:
```bash
# Health check
curl https://despy-ai-production.up.railway.app/api/health

# Payment endpoint (should return 401 without auth)
curl -X POST https://despy-ai-production.up.railway.app/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"description":"test"}'
```

## 🎯 **Expected Results**
- ✅ Health endpoint returns 200
- ✅ Payment endpoint returns 401 (needs authentication)
- ✅ Frontend can connect to payment endpoints
- ✅ Token purchases work with Stripe

## 🔗 **Useful Links**
- **Railway Dashboard**: https://railway.app/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com/test/apikeys
- **DeSpy AI**: https://despy.io

## 📞 **If Still Not Working**
1. **Check Railway logs** for deployment errors
2. **Verify project settings** in Railway dashboard
3. **Check if Git integration** is properly configured
4. **Contact Railway support** if needed

## 🚀 **Alternative: Railway CLI**
If you have Railway CLI installed:
```bash
railway login
railway link
railway up
```

**The code is ready - we just need Railway to actually deploy it!** 