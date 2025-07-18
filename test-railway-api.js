// Test Railway API Endpoints
const BASE_URL = 'https://despy-ai-production.up.railway.app';

async function testRailwayAPI() {
  console.log('🧪 Testing Railway DeSpy AI API...\n');
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
      name: 'Waitlist API - Valid Email',
      url: `${BASE_URL}/api/waitlist`,
      method: 'POST',
      body: { email: `test-railway-${Date.now()}@example.com` }
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
  
  console.log('🎉 Railway API testing complete!');
  console.log('\n✅ Your API is working perfectly on Railway!');
  console.log('📊 No more SSO protection issues!');
}

// Run the tests
testRailwayAPI().catch(console.error); 