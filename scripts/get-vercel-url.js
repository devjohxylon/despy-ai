import { execSync } from 'child_process';

async function getVercelUrl() {
  console.log('🔍 Finding your Vercel deployment URL...\n');
  
  try {
    // Try to get the URL from Vercel CLI
    const result = execSync('npx vercel ls', { encoding: 'utf8' });
    console.log('Vercel Projects:');
    console.log(result);
  } catch (error) {
    console.log('❌ Could not get Vercel projects list');
    console.log('This might be because:');
    console.log('1. You\'re not logged into Vercel CLI');
    console.log('2. The project is not linked to Vercel CLI');
    console.log('');
    console.log('💡 Alternative ways to find your URL:');
    console.log('1. Check your Vercel dashboard: https://vercel.com/dashboard');
    console.log('2. Look for deployment URLs in your GitHub repository');
    console.log('3. Check your domain settings if you have a custom domain');
  }
  
  console.log('\n📋 Common Vercel URL patterns:');
  console.log('- https://[project-name].vercel.app');
  console.log('- https://[project-name]-[username].vercel.app');
  console.log('- https://[custom-domain] (if configured)');
  
  console.log('\n🔗 Quick Links:');
  console.log('- Vercel Dashboard: https://vercel.com/dashboard');
  console.log('- GitHub Repository: https://github.com/devjohxylon/despy-ai');
}

getVercelUrl().catch(console.error); 