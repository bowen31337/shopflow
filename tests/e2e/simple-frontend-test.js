#!/usr/bin/env node

// Simple test to verify frontend-backend integration
const http = require('http');

async function testFrontendBackend() {
  console.log('=== Frontend-Backend Integration Test ===\n');

  // Test 1: Frontend loads
  try {
    const frontendResponse = await fetch('http://localhost:5173/');
    console.log(`✓ Frontend homepage: ${frontendResponse.status}`);
  } catch (error) {
    console.log(`✗ Frontend homepage: ${error.message}`);
    return false;
  }

  // Test 2: API works through proxy
  try {
    const apiResponse = await fetch('http://localhost:5173/api/products');
    const apiData = await apiResponse.json();
    console.log(`✓ Products API through proxy: ${apiResponse.status} (${apiData.products?.length || 0} products)`);
  } catch (error) {
    console.log(`✗ Products API through proxy: ${error.message}`);
    return false;
  }

  // Test 3: Backend directly
  try {
    const backendResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await backendResponse.json();
    console.log(`✓ Backend health: ${backendResponse.status} (${healthData.message})`);
  } catch (error) {
    console.log(`✗ Backend health: ${error.message}`);
    return false;
  }

  console.log('\n🎉 All core functionality is working!');
  return true;
}

testFrontendBackend().catch(console.error);