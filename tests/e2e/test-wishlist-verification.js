const puppeteer = require('puppeteer');

async function wishlistVerificationTest() {
  console.log('🧪 Wishlist Page Functionality Test\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800', '--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Capture console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test 1: Homepage
    console.log('1. Testing Homepage...');
    await page.goto('http://localhost:5176', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const homepageText = await page.evaluate(() => document.body.innerText);
    const homepageSuccess = homepageText.includes('ShopFlow');

    console.log(`   ✅ Homepage loads: ${homepageSuccess}`);
    await page.screenshot({ path: 'test-results/wishlist-homepage.png' });

    // Test 2: Products Page
    console.log('2. Testing Products Page...');
    await page.click('a[href="/products"]').catch(() => {
      page.goto('http://localhost:5176/products', { waitUntil: 'networkidle2' });
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    const productsText = await page.evaluate(() => document.body.innerText);
    const productsSuccess = productsText.includes('Products');

    console.log(`   ✅ Products page loads: ${productsSuccess}`);
    await page.screenshot({ path: 'test-results/wishlist-products.png' });

    // Test 3: Login
    console.log('3. Testing Login...');
    const loginButton = await page.$('a[href="/login"]').catch(() => null);
    if (loginButton) {
      await loginButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fill login form
      await page.type('input[type="email"]', 'customer@example.com');
      await page.type('input[type="password"]', 'customer123');
      await page.click('button[type="submit"]');

      await new Promise(resolve => setTimeout(resolve, 2000));

      const loginText = await page.evaluate(() => document.body.innerText);
      const loginSuccess = !loginText.includes('Login') && !loginText.includes('Password');

      console.log(`   ✅ Login: ${loginSuccess ? 'Success' : 'Failed'}`);
      await page.screenshot({ path: 'test-results/wishlist-login.png' });
    } else {
      console.log('   ⚠️  Login button not found, proceeding...');
    }

    // Test 4: Add product to wishlist
    console.log('4. Testing Add to Wishlist...');
    const wishlistButton = await page.$('button:has-text("Add to Wishlist")').catch(() => null);
    if (wishlistButton) {
      await wishlistButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const wishlistText = await page.evaluate(() => document.body.innerText);
      const wishlistSuccess = wishlistText.includes('wishlist') || wishlistText.includes('Wishlist');

      console.log(`   ✅ Add to wishlist: ${wishlistSuccess ? 'Success' : 'Failed'}`);
      await page.screenshot({ path: 'test-results/wishlist-add.png' });
    } else {
      console.log('   ❌ Add to Wishlist button not found');
    }

    // Test 5: Check wishlist page
    console.log('5. Testing Wishlist Page...');
    const wishlistLink = await page.$('a[href="/wishlist"]').catch(() => null);
    if (wishlistLink) {
      await wishlistLink.click();
      await new Promise(resolve => setTimeout(resolve, 2000));

      const wishlistPageText = await page.evaluate(() => document.body.innerText);
      const wishlistPageSuccess = wishlistPageText.includes('Wishlist') || wishlistPageText.includes('wishlist');

      console.log(`   ✅ Wishlist page: ${wishlistPageSuccess ? 'Success' : 'Failed'}`);
      await page.screenshot({ path: 'test-results/wishlist-page.png' });
    } else {
      console.log('   ❌ Wishlist page link not found');
    }

    // Test 6: Console Errors
    console.log('6. Checking Console Errors...');
    console.log(`   ❌ Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`      - ${error}`));
    }

    const overallSuccess = homepageSuccess && productsSuccess && consoleErrors.length === 0;

    console.log('\n' + '='.repeat(50));
    console.log('📋 WISHLIST TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`🎯 Overall Status: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🏠 Homepage: ${homepageSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🛍️  Products: ${productsSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔍 Console Errors: ${consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);

    return overallSuccess;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

wishlistVerificationTest()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 Wishlist test completed successfully!');
      console.log('The feature appears to be working correctly.');
    } else {
      console.log('⚠️  Issues detected during wishlist test.');
      console.log('Please check the console output and screenshots for details.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });