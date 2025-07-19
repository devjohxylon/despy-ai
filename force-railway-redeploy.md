# Force Railway Redeploy Instructions

## 🚨 **The Issue**
Railway hasn't deployed the updated backend with Stripe endpoints yet. The 404 error confirms this.

## 🔧 **Solution: Force Railway Redeploy**

### **Option 1: Manual Redeploy (Recommended)**
1. **Go to**: https://railway.app/dashboard
2. **Select your DeSpy AI project**
3. **Go to Deployments tab**
4. **Click "Redeploy"** on the latest deployment
5. **Wait for deployment to complete** (2-3 minutes)

### **Option 2: Git Push (If connected to Git)**
If Railway is connected to your Git repository:
```bash
git add .
git commit -m "Add Stripe integration and payment endpoints"
git push origin main
```

### **Option 3: Railway CLI (If you have it)**
```bash
railway login
railway link
railway up
```

## 📋 **After Redeploy**

### **1. Add Stripe Environment Variables**
In Railway dashboard, add:
```
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
```

### **2. Test the Endpoints**
```bash
# Test health endpoint
curl https://despy-ai-production.up.railway.app/api/health

# Test payment endpoint (should return 401 without auth)
curl -X POST https://despy-ai-production.up.railway.app/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"description":"test"}'
```

### **3. Test Frontend**
1. Go to: https://despy.io
2. Login to admin dashboard
3. Try buying tokens
4. Use test card: `4242 4242 4242 4242`

## 🎯 **Expected Results**
- ✅ `/api/health` returns 200
- ✅ `/api/payment/create-intent` returns 401 (needs auth)
- ✅ Frontend can connect to payment endpoints
- ✅ Token purchases work with Stripe

## 🔗 **Useful Links**
- **Railway Dashboard**: https://railway.app/dashboard
- **Stripe Dashboard**: https://dashboard.stripe.com/test/apikeys
- **DeSpy AI**: https://despy.io

## 📞 **If Still Not Working**
1. Check Railway logs for errors
2. Verify Stripe keys are correct
3. Ensure backend is fully deployed
4. Check browser console for errors 