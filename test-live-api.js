// Test Live API Endpoints
const BASE_URL = 'https://despy-ai-de-spy-ai.vercel.app'; // Your production Vercel URL

async function testLiveAPI() {
  console.log('🧪 Testing Live DeSpy AI API...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/api/health`,
      method: 'GET'
    },
    {
      name: 'Stats API',
      url: `${BASE_URL}/api/stats`,
      method: 'GET'
    },
    {
      name: 'Waitlist API - Invalid Email',
      url: `${BASE_URL}/api/waitlist`,
      method: 'POST',
      body: { email: 'invalid-email' }
    },
    {
      name: 'Waitlist API - Valid Email',
      url: `${BASE_URL}/api/waitlist`,
      method: 'POST',
      body: { email: `test-${Date.now()}@example.com` }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const startTime = Date.now();
      const response = await fetch(test.url, options);
      const endTime = Date.now();
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      console.log(`  Time: ${endTime - startTime}ms`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`  Response:`, data);
      } else {
        console.log(`  Error: ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎉 Live API testing complete!');
  console.log('\n📋 If you see errors:');
  console.log('1. Check Vercel deployment status');
  console.log('2. Verify environment variables are set');
  console.log('3. Check Vercel function logs');
}

// Run the tests
testLiveAPI().catch(console.error); 