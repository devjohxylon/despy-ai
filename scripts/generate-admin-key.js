import crypto from 'crypto';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from the backend directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const generateSecureKey = () => {
  // Generate a 32-byte random key and encode it as base64
  return crypto.randomBytes(32).toString('base64');
};

const storeAdminKey = async (apiKey) => {
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error('\n❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables are required');
    console.log('\n🔑 Your generated VITE_ADMIN_API_KEY is (store this securely):\n');
    console.log(apiKey);
    console.log('\n⚠️  Since database connection failed, make sure to:');
    console.log('1. Add this key to your Vercel environment variables as VITE_ADMIN_API_KEY');
    console.log('2. Never commit this key to version control');
    console.log('3. Store it securely for your reference');
    console.log('4. Set up your database credentials to enable key verification\n');
    return;
  }

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
  });

  try {
    // Create admin_keys table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_used DATETIME
      )
    `);

    // Hash the API key before storing
    const keyHash = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    // Store the hashed key
    await db.execute(
      'INSERT INTO admin_keys (key_hash) VALUES (?)',
      [keyHash]
    );

    console.log('\n✅ Admin API key has been generated and stored securely.');
    console.log('\n🔑 Your VITE_ADMIN_API_KEY is:\n');
    console.log(apiKey);
    console.log('\n⚠️  Make sure to:');
    console.log('1. Add this key to your Vercel environment variables');
    console.log('2. Never commit this key to version control');
    console.log('3. Store it securely for your reference\n');

  } catch (error) {
    console.error('\n❌ Error storing admin key:', error.message);
    console.log('\n🔑 Your generated VITE_ADMIN_API_KEY is (store this securely):\n');
    console.log(apiKey);
    console.log('\n⚠️  Even though storage failed, you can:');
    console.log('1. Add this key to your Vercel environment variables as VITE_ADMIN_API_KEY');
    console.log('2. Never commit this key to version control');
    console.log('3. Store it securely for your reference');
    console.log('4. Try running this script again once database issues are resolved\n');
  }
};

// Generate and store the key
const apiKey = generateSecureKey();
storeAdminKey(apiKey); 