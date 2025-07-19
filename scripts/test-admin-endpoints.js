import fetch from 'node-fetch';

const RAILWAY_URL = 'https://despy-ai-production.up.railway.app';
const VERCEL_URL = 'https://despy-cvh0g4o70-de-spy-ai.vercel.app';

async function testAdminEndpoints() {
  console.log('🔍 Testing Admin Endpoints...\n');
  
  let token = null;
  
  // Test 1: Login to get token
  console.log('1️⃣ Testing Admin Login...');
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
      token = loginData.token;
      console.log('✅ Admin Login Successful');
      console.log('   Token:', token ? 'Present' : 'Missing');
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Admin Login Failed:', loginResponse.status);
      console.log('   Error:', errorText);
      return;
    }
  } catch (error) {
    console.log('❌ Admin Login Error:', error.message);
    return;
  }
  
  // Test 2: Waitlist Stats
  console.log('\n2️⃣ Testing Waitlist Stats...');
  try {
    const statsResponse = await fetch(`${RAILWAY_URL}/api/admin/waitlist/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': VERCEL_URL
      }
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Waitlist Stats Successful');
      console.log('   Data:', statsData);
    } else {
      const errorText = await statsResponse.text();
      console.log('❌ Waitlist Stats Failed:', statsResponse.status);
      console.log('   Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Waitlist Stats Error:', error.message);
  }
  
  // Test 3: Waitlist Entries
  console.log('\n3️⃣ Testing Waitlist Entries...');
  try {
    const entriesResponse = await fetch(`${RAILWAY_URL}/api/admin/waitlist?page=1&limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': VERCEL_URL
      }
    });
    
    if (entriesResponse.ok) {
      const entriesData = await entriesResponse.json();
      console.log('✅ Waitlist Entries Successful');
      console.log('   Total Entries:', entriesData.entries?.length || 0);
      console.log('   Pagination:', entriesData.pagination);
    } else {
      const errorText = await entriesResponse.text();
      console.log('❌ Waitlist Entries Failed:', entriesResponse.status);
      console.log('   Error:', errorText);
    }
  } catch (error) {
    console.log('❌ Waitlist Entries Error:', error.message);
  }
  
  console.log('\n🎉 Admin Endpoints Test Finished!');
}

testAdminEndpoints(); 