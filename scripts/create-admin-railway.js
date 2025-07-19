import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function createAdminRailway() {
  console.log('🔧 Creating admin user in Railway database...');
  
  try {
    // First, create the admins table if it doesn't exist
    await client.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Admins table created/verified');

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
      console.log('Email:', email);
      console.log('Password:', password);
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
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminRailway(); 