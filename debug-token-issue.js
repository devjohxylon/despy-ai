// Debug Token Authentication Issues
const debugTokenIssue = async () => {
  console.log('🔍 Debugging Token Authentication...\n');

  // Check if user is logged in
  const token = localStorage.getItem('token');
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  
  console.log('1. Token Status:');
  console.log(`   Has Token: ${!!token ? '✅ Yes' : '❌ No'}`);
  console.log(`   Token Value: ${token ? token.substring(0, 20) + '...' : 'None'}`);
  console.log(`   Expires At: ${expiresAt ? new Date(parseInt(expiresAt)).toLocaleString() : 'None'}`);
  console.log(`   Is Valid: ${token && expiresAt && Date.now() < parseInt(expiresAt) ? '✅ Yes' : '❌ No'}`);
  console.log('');

  // Test token endpoint
  console.log('2. Testing Token Endpoint...');
  try {
    const response = await fetch('https://despy-ai-production.up.railway.app/api/user/tokens', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`   Status: ${response.status}`);
    const data = await response.text();
    console.log(`   Response: ${data}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test auth endpoint
  console.log('3. Testing Auth Endpoint...');
  try {
    const response = await fetch('https://despy-ai-production.up.railway.app/api/auth/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`   Status: ${response.status}`);
    const data = await response.text();
    console.log(`   Response: ${data}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Check Stripe configuration
  console.log('4. Stripe Configuration:');
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  console.log(`   Stripe Key Available: ${!!stripeKey ? '✅ Yes' : '❌ No'}`);
  if (stripeKey) {
    console.log(`   Stripe Key: ${stripeKey.substring(0, 20)}...`);
  }
  console.log('');

  console.log('🔧 Solutions:');
  console.log('1. If token is missing/invalid: Log in again');
  console.log('2. If Stripe key is missing: Add VITE_STRIPE_PUBLISHABLE_KEY to Vercel');
  console.log('3. If backend returns 500: Check Railway logs');
};

// Run the debug
debugTokenIssue(); 