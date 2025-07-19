import fetch from 'node-fetch';

const RAILWAY_URL = 'https://despy-ai-production.up.railway.app';

async function testCurlLogin() {
  console.log('🔐 Testing login with curl-like request...');
  
  try {
    const response = await fetch(`${RAILWAY_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://despy-dq8wex06r-de-spy-ai.vercel.app',
        'Referer': 'https://despy-dq8wex06r-de-spy-ai.vercel.app/admin'
      },
      body: JSON.stringify({
        email: 'admin@despy.io',
        password: 'admin123'
      })
    });

    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  }
}

testCurlLogin(); 