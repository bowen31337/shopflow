#!/usr/bin/env node

// Simple test script to verify the application is working
const http = require('http');

function testEndpoint(url, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: url.includes('localhost:3001') ? 'localhost' : 'localhost',
      port: url.includes('localhost:3001') ? 3001 : 5173,
      path: url.split('/').slice(3).join('/'),
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✓ ${description}: ${res.statusCode} ${res.statusMessage}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`✗ ${description}: ${error.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log(`✗ ${description}: Timeout`);
      resolve(false);
    });

    req.end();
  });
}

async function runTests() {
  console.log('=== ShopFlow Application Verification ===\n');

  const tests = [
    { url: 'http://localhost:3001/api/health', description: 'Backend health endpoint' },
    { url: 'http://localhost:3001/api/products', description: 'Backend products API' },
    { url: 'http://localhost:3001/api/categories', description: 'Backend categories API' },
    { url: 'http://localhost:5173/', description: 'Frontend homepage' },
    { url: 'http://localhost:5173/products', description: 'Frontend products page' }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const result = await testEndpoint(test.url, test.description);
    if (result) passed++;
  }

  console.log(`\n=== Results: ${passed}/${total} tests passed ===`);

  if (passed === total) {
    console.log('🎉 All core services are working correctly!');
    process.exit(0);
  } else {
    console.log('❌ Some services are not responding correctly.');
    process.exit(1);
  }
}

runTests().catch(console.error);