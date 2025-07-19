import fetch from 'node-fetch';

const RAILWAY_URL = 'https://despy-ai-production.up.railway.app';

async function testAdminLogin() {
  console.log('🔐 Testing admin login...');
  
  try {
    const response = await fetch(`${RAILWAY_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@despy.io',
        password: 'admin123'
      })
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful!');
      console.log('Token:', data.token ? 'Present' : 'Missing');
      console.log('User:', data.user);
    } else {
      const error = await response.text();
      console.log('❌ Login failed:', error);
    }
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
  }
}

testAdminLogin(); 