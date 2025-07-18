# Vercel Deployment Setup Guide

## Current Issue
Your database query is failing because the environment variables are not configured in your Vercel deployment.

## Step 1: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your `despy-ai` project

2. **Navigate to Environment Variables**
   - Go to **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **Add the Required Variables**

   ### Database Configuration
   ```
   Name: TURSO_DATABASE_URL
   Value: [Your Turso database URL]
   Environment: Production, Preview, Development
   ```

   ```
   Name: TURSO_AUTH_TOKEN
   Value: [Your Turso auth token]
   Environment: Production, Preview, Development
   ```

   ### Sentry Monitoring (Optional)
   ```
   Name: SENTRY_DSN
   Value: [Your Sentry DSN]
   Environment: Production, Preview, Development
   ```

## Step 2: Get Your Turso Credentials

1. **Go to Turso Dashboard**
   - Visit: https://dashboard.turso.tech/
   - Sign in to your account

2. **Find Your Database**
   - Look for a database named something like `despy-waitlist-vercel-icfg-tie56nv0ax88cbenwjgq2dnf`
   - Click on it

3. **Get Connection Details**
   - Copy the **Database URL** (starts with `libsql://`)
   - Copy the **Auth Token** (long JWT token)

## Step 3: Redeploy

After setting the environment variables:

1. **Trigger a new deployment**
   - Go to **Deployments** tab in Vercel
   - Click **Redeploy** on your latest deployment
   - Or push a new commit to GitHub if connected

2. **Verify the deployment**
   - Check the deployment logs for any errors
   - Test your API endpoints

## Step 4: Test Your API

Once deployed, test these endpoints:

### Health Check
```bash
curl https://your-vercel-url.vercel.app/api/health
```

### Waitlist API
```bash
curl -X POST https://your-vercel-url.vercel.app/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Stats API
```bash
curl https://your-vercel-url.vercel.app/api/stats
```

## Troubleshooting

### If you still get database errors:

1. **Check Turso Database Status**
   - Ensure your database is active in Turso dashboard
   - Verify the database URL is correct

2. **Check Network Access**
   - Turso databases might need to be configured for external access
   - Check if your database allows connections from Vercel's IP ranges

3. **Verify Environment Variables**
   - Double-check that variables are set for all environments (Production, Preview, Development)
   - Ensure no extra spaces or quotes in the values

### Common Issues:

- **"Failed to fetch"**: Usually means environment variables are missing
- **"Authentication failed"**: Check your TURSO_AUTH_TOKEN
- **"Database not found"**: Verify your TURSO_DATABASE_URL

## Quick Test Script

Run this locally to verify your credentials work:

```bash
node scripts/verify-turso.js
```

## Next Steps

Once your API is working:

1. **Test the frontend**: Visit your deployed site and try the waitlist form
2. **Monitor logs**: Check Vercel function logs for any errors
3. **Set up monitoring**: Configure Sentry for error tracking

## Support

If you continue having issues:
1. Check Vercel function logs in the dashboard
2. Verify Turso database is accessible
3. Test with the provided scripts 