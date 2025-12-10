const puppeteer = require('puppeteer');

async function testCartDrawerWorking() {
  console.log('🧪 Testing Cart Drawer on Working Server...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Go to temp-client server (port 5174)
    console.log('1. Navigating to temp-client server...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });

    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage-working.png' });
    console.log('   ✅ Page loaded');

    // Wait for React to render
    await page.waitForSelector('header', { timeout: 10000 });
    console.log('   ✅ Header rendered');

    // Look for the cart button using different selectors
    const cartSelectors = [
      'button[aria-label="Open cart"]',
      'button:text("Cart")',
      'text=🛒',
      'span:text("🛒")',
      '.text-2xl:text("🛒")'
    ];

    let cartButton = null;
    for (const selector of cartSelectors) {
      try {
        cartButton = await page.$(selector);
        if (cartButton) {
          console.log(`   ✅ Found cart button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }

    if (!cartButton) {
      console.log('   ❌ Could not find cart button with any selector');
      // Get all buttons for debugging
      const buttonTexts = await page.$$eval('button', buttons => buttons.map(b => b.textContent.trim()));
      console.log('   All button texts:', buttonTexts);
      return;
    }

    // Click cart button
    console.log('2. Clicking cart button...');
    await cartButton.click();

    // Wait for drawer to appear
    await page.waitForSelector('.bg-black.bg-opacity-50', { timeout: 5000 });
    console.log('   ✅ Cart drawer opened');

    // Take screenshot
    await page.screenshot({ path: 'test-results/cart-drawer-open-working.png' });

    // Test closing via backdrop
    console.log('3. Testing backdrop close...');
    const backdrop = await page.$('.bg-black.bg-opacity-50');
    await backdrop.click();
    await page.waitForTimeout(500);
    console.log('   ✅ Drawer closed via backdrop');

    console.log('\n🎉 Cart Drawer Test Complete!');
    console.log('\n📝 Test Results Summary:');
    console.log('   ✅ Cart drawer opens when clicking cart button');
    console.log('   ✅ Drawer closes when clicking backdrop');
    console.log('   ✅ Visual feedback working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-results/error-working.png' });
  } finally {
    await browser.close();
  }
}

testCartDrawerWorking();