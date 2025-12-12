const puppeteer = require('puppeteer');

async function quickShopFlowVerification() {
  console.log('🧪 Quick ShopFlow Application Verification\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  try {
    const page = await browser.newPage();

    // Capture console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test 1: Homepage
    console.log('1. Testing Homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });

    const homepageText = await page.evaluate(() => document.body.innerText);
    const homepageSuccess = homepageText.includes('ShopFlow') && homepageText.includes('Welcome');

    console.log(`   ✅ Homepage accessible: ${homepageSuccess}`);

    // Test 2: Check for React components
    const reactDetected = await page.evaluate(() => {
      return !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    });

    console.log(`   ✅ React detected: ${reactDetected}`);

    // Test 3: Check for navigation links
    const hasProductsLink = await page.evaluate(() => {
      return !!document.querySelector('a[href="/products"]');
    });

    console.log(`   ✅ Products link: ${hasProductsLink}`);

    // Test 4: Check for cart functionality
    const hasCartIcon = await page.evaluate(() => {
      return !!document.querySelector('button[aria-label="Open cart"]');
    });

    console.log(`   ✅ Cart icon: ${hasCartIcon}`);

    // Test 5: Console errors
    console.log(`6. Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`   ❌ ${error}`));
    }

    // Final status
    const overallStatus = homepageSuccess && consoleErrors.length === 0;

    console.log('\n' + '='.repeat(50));
    console.log('📋 VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`🎯 Overall Status: ${overallStatus ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🏠 Homepage: ${homepageSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`⚛️  React: ${reactDetected ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🛍️  Navigation: ${hasProductsLink ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🛒 Cart: ${hasCartIcon ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔍 Console: ${consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);

    if (overallStatus) {
      console.log('\n🎉 ShopFlow application appears to be working correctly!');
    } else {
      console.log('\n⚠️  Some issues detected.');
    }

    return overallStatus;

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

quickShopFlowVerification()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('💥 Verification error:', error);
    process.exit(1);
  });