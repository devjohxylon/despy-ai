import fetch from 'node-fetch';

const RAILWAY_URL = 'https://despy-ai-production.up.railway.app';
const VERCEL_URL = 'https://despy-dq8wex06r-de-spy-ai.vercel.app';

async function testCompleteAdmin() {
  console.log('🔍 Testing Complete Admin System...\n');
  
  // Test 1: Backend Health
  console.log('1️⃣ Testing Backend Health...');
  try {
    const healthResponse = await fetch(`${RAILWAY_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Backend Health:', healthData.status);
    console.log('   Database Connected:', healthData.database?.connected);
  } catch (error) {
    console.log('❌ Backend Health Failed:', error.message);
  }
  
  // Test 2: Admin Login
  console.log('\n2️⃣ Testing Admin Login...');
  try {
    const loginResponse = await fetch(`${RAILWAY_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': VERCEL_URL
      },
      body: JSON.stringify({
        email: 'admin@despy.io',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Admin Login Successful');
      console.log('   Token:', loginData.token ? 'Present' : 'Missing');
      console.log('   User:', loginData.user);
      
      // Test 3: Get User Info
      console.log('\n3️⃣ Testing Get User Info...');
      const userResponse = await fetch(`${RAILWAY_URL}/api/auth/user`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Origin': VERCEL_URL
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('✅ Get User Info Successful');
        console.log('   User Data:', userData);
      } else {
        console.log('❌ Get User Info Failed:', userResponse.status);
      }
      
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Admin Login Failed:', loginResponse.status);
      console.log('   Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Admin Login Error:', error.message);
  }
  
  // Test 4: Waitlist Stats
  console.log('\n4️⃣ Testing Waitlist Stats...');
  try {
    const statsResponse = await fetch(`${RAILWAY_URL}/api/stats`);
    const statsData = await statsResponse.json();
    console.log('✅ Waitlist Stats:', statsData);
  } catch (error) {
    console.log('❌ Waitlist Stats Failed:', error.message);
  }
  
  console.log('\n🎉 Complete Admin System Test Finished!');
}

testCompleteAdmin(); 