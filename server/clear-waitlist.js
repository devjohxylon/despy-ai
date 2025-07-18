import { createClient } from '@libsql/client';

// Database client
function createDbClient() {
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const dbToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!dbUrl || !dbToken) {
    throw new Error('Database environment variables not configured');
  }
  
  return createClient({
    url: dbUrl,
    authToken: dbToken,
    timeout: 5000
  });
}

async function clearWaitlist() {
  try {
    const db = createDbClient();
    
    // Delete all waitlist entries
    const result = await db.execute('DELETE FROM waitlist');
    
    console.log('✅ Waitlist cleared successfully!');
    console.log(`📊 Deleted ${result.rowsAffected} entries`);
    
  } catch (error) {
    console.error('❌ Failed to clear waitlist:', error);
  }
}

// Run the script
clearWaitlist(); 