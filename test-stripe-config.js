// Test Stripe Configuration
const testStripeConfig = async () => {
  console.log('🔍 Testing Stripe Configuration...\n');

  // Test 1: Check if Stripe publishable key is available
  const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  console.log('1. Stripe Publishable Key:');
  console.log(`   Available: ${!!stripeKey ? '✅ Yes' : '❌ No'}`);
  if (stripeKey) {
    console.log(`   Key: ${stripeKey.substring(0, 20)}...`);
  }
  console.log('');

  // Test 2: Test payment intent creation
  console.log('2. Testing Payment Intent Creation...');
  try {
    const response = await fetch('https://despy-ai-production.up.railway.app/api/payment/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test'
      },
      body: JSON.stringify({
        amount: 1000,
        description: 'Test payment'
      })
    });

    console.log(`   Status: ${response.status}`);
    const data = await response.text();
    console.log(`   Response: ${data}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test 3: Check environment variables
  console.log('3. Environment Variables:');
  console.log(`   NODE_ENV: ${import.meta.env.NODE_ENV}`);
  console.log(`   PROD: ${import.meta.env.PROD}`);
  console.log(`   DEV: ${import.meta.env.DEV}`);
};

// Run the test
testStripeConfig(); 