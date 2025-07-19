import fetch from 'node-fetch';

const BASE_URL = 'https://despy-ai-production.up.railway.app/api';
const ADMIN_EMAIL = 'admin@despy.io';
const ADMIN_PASSWORD = 'admin123';

async function testBackend() {
  console.log('🧪 Testing Backend Endpoints...\n');

  try {
    // 1. Test admin login
    console.log('1. Testing admin login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful');

    // 2. Test admin waitlist stats
    console.log('\n2. Testing admin waitlist stats...');
    const statsResponse = await fetch(`${BASE_URL}/admin/waitlist/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!statsResponse.ok) {
      throw new Error(`Stats failed: ${statsResponse.status} ${statsResponse.statusText}`);
    }

    const statsData = await statsResponse.json();
    console.log('✅ Stats endpoint working');
    console.log('   - Total:', statsData.total);
    console.log('   - Weekly:', statsData.weekly);
    console.log('   - Monthly:', statsData.monthly);
    console.log('   - Growth Rate:', statsData.growthRate);
    console.log('   - Signup Trend:', statsData.signupTrend?.length || 0, 'data points');
    console.log('   - Status Breakdown:', statsData.statusBreakdown?.length || 0, 'categories');

    // 3. Test admin waitlist entries
    console.log('\n3. Testing admin waitlist entries...');
    const entriesResponse = await fetch(`${BASE_URL}/admin/waitlist?page=1&search=&status=`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!entriesResponse.ok) {
      throw new Error(`Entries failed: ${entriesResponse.status} ${entriesResponse.statusText}`);
    }

    const entriesData = await entriesResponse.json();
    console.log('✅ Entries endpoint working');
    console.log('   - Entries:', entriesData.entries?.length || 0);
    console.log('   - Total Pages:', entriesData.pagination?.totalPages || 0);

    // 4. Test bulk actions (if there are entries)
    if (entriesData.entries && entriesData.entries.length > 0) {
      console.log('\n4. Testing bulk actions...');
      const firstEntryId = entriesData.entries[0]._id;
      
      const bulkResponse = await fetch(`${BASE_URL}/admin/waitlist/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'approve',
          ids: [firstEntryId]
        })
      });

      if (!bulkResponse.ok) {
        throw new Error(`Bulk action failed: ${bulkResponse.status} ${bulkResponse.statusText}`);
      }

      const bulkData = await bulkResponse.json();
      console.log('✅ Bulk actions working');
      console.log('   - Response:', bulkData.message);
    }

    // 5. Test bulk email
    console.log('\n5. Testing bulk email...');
    const bulkEmailResponse = await fetch(`${BASE_URL}/admin/waitlist/bulk-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ids: entriesData.entries?.slice(0, 2).map(e => e._id) || [],
        subject: 'Test Email',
        message: 'This is a test email from the admin dashboard.'
      })
    });

    if (!bulkEmailResponse.ok) {
      throw new Error(`Bulk email failed: ${bulkEmailResponse.status} ${bulkEmailResponse.statusText}`);
    }

    const bulkEmailData = await bulkEmailResponse.json();
    console.log('✅ Bulk email working');
    console.log('   - Response:', bulkEmailData.message);
    console.log('   - Sent to:', bulkEmailData.sentTo, 'users');

    console.log('\n🎉 All backend endpoints are working correctly!');

  } catch (error) {
    console.error('\n❌ Backend test failed:', error.message);
    console.error('Full error:', error);
  }
}

testBackend(); 