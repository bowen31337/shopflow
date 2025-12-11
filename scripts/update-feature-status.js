#!/usr/bin/env node

/**
 * Script to update feature_list.json to mark a test as passing
 */

const fs = require('fs');
const path = require('path');

const featureListPath = path.join(__dirname, '..', 'feature_list.json');

// Read the feature list
const featureList = JSON.parse(fs.readFileSync(featureListPath, 'utf8'));

// Find the test "Guest users must login to access wishlist"
const testIndex = featureList.findIndex(item =>
  item.description === "Guest users must login to access wishlist"
);

if (testIndex === -1) {
  console.error('Test not found: "Guest users must login to access wishlist"');
  process.exit(1);
}

// Update the test status
featureList[testIndex].passes = true;

// Write back to file
fs.writeFileSync(featureListPath, JSON.stringify(featureList, null, 2));

console.log('✅ Updated feature_list.json:');
console.log(`   Test: "${featureList[testIndex].description}"`);
console.log(`   Status: ${featureList[testIndex].passes ? 'PASSING' : 'FAILING'}`);
console.log('\nImplementation details:');
console.log('1. Backend API already requires authentication for wishlist endpoints (returns 401 for guests)');
console.log('2. Frontend now redirects guest users to login page when clicking "Add to Wishlist"');
console.log('3. Login page now supports return URL parameter to redirect back after login');
console.log('4. Updated files:');
console.log('   - client/src/components/ProductCard.jsx');
console.log('   - client/src/pages/ProductDetail.jsx');
console.log('   - client/src/pages/Login.jsx');