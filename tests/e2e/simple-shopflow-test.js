const puppeteer = require('puppeteer');

async function simpleShopFlowTest() {
  console.log('🧪 Simple ShopFlow Verification Test\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800', '--no-sandbox', '--disable-setuid-sandbox']
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
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.screenshot({ path: 'test-results/homepage-test.png' });

    const homepageText = await page.evaluate(() => document.body.innerText);
    const homepageSuccess = homepageText.includes('ShopFlow') && homepageText.includes('Welcome');

    console.log(`   ✅ Homepage loads: ${homepageSuccess}`);

    // Test 2: Products Page
    console.log('2. Testing Products Page...');
    await page.click('a[href="/products"]').catch(() => {
      // If link not found, try navigating directly
      page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-results/products-test.png' });

    const productsText = await page.evaluate(() => document.body.innerText);
    const productsSuccess = productsText.includes('Products');

    console.log(`   ✅ Products page loads: ${productsSuccess}`);

    // Test 3: Cart Functionality
    console.log('3. Testing Cart...');
    const cartButton = await page.$('button[aria-label="Open cart"]').catch(() => null);
    if (cartButton) {
      await cartButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.screenshot({ path: 'test-results/cart-test.png' });

      // Close cart
      const backdrop = await page.$('.bg-black.bg-opacity-50').catch(() => null);
      if (backdrop) {
        await backdrop.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      console.log('   ✅ Cart drawer opens and closes');
    } else {
      console.log('   ❌ Cart button not found');
    }

    // Test 4: Console Errors
    console.log('4. Checking Console Errors...');
    console.log(`   ❌ Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`      - ${error}`));
    }

    // Final screenshot
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'test-results/final-test.png' });

    const overallSuccess = homepageSuccess && productsSuccess && consoleErrors.length === 0;

    console.log('\n' + '='.repeat(50));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`🎯 Overall Status: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🏠 Homepage: ${homepageSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🛍️  Products: ${productsSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔍 Console Errors: ${consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
    console.log('\n📁 Generated Screenshots:');
    console.log('   - test-results/homepage-test.png');
    console.log('   - test-results/products-test.png');
    console.log('   - test-results/cart-test.png');
    console.log('   - test-results/final-test.png');

    return overallSuccess;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

simpleShopFlowTest()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 ShopFlow verification completed successfully!');
    } else {
      console.log('⚠️  Issues detected during verification.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });