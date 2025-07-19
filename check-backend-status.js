#!/usr/bin/env node

/**
 * Check Backend Status
 * This script checks if the backend endpoints are working
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://despy-ai-production.up.railway.app';

async function checkEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    console.log(`${method} ${endpoint}: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.text();
      console.log(`  Response: ${data.substring(0, 100)}...`);
    }
    
    return response.ok;
  } catch (error) {
    console.log(`${method} ${endpoint}: ERROR - ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking DeSpy AI Backend Status...\n');
  
  // Check health endpoint
  await checkEndpoint('/api/health');
  
  // Check payment endpoint (should return 401 without auth)
  await checkEndpoint('/api/payment/create-intent', 'POST', {
    amount: 100,
    description: 'test'
  });
  
  // Check if Stripe is available
  await checkEndpoint('/api/stats');
  
  console.log('\n📋 Summary:');
  console.log('• If /api/health works: Backend is running');
  console.log('• If /api/payment/create-intent returns 401: Endpoint exists but needs auth');
  console.log('• If /api/payment/create-intent returns 404: Endpoint not deployed yet');
  
  console.log('\n🔗 Railway Dashboard: https://railway.app/dashboard');
  console.log('🔗 Backend URL: https://despy-ai-production.up.railway.app');
}

main().catch(console.error); 