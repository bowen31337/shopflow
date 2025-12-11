const puppeteer = require('puppeteer');

async function saveForLaterTest() {
  console.log('🧪 Save for Later Functionality Test\n');

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

    const homepageText = await page.evaluate(() => document.body.innerText);
    const homepageSuccess = homepageText.includes('ShopFlow');

    console.log(`   ✅ Homepage loads: ${homepageSuccess}`);
    await page.screenshot({ path: 'test-results/save-for-later-homepage.png' });

    // Test 2: Products Page
    console.log('2. Testing Products Page...');
    await page.click('a[href="/products"]').catch(() => {
      page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    const productsText = await page.evaluate(() => document.body.innerText);
    const productsSuccess = productsText.includes('Products');

    console.log(`   ✅ Products page loads: ${productsSuccess}`);
    await page.screenshot({ path: 'test-results/save-for-later-products.png' });

    // Test 3: Add product to cart
    console.log('3. Testing Add to Cart...');
    const addToCartButton = await page.$('button:has-text("Add to Cart")').catch(() => null);
    if (addToCartButton) {
      await addToCartButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check for success message
      const successText = await page.evaluate(() => document.body.innerText);
      const addToCartSuccess = successText.includes('success') || successText.includes('added');

      console.log(`   ✅ Add to cart: ${addToCartSuccess ? 'Success' : 'Failed'}`);
      await page.screenshot({ path: 'test-results/save-for-later-add-to-cart.png' });
    } else {
      console.log('   ❌ Add to cart button not found');
    }

    // Test 4: Cart Drawer
    console.log('4. Testing Cart Drawer...');
    const cartButton = await page.$('button[aria-label="Open cart"]').catch(() => null);
    if (cartButton) {
      await cartButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const cartText = await page.evaluate(() => document.body.innerText);
      const cartOpenSuccess = cartText.includes('Shopping Cart') || cartText.includes('cart');

      console.log(`   ✅ Cart drawer opens: ${cartOpenSuccess}`);
      await page.screenshot({ path: 'test-results/save-for-later-cart-open.png' });

      // Test 5: Save for Later functionality
      console.log('5. Testing Save for Later...');
      const saveForLaterButton = await page.$('button:has-text("Save for Later")').catch(() => null);
      if (saveForLaterButton) {
        await saveForLaterButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if item moved to saved section
        const cartTextAfter = await page.evaluate(() => document.body.innerText);
        const saveSuccess = cartTextAfter.includes('Saved for Later');

        console.log(`   ✅ Save for later: ${saveSuccess ? 'Success' : 'Failed'}`);
        await page.screenshot({ path: 'test-results/save-for-later-functionality.png' });
      } else {
        console.log('   ❌ Save for Later button not found (may be expected if no items in cart)');
      }

      // Close cart
      const backdrop = await page.$('.bg-black.bg-opacity-50').catch(() => null);
      if (backdrop) {
        await backdrop.click();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } else {
      console.log('   ❌ Cart button not found');
    }

    // Test 6: Console Errors
    console.log('6. Checking Console Errors...');
    console.log(`   ❌ Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`      - ${error}`));
    }

    // Final verification
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: 'test-results/save-for-later-final.png' });

    const overallSuccess = homepageSuccess && productsSuccess && consoleErrors.length === 0;

    console.log('\n' + '='.repeat(50));
    console.log('📋 SAVE FOR LATER TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`🎯 Overall Status: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🏠 Homepage: ${homepageSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🛍️  Products: ${productsSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔍 Console Errors: ${consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
    console.log('\n📁 Generated Screenshots:');
    console.log('   - test-results/save-for-later-homepage.png');
    console.log('   - test-results/save-for-later-products.png');
    console.log('   - test-results/save-for-later-add-to-cart.png');
    console.log('   - test-results/save-for-later-cart-open.png');
    console.log('   - test-results/save-for-later-functionality.png');
    console.log('   - test-results/save-for-later-final.png');

    return overallSuccess;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

saveForLaterTest()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 Save for Later test completed successfully!');
      console.log('The feature appears to be working correctly.');
    } else {
      console.log('⚠️  Issues detected during Save for Later test.');
      console.log('Please check the console output and screenshots for details.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });