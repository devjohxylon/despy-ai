#!/usr/bin/env node

/**
 * Deploy Backend Script
 * This script helps ensure the backend is properly deployed with Stripe integration
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Deploying DeSpy AI Backend with Stripe Integration...\n');

// Check if we're in the right directory
const serverDir = path.join(process.cwd(), 'server');
if (!fs.existsSync(serverDir)) {
  console.error('❌ Server directory not found. Please run this from the project root.');
  process.exit(1);
}

try {
  // Install dependencies
  console.log('📦 Installing server dependencies...');
  execSync('npm install', { cwd: serverDir, stdio: 'inherit' });
  
  // Check if Stripe is installed
  const packageJson = JSON.parse(fs.readFileSync(path.join(serverDir, 'package.json'), 'utf8'));
  if (!packageJson.dependencies.stripe) {
    console.log('📦 Installing Stripe dependency...');
    execSync('npm install stripe@^14.0.0', { cwd: serverDir, stdio: 'inherit' });
  }
  
  console.log('\n✅ Backend dependencies installed successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Railway should auto-deploy the backend');
  console.log('2. Add Stripe environment variables to Railway:');
  console.log('   - STRIPE_SECRET_KEY=sk_test_your_key');
  console.log('   - VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key');
  console.log('3. Test the payment endpoints');
  
  console.log('\n🔗 Railway Dashboard: https://railway.app/dashboard');
  console.log('🔗 Stripe Dashboard: https://dashboard.stripe.com/test/apikeys');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
} 