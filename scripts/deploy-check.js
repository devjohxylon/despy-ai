import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Running deployment validation...\n');

let hasErrors = false;

// Check 1: Verify all dependencies are installed
console.log('1. Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    'bcryptjs', 'jsonwebtoken', 'cors', 'express', 'dotenv',
    '@libsql/client', 'react', 'react-dom', 'vite'
  ];
  
  const missingDeps = requiredDeps.filter(dep => 
    !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
  );
  
  if (missingDeps.length > 0) {
    console.log('❌ Missing dependencies:', missingDeps.join(', '));
    hasErrors = true;
  } else {
    console.log('✅ All required dependencies found');
  }
} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
  hasErrors = true;
}

// Check 2: Verify environment variables
console.log('\n2. Checking environment variables...');
const envFile = '.env';
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const requiredVars = ['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN', 'JWT_SECRET'];
  
  const missingVars = requiredVars.filter(varName => 
    !envContent.includes(`${varName}=`)
  );
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing environment variables in .env:', missingVars.join(', '));
    console.log('   Make sure to set these in Vercel dashboard');
  } else {
    console.log('✅ Environment variables configured');
  }
} else {
  console.log('⚠️  No .env file found - make sure to set environment variables in Vercel');
}

// Check 3: Verify API files exist
console.log('\n3. Checking API files...');
const apiFiles = [
  'api/waitlist.js',
  'api/stats.js', 
  'api/auth.js',
  'lib/db.js'
];

const missingFiles = apiFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length > 0) {
  console.log('❌ Missing API files:', missingFiles.join(', '));
  hasErrors = true;
} else {
  console.log('✅ All API files present');
}

// Check 4: Verify build works
console.log('\n4. Testing build process...');
try {
  execSync('npm run build', { stdio: 'pipe' });
  console.log('✅ Build successful');
} catch (error) {
  console.log('❌ Build failed:', error.message);
  hasErrors = true;
}

// Check 5: Verify Vercel configuration
console.log('\n5. Checking Vercel configuration...');
if (fs.existsSync('vercel.json')) {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  
  if (!vercelConfig.functions || !vercelConfig.functions['api/*.js']) {
    console.log('⚠️  Vercel functions configuration may be incomplete');
  } else {
    console.log('✅ Vercel configuration looks good');
  }
} else {
  console.log('⚠️  No vercel.json found - using default configuration');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Deployment validation failed!');
  console.log('Please fix the issues above before deploying.');
  process.exit(1);
} else {
  console.log('✅ Deployment validation passed!');
  console.log('Your project is ready for deployment.');
  console.log('\nNext steps:');
  console.log('1. Set environment variables in Vercel dashboard');
  console.log('2. Run: vercel --prod');
  console.log('3. Or push to GitHub if connected to Vercel');
} 