#!/usr/bin/env node

/**
 * Test script for Admin Analytics functionality
 */

const https = require('https');
const http = require('http');

// Configuration
const API_URL = 'http://localhost:3001';

// Test results
let testsPassed = 0;
let testsFailed = 0;
let testResults = [];

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

async function runTest(testName, testFunction) {
  log(`\n🧪 Running: ${testName}`, 'info');
  try {
    await testFunction();
    testsPassed++;
    log(`✅ PASSED: ${testName}`, 'success');
    testResults.push({ name: testName, status: 'PASSED' });
  } catch (error) {
    testsFailed++;
    log(`❌ FAILED: ${testName} - ${error.message}`, 'error');
    testResults.push({ name: testName, status: 'FAILED', error: error.message });
  }
}

async function testAdminLogin() {
  const response = await makeRequest(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@shopflow.com',
      password: 'admin123'
    })
  });

  if (response.statusCode !== 200) {
    throw new Error(`Admin login failed with status ${response.statusCode}`);
  }

  const data = JSON.parse(response.data);
  if (!data.accessToken || !data.user) {
    throw new Error('Admin login should return accessToken and user data');
  }

  log('Admin login successful', 'success');
  return data.accessToken;
}

async function testAnalyticsAPI() {
  // First login
  const response = await makeRequest(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@shopflow.com',
      password: 'admin123'
    })
  });

  const loginData = JSON.parse(response.data);
  const token = loginData.accessToken;

  // Test analytics API with week period
  const analyticsResponse = await makeRequest(`${API_URL}/api/admin/analytics?period=week`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (analyticsResponse.statusCode !== 200) {
    throw new Error(`Analytics API failed with status ${analyticsResponse.statusCode}`);
  }

  const analyticsData = JSON.parse(analyticsResponse.data);
  if (!analyticsData.period || analyticsData.period !== 'week') {
    throw new Error('Analytics API should return correct period');
  }

  if (!analyticsData.totals || typeof analyticsData.totals.totalRevenue !== 'number') {
    throw new Error('Analytics API should return totals object');
  }

  log('Analytics API works correctly', 'success');
}

async function testAnalyticsWithDifferentPeriods() {
  // Login
  const response = await makeRequest(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'admin@shopflow.com',
      password: 'admin123'
    })
  });

  const loginData = JSON.parse(response.data);
  const token = loginData.accessToken;

  const periods = ['day', 'week', 'month', 'year'];

  for (const period of periods) {
    const analyticsResponse = await makeRequest(`${API_URL}/api/admin/analytics?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (analyticsResponse.statusCode !== 200) {
      throw new Error(`Analytics API failed for period ${period} with status ${analyticsResponse.statusCode}`);
    }

    const analyticsData = JSON.parse(analyticsResponse.data);
    if (analyticsData.period !== period) {
      throw new Error(`Analytics API should return correct period ${period}`);
    }
  }

  log('Analytics API works with all periods', 'success');
}

async function runAllTests() {
  log('🚀 Starting Admin Analytics Verification Tests', 'info');
  log('================================================================', 'info');

  await runTest('Admin Login', testAdminLogin);
  await runTest('Analytics API Endpoint', testAnalyticsAPI);
  await runTest('Analytics API with Different Periods', testAnalyticsWithDifferentPeriods);

  log('\n================================================================', 'info');
  log('📊 Test Results Summary', 'info');
  log('================================================================', 'info');
  log(`✅ Tests Passed: ${testsPassed}`, 'success');
  log(`❌ Tests Failed: ${testsFailed}`, 'error');
  log(`📈 Total Tests: ${testsPassed + testsFailed}`, 'info');

  if (testsFailed === 0) {
    log('\n🎉 All analytics tests passed! The analytics functionality is ready.', 'success');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'warning');
  }

  return testsFailed === 0;
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