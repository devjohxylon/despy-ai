import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function testDatabase() {
  console.log('🔍 Testing database connection...');

  try {
    // Test connection
    await client.execute('SELECT 1');
    console.log('✅ Database connection successful!');

    // Create table
    console.log('\n📝 Creating waitlist table...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table created/verified successfully!');

    // Test insert
    console.log('\n📝 Testing insert operation...');
    const testEmail = `test_${Date.now()}@example.com`;
    await client.execute({
      sql: 'INSERT INTO waitlist (email) VALUES (?)',
      args: [testEmail]
    });
    console.log('✅ Insert successful!');

    // Test query
    console.log('\n📝 Testing query operation...');
    const result = await client.execute({
      sql: 'SELECT * FROM waitlist WHERE email = ?',
      args: [testEmail]
    });
    console.log('✅ Query successful!');
    console.log('📊 Retrieved row:', result.rows[0]);

    // Test unique constraint
    console.log('\n📝 Testing unique constraint...');
    try {
      await client.execute({
        sql: 'INSERT INTO waitlist (email) VALUES (?)',
        args: [testEmail]
      });
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        console.log('✅ Unique constraint working correctly!');
      } else {
        throw error;
      }
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await client.execute({
      sql: 'DELETE FROM waitlist WHERE email = ?',
      args: [testEmail]
    });
    console.log('✅ Test data cleaned up!');

    // Test stats query
    console.log('\n📊 Testing stats query...');
    const stats = await client.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN created_at >= datetime('now', '-7 days') THEN 1 END) as last_7_days
      FROM waitlist
    `);
    console.log('✅ Stats query successful!');
    console.log('📊 Current stats:', {
      total: stats.rows[0].total,
      last7Days: stats.rows[0].last_7_days
    });

  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabase(); 