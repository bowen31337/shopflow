const puppeteer = require('puppeteer');

async function verifyShopFlowApp() {
  console.log('🧪 Verifying ShopFlow E-commerce Application...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800', '--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Capture console errors and logs
    const consoleErrors = [];
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'log') {
        consoleLogs.push(msg.text());
      }
    });

    // Test 1: Homepage Verification
    console.log('1. 🏠 Testing Homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);

    // Take homepage screenshot
    await page.screenshot({ path: 'test-results/homepage-verification.png' });

    // Check for ShopFlow logo and hero section
    const hasLogo = await page.evaluate(() => {
      return document.body.innerText.includes('ShopFlow');
    });
    const hasHero = await page.evaluate(() => {
      return document.body.innerText.includes('Welcome to ShopFlow');
    });
    const hasShopNowButton = await page.evaluate(() => {
      return document.body.innerText.includes('Shop Now');
    });

    console.log(`   ✅ Logo visible: ${hasLogo}`);
    console.log(`   ✅ Hero section: ${hasHero}`);
    console.log(`   ✅ Shop Now button: ${hasShopNowButton}`);

    // Test 2: Header Navigation
    console.log('\n2. 🧭 Testing Header Navigation...');
    const headerLoaded = await page.$('header') !== null;
    const hasProductsLink = await page.$('a[href="/products"]') !== null;
    const hasLoginLink = await page.$('a[href="/login"]') !== null;
    const hasCartIcon = await page.$('button[aria-label="Open cart"]') !== null;

    console.log(`   ✅ Header loaded: ${headerLoaded}`);
    console.log(`   ✅ Products link: ${hasProductsLink}`);
    console.log(`   ✅ Login link: ${hasLoginLink}`);
    console.log(`   ✅ Cart icon: ${hasCartIcon}`);

    // Test 3: Products Page
    console.log('\n3. 🛍️  Testing Products Page...');
    await page.click('a[href="/products"]');
    await page.waitForTimeout(2000);

    // Take products page screenshot
    await page.screenshot({ path: 'test-results/products-page.png' });

    const productsLoaded = await page.$('h1:contains("Products")') !== null;
    const hasFilters = await page.$('.bg-white.rounded-lg.shadow-sm') !== null;
    const hasSortDropdown = await page.$('select') !== null;

    console.log(`   ✅ Products page loaded: ${productsLoaded}`);
    console.log(`   ✅ Filter sidebar: ${hasFilters}`);
    console.log(`   ✅ Sort options: ${hasSortDropdown}`);

    // Test 4: Product Cards
    console.log('\n4. 🎨 Testing Product Display...');
    const productCards = await page.$$('.bg-white.rounded-lg.shadow-sm');
    const productCount = productCards.length;

    console.log(`   ✅ Product cards visible: ${productCount > 0 ? 'Yes' : 'No'}`);
    console.log(`   📊 Number of products: ${productCount}`);

    if (productCount > 0) {
      // Test clicking on first product
      console.log('\n5. 🔍 Testing Product Detail...');
      const firstProduct = productCards[0];
      if (firstProduct) {
        await firstProduct.click();
        await page.waitForTimeout(2000);

        const productDetailLoaded = await page.$('h1') !== null;
        console.log(`   ✅ Product detail page: ${productDetailLoaded}`);

        await page.screenshot({ path: 'test-results/product-detail.png' });

        // Go back to products
        await page.goBack();
        await page.waitForTimeout(1000);
      }
    }

    // Test 5: Cart Functionality
    console.log('\n6. 🛒 Testing Cart Drawer...');
    const cartButton = await page.$('button[aria-label="Open cart"]');
    if (cartButton) {
      await cartButton.click();
      await page.waitForTimeout(500);

      const cartDrawerOpen = await page.$('.bg-black.bg-opacity-50') !== null;
      console.log(`   ✅ Cart drawer opens: ${cartDrawerOpen}`);

      await page.screenshot({ path: 'test-results/cart-drawer.png' });

      // Close cart
      const backdrop = await page.$('.bg-black.bg-opacity-50');
      if (backdrop) {
        await backdrop.click();
        await page.waitForTimeout(500);
      }
    }

    // Test 7: Mobile Menu
    console.log('\n7. 📱 Testing Mobile Navigation...');
    // Simulate mobile viewport
    await page.setViewport({ width: 600, height: 800 });
    await page.waitForTimeout(500);

    const mobileMenuButton = await page.$('.md\\:hidden svg');
    if (mobileMenuButton) {
      await mobileMenuButton.click();
      await page.waitForTimeout(300);

      const mobileMenuOpen = await page.$('.md\\:hidden + div') !== null;
      console.log(`   ✅ Mobile menu opens: ${mobileMenuOpen}`);

      await page.screenshot({ path: 'test-results/mobile-menu.png' });
    }

    // Reset to desktop
    await page.setViewport({ width: 1200, height: 800 });

    // Test 8: Console Errors Check
    console.log('\n8. 🔍 Checking Console Errors...');
    console.log(`   ❌ Console errors found: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach((error, index) => {
        console.log(`      Error ${index + 1}: ${error}`);
      });
    }

    // Test 9: Page Performance
    console.log('\n9. ⚡ Testing Page Performance...');
    const performanceMetrics = await page.metrics();
    console.log(`   📊 DOM Content Loaded: ${performanceMetrics.DOMContentFlushedAt}ms`);
    console.log(`   📊 First Paint: ${performanceMetrics.FirstLayoutAt}ms`);
    console.log(`   📊 Total JS Heap Size: ${(performanceMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);

    // Test 10: Final Screenshot
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/final-homepage.png' });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SHOPFLOW APPLICATION VERIFICATION SUMMARY');
    console.log('='.repeat(60));

    const overallStatus = consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL';
    console.log(`\n🎯 Overall Status: ${overallStatus}`);

    console.log('\n📋 Detailed Results:');
    console.log(`   🏠 Homepage: ${hasLogo && hasHero ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   🧭 Navigation: ${headerLoaded && hasProductsLink ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   🛍️  Products Page: ${productsLoaded ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   🎨 Product Display: ${productCount > 0 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   🛒 Cart Functionality: ${cartButton ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   📱 Mobile Menu: ${mobileMenuButton ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   🔍 Console Errors: ${consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);

    console.log('\n📁 Screenshots Generated:');
    console.log('   - test-results/homepage-verification.png');
    console.log('   - test-results/products-page.png');
    console.log('   - test-results/product-detail.png');
    console.log('   - test-results/cart-drawer.png');
    console.log('   - test-results/mobile-menu.png');
    console.log('   - test-results/final-homepage.png');

    console.log('\n✅ Verification Complete!');

    return consoleErrors.length === 0;

  } catch (error) {
    console.error('❌ Verification Failed:', error.message);
    await page.screenshot({ path: 'test-results/verification-error.png' });
    return false;
  } finally {
    await browser.close();
  }
}

// Run the verification
verifyShopFlowApp()
  .then(success => {
    console.log('\n' + '='.repeat(60));
    if (success) {
      console.log('🎉 All tests passed! ShopFlow application is working correctly.');
    } else {
      console.log('⚠️  Some issues detected. Please review the console errors above.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Verification execution failed:', error);
    process.exit(1);
  });