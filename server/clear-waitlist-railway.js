#!/usr/bin/env node

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
    console.log('🗑️ Starting waitlist clear...');
    console.log('🔧 Database URL configured:', !!process.env.TURSO_DATABASE_URL);
    console.log('🔧 Database Token configured:', !!process.env.TURSO_AUTH_TOKEN);
    
    const db = createDbClient();
    
    // First, get the count
    const countResult = await db.execute('SELECT COUNT(*) as count FROM waitlist');
    const currentCount = countResult.rows[0].count;
    
    console.log(`📊 Current waitlist count: ${currentCount}`);
    
    if (currentCount === 0) {
      console.log('✅ Waitlist is already empty!');
      return;
    }
    
    // Delete all waitlist entries
    const result = await db.execute('DELETE FROM waitlist');
    
    console.log('✅ Waitlist cleared successfully!');
    console.log(`📊 Deleted ${result.rowsAffected} entries`);
    
    // Verify it's empty
    const verifyResult = await db.execute('SELECT COUNT(*) as count FROM waitlist');
    const newCount = verifyResult.rows[0].count;
    console.log(`📊 New waitlist count: ${newCount}`);
    
  } catch (error) {
    console.error('❌ Failed to clear waitlist:', error.message);
    process.exit(1);
  }
}

// Run the script
clearWaitlist(); 