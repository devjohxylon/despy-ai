import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function verifyTurso() {
  console.log('🔍 Verifying Turso Database Connection...\n');
  
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const dbToken = process.env.TURSO_AUTH_TOKEN;
  
  console.log('Environment Variables:');
  console.log('  TURSO_DATABASE_URL:', dbUrl ? '✅ Set' : '❌ Missing');
  console.log('  TURSO_AUTH_TOKEN:', dbToken ? '✅ Set' : '❌ Missing');
  console.log('');
  
  if (!dbUrl || !dbToken) {
    console.log('❌ Missing required environment variables!');
    console.log('Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your .env file');
    return;
  }
  
  try {
    console.log('🔌 Testing database connection...');
    
    const client = createClient({
      url: dbUrl,
      authToken: dbToken,
      timeout: 5000
    });
    
    // Test basic connection
    const result = await client.execute('SELECT 1 as test');
    console.log('✅ Database connection successful!');
    console.log('  Test query result:', result.rows[0]);
    
    // Test table creation
    console.log('\n📋 Testing table creation...');
    await client.execute(`
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY,
        name TEXT
      )
    `);
    console.log('✅ Table creation successful!');
    
    // Test insert
    console.log('\n📝 Testing insert operation...');
    const insertResult = await client.execute({
      sql: 'INSERT INTO test_table (name) VALUES (?)',
      args: ['test_' + Date.now()]
    });
    console.log('✅ Insert operation successful!');
    console.log('  Inserted ID:', insertResult.lastInsertId);
    
    // Test select
    console.log('\n🔍 Testing select operation...');
    const selectResult = await client.execute('SELECT COUNT(*) as count FROM test_table');
    console.log('✅ Select operation successful!');
    console.log('  Total rows:', selectResult.rows[0].count);
    
    // Clean up test table
    console.log('\n🧹 Cleaning up test table...');
    await client.execute('DROP TABLE test_table');
    console.log('✅ Cleanup successful!');
    
    console.log('\n🎉 All tests passed! Your Turso database is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 This might be an authentication issue. Check your TURSO_AUTH_TOKEN.');
    } else if (error.message.includes('timeout')) {
      console.log('\n💡 This might be a network timeout. Check your internet connection.');
    } else if (error.message.includes('not found')) {
      console.log('\n💡 This might be an incorrect database URL. Check your TURSO_DATABASE_URL.');
    }
  }
}

verifyTurso().catch(console.error); 