import { execSync } from 'child_process';
import { initDb } from '../api/db.js';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function setup() {
  console.log('🚀 Starting DeSpy AI setup...');

  // Install dependencies
  console.log('\n📦 Installing dependencies...');
  try {
    execSync('npm install jsonwebtoken bcryptjs dotenv @libsql/client axios react-hot-toast recharts framer-motion lucide-react', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error);
    process.exit(1);
  }

  // Check for .env file
  console.log('\n🔍 Checking environment configuration...');
  if (!fs.existsSync('.env')) {
    console.log('Creating .env file from template...');
    const envExample = `# Database Configuration
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Authentication
JWT_SECRET=despy-jwt-secret-key-change-this-in-production
ADMIN_EMAIL=admin@despy.io
ADMIN_PASSWORD=admin123

# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=90

# Email Configuration
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@despy.io

# Feature Flags
ENABLE_REFERRAL_SYSTEM=true
ENABLE_ANALYTICS_EXPORT=true
ENABLE_EMAIL_NOTIFICATIONS=true`;

    fs.writeFileSync('.env', envExample);
    console.log('✅ Created .env file. Please update it with your configuration.');
    console.log('⚠️ Update the environment variables before continuing!');
    process.exit(0);
  }

  // Initialize database
  console.log('\n🗄️ Initializing database...');
  try {
    await initDb();
    console.log('✅ Database tables created successfully');

    // Create admin user
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });

    const email = process.env.ADMIN_EMAIL || 'admin@despy.io';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Check if admin already exists
    const existingAdmin = await client.execute({
      sql: 'SELECT * FROM admins WHERE email = ?',
      args: [email]
    });

    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
    } else {
      await client.execute({
        sql: 'INSERT INTO admins (email, password_hash, role) VALUES (?, ?, ?)',
        args: [email, passwordHash, 'admin']
      });
      console.log('✅ Admin user created successfully');
      console.log('Email:', email);
      console.log('Password:', password);
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }

  console.log('\n✨ Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Update the .env file with your configuration');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Access the admin dashboard at: http://localhost:5173/admin');
}

setup(); 