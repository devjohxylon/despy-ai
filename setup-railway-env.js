#!/usr/bin/env node

import { execSync } from 'child_process';
import crypto from 'crypto';

console.log('🚀 Setting up Railway environment variables...\n');

// Generate a secure JWT secret if not provided
const jwtSecret = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// List of required environment variables
const envVars = {
  JWT_SECRET: jwtSecret,
  TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
  TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN || '',
  NODE_ENV: process.env.NODE_ENV || 'production'
};

console.log('📋 Required Environment Variables:');
console.log('=====================================');

let missingVars = [];

for (const [key, value] of Object.entries(envVars)) {
  if (value) {
    console.log(`✅ ${key}: ${key === 'JWT_SECRET' ? '[SET]' : value.substring(0, 20) + '...'}`);
  } else {
    console.log(`❌ ${key}: [MISSING]`);
    missingVars.push(key);
  }
}

console.log('\n🔧 Setting up Railway environment variables...\n');

try {
  // Set JWT_SECRET
  console.log('Setting JWT_SECRET...');
  execSync(`npx @railway/cli variables set JWT_SECRET="${jwtSecret}"`, { stdio: 'inherit' });
  
  // Set other variables if they exist
  if (envVars.TURSO_DATABASE_URL) {
    console.log('Setting TURSO_DATABASE_URL...');
    execSync(`npx @railway/cli variables set TURSO_DATABASE_URL="${envVars.TURSO_DATABASE_URL}"`, { stdio: 'inherit' });
  }
  
  if (envVars.TURSO_AUTH_TOKEN) {
    console.log('Setting TURSO_AUTH_TOKEN...');
    execSync(`npx @railway/cli variables set TURSO_AUTH_TOKEN="${envVars.TURSO_AUTH_TOKEN}"`, { stdio: 'inherit' });
  }
  
  if (envVars.RESEND_API_KEY) {
    console.log('Setting RESEND_API_KEY...');
    execSync(`npx @railway/cli variables set RESEND_API_KEY="${envVars.RESEND_API_KEY}"`, { stdio: 'inherit' });
  }
  
  if (envVars.SENTRY_DSN) {
    console.log('Setting SENTRY_DSN...');
    execSync(`npx @railway/cli variables set SENTRY_DSN="${envVars.SENTRY_DSN}"`, { stdio: 'inherit' });
  }
  
  console.log('\n✅ Environment variables set successfully!');
  console.log('\n🚀 Deploying to Railway...');
  execSync('npx @railway/cli up', { stdio: 'inherit' });
  
} catch (error) {
  console.error('\n❌ Error setting environment variables:', error.message);
  console.log('\n📝 Manual Setup Instructions:');
  console.log('1. Go to https://railway.app/dashboard');
  console.log('2. Select your DeSpy AI project');
  console.log('3. Go to Variables tab');
  console.log('4. Add the following variables:');
  console.log(`   - JWT_SECRET: ${jwtSecret}`);
  if (missingVars.length > 0) {
    console.log(`   - ${missingVars.join(', ')}: [You need to set these]`);
  }
  console.log('\n5. Redeploy your service');
} 