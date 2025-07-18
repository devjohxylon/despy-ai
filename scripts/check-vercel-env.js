import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkVercelEnvironment() {
  console.log('🔍 Checking Vercel Environment Variables...\n');
  
  const requiredVars = [
    'TURSO_DATABASE_URL',
    'TURSO_AUTH_TOKEN',
    'SENTRY_DSN'
  ];
  
  console.log('Required Environment Variables:');
  console.log('================================');
  
  let allSet = true;
  
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: Set`);
      // Show first few characters for security
      if (varName.includes('TOKEN') || varName.includes('DSN')) {
        console.log(`   Value: ${value.substring(0, 10)}...`);
      } else {
        console.log(`   Value: ${value}`);
      }
    } else {
      console.log(`❌ ${varName}: Missing`);
      allSet = false;
    }
  }
  
  console.log('\n📋 Vercel Deployment Instructions:');
  console.log('==================================');
  
  if (!allSet) {
    console.log('❌ Some environment variables are missing!');
    console.log('\nTo set them in Vercel:');
    console.log('1. Go to your Vercel dashboard');
    console.log('2. Select your project (despy-ai)');
    console.log('3. Go to Settings > Environment Variables');
    console.log('4. Add the missing variables:');
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        console.log(`   - ${varName}: [Your value here]`);
      }
    }
    
    console.log('\n5. Redeploy your project');
  } else {
    console.log('✅ All environment variables are set locally!');
    console.log('\nTo deploy to Vercel:');
    console.log('1. Make sure these same variables are set in Vercel dashboard');
    console.log('2. Deploy using: npx vercel --prod');
    console.log('3. Or connect your GitHub repo for automatic deployments');
  }
  
  console.log('\n🔗 Useful Links:');
  console.log('- Vercel Dashboard: https://vercel.com/dashboard');
  console.log('- Turso Dashboard: https://dashboard.turso.tech/');
  console.log('- Sentry Dashboard: https://sentry.io/');
}

checkVercelEnvironment().catch(console.error); 