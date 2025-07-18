#!/usr/bin/env node

console.log('🔍 Environment Variables Debug:');
console.log('================================');

// Check all environment variables
const envVars = [
  'TURSO_DATABASE_URL',
  'TURSO_AUTH_TOKEN', 
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'NODE_ENV',
  'PORT'
];

envVars.forEach(varName => {
  const value = process.env[varName];
  const hasValue = !!value;
  const displayValue = hasValue ? `${value.substring(0, 10)}...` : 'NOT SET';
  console.log(`${varName}: ${hasValue ? '✅' : '❌'} ${displayValue}`);
});

console.log('\n📧 SMTP Configuration Check:');
console.log('SMTP_HOST:', !!process.env.SMTP_HOST);
console.log('SMTP_USER:', !!process.env.SMTP_USER);
console.log('SMTP_PASS:', !!process.env.SMTP_PASS);

console.log('\n🔧 Database Configuration Check:');
console.log('TURSO_DATABASE_URL:', !!process.env.TURSO_DATABASE_URL);
console.log('TURSO_AUTH_TOKEN:', !!process.env.TURSO_AUTH_TOKEN); 