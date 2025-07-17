# DeSpy AI Deployment Guide

## Critical Issues Fixed

### 1. Missing Dependencies ✅
- Added `bcryptjs`, `jsonwebtoken`, `cors`, `express`, `dotenv` to `package.json`
- Added TypeScript type definitions for better development experience

### 2. Invalid HTTP Status Codes ✅
- Fixed `status: 45` → `status: 405` (Method Not Allowed)
- Fixed `status: 50` → `status: 500` (Internal Server Error)

### 3. Database Query Typo ✅
- Fixed `result.rows0l` → `result.rows[0].total`

### 4. Missing API Database File ✅
- Created `api/db.js` to re-export functions from `lib/db.js`

### 5. Environment Variable Inconsistency ✅
- Standardized on `TURSO_DATABASE_URL` across all files

## Vercel Deployment Setup

### 1. Environment Variables
Set these in your Vercel project settings:

```bash
# Database Configuration
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key

# Optional: Admin credentials
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-password

# Feature Flags
ANALYTICS_ENABLED=true
ENABLE_REFERRAL_SYSTEM=true
```

### 2. Build Configuration
The `vercel.json` is configured for:
- Vite framework
- API functions with Node.js runtime
- Proper routing for SPA
- Security headers

### 3. Database Setup
Run these commands locally to set up your database:

```bash
# Install dependencies
npm install

# Initialize database and create admin user
npm run setup
# or manually:
node scripts/init-db.js
```

### 4. Deployment Commands
```bash
# Deploy to Vercel
vercel --prod

# Or push to GitHub (if connected)
git push origin main
```

## Troubleshooting

### Common Deployment Issues

1. **Build Fails**: Ensure all dependencies are in `package.json`
2. **API Functions Fail**: Check environment variables in Vercel dashboard
3. **Database Connection**: Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
4. **CORS Issues**: API functions are configured to handle CORS properly

### Local Development
```bash
# Start development server
npm run dev

# Test API endpoints
curl -X POST http://localhost:5173/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret in production
2. **Database Tokens**: Rotate Turso auth tokens regularly
3. **Environment Variables**: Never commit `.env` files to version control
4. **Input Validation**: All API endpoints now validate inputs properly

## Monitoring

- Check Vercel function logs for API errors
- Monitor database connection status
- Set up alerts for failed deployments
- Track API response times and error rates

## Support

If deployment issues persist:
1. Check Vercel build logs
2. Verify environment variables
3. Test API endpoints locally
4. Review function timeout settings (currently 30s) 