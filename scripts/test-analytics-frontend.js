#!/usr/bin/env node

/**
 * Simple verification test for Admin Analytics frontend
 */

const https = require('https');
const http = require('http');

// Configuration
const FRONTEND_URL = 'http://localhost:3002';

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[0m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m'
  };
  console.log(`${colors[type]}${message}\x1b[0m`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testFrontendAnalyticsRoute() {
  try {
    const response = await makeRequest(`${FRONTEND_URL}/admin/analytics`);
    if (response.statusCode === 200) {
      log('✅ Analytics route is accessible', 'success');
      return true;
    } else {
      log(`⚠️  Analytics route returned status ${response.statusCode}`, 'warning');
      return false;
    }
  } catch (error) {
    log(`❌ Analytics route not accessible: ${error.message}`, 'error');
    return false;
  }
}

async function testAnalyticsPageContent() {
  try {
    const response = await makeRequest(`${FRONTEND_URL}/admin/analytics`);
    const data = response.data;

    // Check for key elements in the analytics page
    const checks = [
      { name: 'Sales Analytics title', pattern: /Sales Analytics/i },
      { name: 'Period selector', pattern: /Last 7 Days|Last 30 Days|Last 365 Days/i },
      { name: 'Total Revenue', pattern: /Total Revenue/i },
      { name: 'Total Orders', pattern: /Total Orders/i },
      { name: 'Average Order Value', pattern: /Average Order Value/i },
      { name: 'Revenue by Day', pattern: /Revenue by Day/i },
      { name: 'Sales by Category', pattern: /Sales by Category/i },
      { name: 'Top Selling Products', pattern: /Top Selling Products/i }
    ];

    let passedChecks = 0;
    for (const check of checks) {
      if (check.pattern.test(data)) {
        log(`✅ ${check.name} found`, 'success');
        passedChecks++;
      } else {
        log(`❌ ${check.name} not found`, 'error');
      }
    }

    log(`\n📊 Analytics page content check: ${passedChecks}/${checks.length} elements found`, 'info');
    return passedChecks >= 5; // At least 5 elements should be found
  } catch (error) {
    log(`❌ Failed to check analytics page content: ${error.message}`, 'error');
    return false;
  }
}

async function runAllTests() {
  log('🚀 Starting Admin Analytics Frontend Verification', 'info');
  log('================================================================', 'info');

  const test1 = await testFrontendAnalyticsRoute();
  const test2 = await testAnalyticsPageContent();

  log('\n================================================================', 'info');
  log('📊 Frontend Test Results Summary', 'info');
  log('================================================================', 'info');

  if (test1 && test2) {
    log('🎉 All frontend tests passed! Analytics page is ready.', 'success');
    return true;
  } else {
    log('⚠️  Some frontend tests failed. Check the results above.', 'warning');
    return false;
  }
}

// Run the tests
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log(`\n💥 Unexpected error: ${error.message}`, 'error');
      process.exit(1);
    });
}

module.exports = { runAllTests };