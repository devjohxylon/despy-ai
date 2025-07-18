// Simple API Testing Script
const BASE_URL = 'https://despy-ai.vercel.app'; // Update this to your actual Vercel URL

async function testAPI() {
  console.log('🧪 Testing DeSpy AI API Endpoints...\n');

  // Test 1: Health Check
  try {
    console.log('1. Testing Health Check...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test 2: Stats
  try {
    console.log('\n2. Testing Stats...');
    const statsRes = await fetch(`${BASE_URL}/api/stats`);
    const statsData = await statsRes.json();
    console.log('✅ Stats:', statsData);
  } catch (error) {
    console.log('❌ Stats Failed:', error.message);
  }

  // Test 3: Waitlist (Invalid Email)
  try {
    console.log('\n3. Testing Waitlist - Invalid Email...');
    const invalidRes = await fetch(`${BASE_URL}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email' })
    });
    const invalidData = await invalidRes.json();
    console.log('✅ Invalid Email Response:', invalidData);
  } catch (error) {
    console.log('❌ Invalid Email Test Failed:', error.message);
  }

  // Test 4: Waitlist (Valid Email)
  try {
    console.log('\n4. Testing Waitlist - Valid Email...');
    const validRes = await fetch(`${BASE_URL}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `test-${Date.now()}@example.com` })
    });
    const validData = await validRes.json();
    console.log('✅ Valid Email Response:', validData);
  } catch (error) {
    console.log('❌ Valid Email Test Failed:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

// Run the tests
testAPI().catch(console.error); 