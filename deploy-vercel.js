#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🚀 Deploying DeSpy AI Frontend to Vercel...\n');

// Check if Vercel CLI is available
try {
  execSync('npx vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI is available');
} catch (error) {
  console.log('❌ Vercel CLI not found. Installing...');
  try {
    execSync('npm install vercel --save-dev', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Vercel CLI. Please install manually:');
    console.error('npm install vercel --save-dev');
    process.exit(1);
  }
}

// Check if user is logged in
try {
  execSync('npx vercel whoami', { stdio: 'pipe' });
  console.log('✅ Logged into Vercel');
} catch (error) {
  console.log('❌ Not logged into Vercel. Please login:');
  console.log('npx vercel login');
  process.exit(1);
}

// Build the project
console.log('\n📦 Building project...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Deploy to Vercel
console.log('\n🚀 Deploying to Vercel...');
try {
  execSync('npx vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment completed!');
  
  console.log('\n🌐 Your app is live at: https://despy.io');
  console.log('\n📝 Next steps:');
  console.log('1. Test the waitlist functionality');
  console.log('2. Verify the API connection to your Railway backend');
  console.log('3. Check that the frontend is communicating with Railway API');
} catch (error) {
  console.error('❌ Deployment failed');
  process.exit(1);
} 