import puppeteer from 'puppeteer';
import fs from 'fs';

async function runDirectAPIVerification() {
  console.log('🔍 Running Direct API Verification...\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-ipc-flooding-protection',
      '--disable-web-security',
      '--allow-running-insecure-content'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  let results = {
    passed: 0,
    failed: 0,
    tests: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Test 1: Backend API Health
    console.log('✅ Test 1: Backend API Health Check');
    const healthResult = await testBackendAPI();
    results.tests.push(healthResult);
    if (healthResult.passed) results.passed++; else results.failed++;

    // Test 2: Products API
    console.log('✅ Test 2: Products API');
    const productsResult = await testProductsAPI();
    results.tests.push(productsResult);
    if (productsResult.passed) results.passed++; else results.failed++;

    // Test 3: Categories API
    console.log('✅ Test 3: Categories API');
    const categoriesResult = await testCategoriesAPI();
    results.tests.push(categoriesResult);
    if (categoriesResult.passed) results.passed++; else results.failed++;

    // Test 4: Brands API
    console.log('✅ Test 4: Brands API');
    const brandsResult = await testBrandsAPI();
    results.tests.push(brandsResult);
    if (brandsResult.passed) results.passed++; else results.failed++;

    // Test 5: Authentication API
    console.log('✅ Test 5: Authentication API');
    const authResult = await testAuthAPI();
    results.tests.push(authResult);
    if (authResult.passed) results.passed++; else results.failed++;

    // Test 6: Cart API
    console.log('✅ Test 6: Cart API');
    const cartResult = await testCartAPI();
    results.tests.push(cartResult);
    if (cartResult.passed) results.passed++; else results.failed++;

    // Test 7: Orders API
    console.log('✅ Test 7: Orders API');
    const ordersResult = await testOrdersAPI();
    results.tests.push(ordersResult);
    if (ordersResult.passed) results.passed++; else results.failed++;

    // Test 8: Frontend Basic Load
    console.log('✅ Test 8: Frontend Basic Load');
    const frontendResult = await testFrontendLoad(page);
    results.tests.push(frontendResult);
    if (frontendResult.passed) results.passed++; else results.failed++;

    console.log('\n📊 API Verification Results:');
    console.log('='.repeat(50));
    results.tests.forEach((test, index) => {
      const status = test.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${index + 1}. ${test.name}: ${status}`);
      test.details.forEach(detail => {
        console.log(`   - ${detail}`);
      });
      console.log('');
    });

    console.log('='.repeat(50));
    console.log(`📊 Overall: ${results.passed} passed, ${results.failed} failed`);

    // Save results
    fs.writeFileSync('test-results/api-verification-results.json', JSON.stringify(results, null, 2));

  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await browser.close();
  }
}

async function testBackendAPI() {
  const result = {
    name: 'Backend API Health Check',
    passed: false,
    details: []
  };

  try {
    const response = await fetch('http://localhost:3001/api/health');
    if (response.ok) {
      const data = await response.json();
      result.passed = true;
      result.details.push('✅ Backend API is healthy');
      result.details.push(`✅ Status: ${data.status}`);
      result.details.push(`✅ Message: ${data.message}`);
    } else {
      result.details.push(`❌ API returned status: ${response.status}`);
    }
  } catch (error) {
    result.details.push(`❌ Failed to connect to API: ${error.message}`);
  }

  return result;
}

async function testProductsAPI() {
  const result = {
    name: 'Products API',
    passed: false,
    details: []
  };

  try {
    const response = await fetch('http://localhost:3001/api/products');
    if (response.ok) {
      const data = await response.json();
      if (data.products && data.products.length > 0) {
        result.passed = true;
        result.details.push(`✅ Found ${data.products.length} products`);
        result.details.push(`✅ First product: ${data.products[0].name}`);
        result.details.push(`✅ Product has price: $${data.products[0].price}`);
      } else {
        result.details.push('❌ No products found in API response');
      }
    } else {
      result.details.push(`❌ Products API failed with status: ${response.status}`);
    }
  } catch (error) {
    result.details.push(`❌ Failed to fetch products: ${error.message}`);
  }

  return result;
}

async function testCategoriesAPI() {
  const result = {
    name: 'Categories API',
    passed: false,
    details: []
  };

  try {
    const response = await fetch('http://localhost:3001/api/categories');
    if (response.ok) {
      const data = await response.json();
      if (data.categories && data.categories.length > 0) {
        result.passed = true;
        result.details.push(`✅ Found ${data.categories.length} categories`);
        result.details.push(`✅ Categories: ${data.categories.map(c => c.name).join(', ')}`);
      } else {
        result.details.push('❌ No categories found');
      }
    } else {
      result.details.push(`❌ Categories API failed with status: ${response.status}`);
    }
  } catch (error) {
    result.details.push(`❌ Failed to fetch categories: ${error.message}`);
  }

  return result;
}

async function testBrandsAPI() {
  const result = {
    name: 'Brands API',
    passed: false,
    details: []
  };

  try {
    const response = await fetch('http://localhost:3001/api/brands');
    if (response.ok) {
      const data = await response.json();
      if (data.brands && data.brands.length > 0) {
        result.passed = true;
        result.details.push(`✅ Found ${data.brands.length} brands`);
        result.details.push(`✅ Brands: ${data.brands.map(b => b.name).join(', ')}`);
      } else {
        result.details.push('❌ No brands found');
      }
    } else {
      result.details.push(`❌ Brands API failed with status: ${response.status}`);
    }
  } catch (error) {
    result.details.push(`❌ Failed to fetch brands: ${error.message}`);
  }

  return result;
}

async function testAuthAPI() {
  const result = {
    name: 'Authentication API',
    passed: false,
    details: []
  };

  try {
    // Test login with test credentials
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'customer123'
      })
    });

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      if (data.token) {
        result.passed = true;
        result.details.push('✅ User login successful');
        result.details.push('✅ Authentication token received');
      } else {
        result.details.push('❌ Login successful but no token returned');
      }
    } else {
      result.details.push(`❌ Login failed with status: ${loginResponse.status}`);
      result.details.push('⚠️  This might be expected if user registration is not completed');
    }
  } catch (error) {
    result.details.push(`❌ Failed to test authentication: ${error.message}`);
  }

  return result;
}

async function testCartAPI() {
  const result = {
    name: 'Cart API',
    passed: false,
    details: []
  };

  try {
    // Try to get cart without authentication
    const response = await fetch('http://localhost:3001/api/cart');
    if (response.ok || response.status === 401) {
      result.passed = true;
      result.details.push('✅ Cart API is accessible');
      if (response.status === 401) {
        result.details.push('✅ Proper authentication required');
      }
    } else {
      result.details.push(`❌ Cart API failed with status: ${response.status}`);
    }
  } catch (error) {
    result.details.push(`❌ Failed to test cart API: ${error.message}`);
  }

  return result;
}

async function testOrdersAPI() {
  const result = {
    name: 'Orders API',
    passed: false,
    details: []
  };

  try {
    // Try to get orders without authentication
    const response = await fetch('http://localhost:3001/api/orders');
    if (response.ok || response.status === 401) {
      result.passed = true;
      result.details.push('✅ Orders API is accessible');
      if (response.status === 401) {
        result.details.push('✅ Proper authentication required');
      }
    } else {
      result.details.push(`❌ Orders API failed with status: ${response.status}`);
    }
  } catch (error) {
    result.details.push(`❌ Failed to test orders API: ${error.message}`);
  }

  return result;
}

async function testFrontendLoad(page) {
  const result = {
    name: 'Frontend Basic Load',
    passed: false,
    details: []
  };

  try {
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);

    const title = await page.title();
    if (title.includes('ShopFlow')) {
      result.passed = true;
      result.details.push(`✅ Frontend loaded: ${title}`);
    } else {
      result.details.push(`⚠️  Frontend loaded but title: ${title}`);
    }

    // Check for basic elements
    const bodyText = await page.evaluate(() => document.body.textContent);
    if (bodyText && bodyText.length > 100) {
      result.details.push('✅ Page contains content');
    } else {
      result.details.push('❌ Page appears to have minimal content');
    }

  } catch (error) {
    result.details.push(`❌ Failed to load frontend: ${error.message}`);
  }

  return result;
}

// Run the verification
runDirectAPIVerification().catch(console.error);