import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

async function deploy() {
  console.log('🚀 Deploying DeSpy AI to Vercel...\n');
  
  // Check if environment variables are set
  const requiredVars = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'];
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n💡 Please set these in your .env file or Vercel dashboard');
    console.log('📋 See VERCEL_SETUP.md for detailed instructions');
    return;
  }
  
  console.log('✅ Environment variables are set locally');
  
  try {
    // Check if Vercel CLI is available
    console.log('\n🔍 Checking Vercel CLI...');
    execSync('npx vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is available');
    
    // Check if logged in
    try {
      execSync('npx vercel whoami', { stdio: 'pipe' });
      console.log('✅ Logged into Vercel');
    } catch (error) {
      console.log('❌ Not logged into Vercel');
      console.log('💡 Please run: npx vercel login');
      return;
    }
    
    // Deploy to production
    console.log('\n🚀 Deploying to production...');
    execSync('npx vercel --prod', { stdio: 'inherit' });
    
    console.log('\n🎉 Deployment complete!');
    console.log('📋 Next steps:');
    console.log('1. Test your API endpoints');
    console.log('2. Check Vercel function logs for any errors');
    console.log('3. Verify environment variables are set in Vercel dashboard');
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.log('\n💡 Alternative deployment methods:');
    console.log('1. Use Vercel dashboard: https://vercel.com/dashboard');
    console.log('2. Connect GitHub repo for automatic deployments');
    console.log('3. Run: npx vercel login (if not logged in)');
  }
}

deploy().catch(console.error); 