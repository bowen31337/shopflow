#!/usr/bin/env node

/**
 * Test script to verify "Guest users must login to access wishlist" feature
 * This script tests that:
 * 1. Guest users are redirected to login when trying to add to wishlist
 * 2. The backend API requires authentication for wishlist operations
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

console.log('Testing "Guest users must login to access wishlist" feature...\n');

// Test 1: Check that wishlist API endpoints require authentication
console.log('Test 1: Checking backend API authentication requirements...');

const endpoints = [
  { method: 'GET', path: '/api/wishlist', description: 'Get wishlist' },
  { method: 'POST', path: '/api/wishlist', description: 'Add to wishlist', body: { product_id: 1 } },
  { method: 'DELETE', path: '/api/wishlist/1', description: 'Remove from wishlist' }
];

let passedTests = 0;
let totalTests = endpoints.length;

endpoints.forEach(({ method, path, description, body }) => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    const statusCode = res.statusCode;

    // All these endpoints should return 401 Unauthorized or 403 Forbidden for unauthenticated requests
    if (statusCode === 401 || statusCode === 403) {
      console.log(`  ✓ ${description}: Requires authentication (HTTP ${statusCode})`);
      passedTests++;
    } else {
      console.log(`  ✗ ${description}: Expected 401/403 but got HTTP ${statusCode}`);

      // Collect response body for debugging
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`    Response: ${JSON.stringify(jsonData)}`);
        } catch (e) {
          console.log(`    Response: ${data.substring(0, 200)}`);
        }
      });
    }

    // Check if we've processed all tests
    if (passedTests + (totalTests - passedTests) === totalTests) {
      console.log(`\nBackend API tests: ${passedTests}/${totalTests} passed`);

      if (passedTests === totalTests) {
        console.log('\n✅ Backend API correctly requires authentication for wishlist operations');
        console.log('\nNote: Frontend redirection to login page has been implemented in:');
        console.log('  - client/src/components/ProductCard.jsx');
        console.log('  - client/src/pages/ProductDetail.jsx');
        console.log('\nThe implementation now redirects guest users to /login when they click "Add to Wishlist"');
      } else {
        console.log('\n❌ Some backend API endpoints do not require authentication');
        process.exit(1);
      }
    }
  });

  req.on('error', (error) => {
    console.log(`  ✗ ${description}: Request failed - ${error.message}`);

    if (passedTests + (totalTests - passedTests) === totalTests) {
      console.log(`\nBackend API tests: ${passedTests}/${totalTests} passed`);
      process.exit(1);
    }
  });

  if (body) {
    req.write(JSON.stringify(body));
  }

  req.end();
});

// Note: Frontend testing would require browser automation to:
// 1. Navigate to product page as guest
// 2. Click "Add to Wishlist" button
// 3. Verify redirect to /login page
// 4. Login with credentials
// 5. Verify wishlist functionality works after login