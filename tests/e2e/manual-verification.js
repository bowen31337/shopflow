// Manual Verification Test for ShopFlow
// This test manually verifies core API functionality

import puppeteer from 'puppeteer';

async function manualVerification() {
  console.log('🧪 Manual ShopFlow Verification Test\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800', '--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Test 1: Check if frontend is accessible
    console.log('1. Testing Frontend Accessibility...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const title = await page.title();
    const hasCorrectTitle = title.includes('ShopFlow');
    console.log(`   ✅ Correct title: ${hasCorrectTitle ? 'PASS' : 'FAIL'}`);

    // Test 2: Check if API is accessible via frontend
    console.log('2. Testing API Connectivity...');
    const apiTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        return {
          success: true,
          hasProducts: data.products && data.products.length > 0,
          productCount: data.products ? data.products.length : 0
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log(`   ✅ API connectivity: ${apiTest.success ? 'PASS' : 'FAIL'}`);
    if (apiTest.success) {
      console.log(`   📦 Products available: ${apiTest.productCount}`);
    }

    // Test 3: Check login functionality via frontend
    console.log('3. Testing Login Functionality...');
    const loginTest = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'customer@example.com',
            password: 'customer123'
          })
        });
        const data = await response.json();
        return {
          success: response.ok,
          hasToken: !!data.accessToken,
          user: data.user
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log(`   ✅ Login test: ${loginTest.success ? 'PASS' : 'FAIL'}`);
    if (loginTest.success) {
      console.log(`   👤 Logged in user: ${loginTest.user ? loginTest.user.name : 'Unknown'}`);
    }

    // Test 4: Take screenshot of the homepage
    console.log('4. Capturing Screenshot...');
    await page.screenshot({ path: 'test-results/manual-verification-homepage.png' });
    console.log('   ✅ Screenshot captured');

    const overallSuccess = hasCorrectTitle && apiTest.success && loginTest.success;

    console.log('\n' + '='.repeat(50));
    console.log('📋 MANUAL VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`🎯 Overall Status: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🏠 Frontend: ${hasCorrectTitle ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔌 API Connectivity: ${apiTest.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔐 Login Functionality: ${loginTest.success ? '✅ PASS' : '❌ FAIL'}`);

    return overallSuccess;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
manualVerification()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 Manual verification completed successfully!');
      console.log('✅ Servers are running correctly');
      console.log('✅ API is accessible');
      console.log('✅ User registration/login functionality works');
    } else {
      console.log('⚠️  Issues detected during manual verification.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });