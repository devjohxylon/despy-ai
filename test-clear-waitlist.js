// Test script to clear waitlist via API
const BASE_URL = 'https://despy-ai-production.up.railway.app';

async function clearWaitlist() {
  try {
    console.log('🗑️ Clearing waitlist...');
    
    const response = await fetch(`${BASE_URL}/api/admin/waitlist/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': 'your-admin-secret-key' // You'll need to set this
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success:', data.message);
    } else {
      console.log('❌ Failed:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

clearWaitlist(); 