import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

async function setupTursoDatabase() {
  console.log('🔧 Setting up Turso database...');
  
  const dbUrl = process.env.TURSO_DATABASE_URL;
  const dbToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!dbUrl || !dbToken) {
    console.error('❌ Missing environment variables:');
    console.error('TURSO_DATABASE_URL:', dbUrl ? 'SET' : 'NOT SET');
    console.error('TURSO_AUTH_TOKEN:', dbToken ? 'SET' : 'NOT SET');
    console.error('\nPlease set these in your Vercel environment variables');
    process.exit(1);
  }
  
  try {
    console.log('📡 Connecting to Turso database...');
    const db = createClient({
      url: dbUrl,
      authToken: dbToken
    });
    
    // Test connection
    await db.execute('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Create waitlist table
    console.log('📋 Creating waitlist table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        company TEXT,
        role TEXT,
        interests TEXT,
        referral_code TEXT UNIQUE,
        referred_by TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Waitlist table created/verified');
    
    // Create admins table
    console.log('👥 Creating admins table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Admins table created/verified');
    
    // Check table structure
    console.log('🔍 Checking table structure...');
    const tables = await db.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('waitlist', 'admins')
    `);
    
    console.log('📊 Found tables:', tables.rows.map(row => row.name));
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the database: https://your-domain.vercel.app/api/test-db');
    console.log('2. Try the waitlist: https://your-domain.vercel.app/api/waitlist');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check your TURSO_DATABASE_URL format');
    console.error('2. Verify your TURSO_AUTH_TOKEN is valid');
    console.error('3. Ensure your Turso database is accessible');
    process.exit(1);
  }
}

setupTursoDatabase(); 