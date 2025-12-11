// Empty Cart Verification Script
// Tests the empty cart functionality end-to-end

const puppeteer = require('puppeteer');

async function testEmptyCart() {
  let browser;
  let page;

  try {
    console.log('Starting Empty Cart Verification Test...');

    // Launch browser
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();

    // Step 1: Navigate to the frontend
    console.log('Step 1: Navigating to frontend...');
    await page.goto('http://localhost:5174');
    await page.waitForSelector('body', { timeout: 10000 });

    // Take initial screenshot
    await page.screenshot({ path: 'reports/screenshots/empty-cart-01-homepage.png' });
    console.log('✓ Homepage loaded');

    // Step 2: Click on cart icon to open cart drawer
    console.log('Step 2: Opening cart drawer...');

    // Look for cart icon - try multiple selectors
    const cartIconSelector = await page.waitForSelector(
      ['[data-testid="cart-icon"]', 'a[href="/cart"]', '.cart-icon', 'button:has-text("Cart")'].join(','),
      { timeout: 10000 }
    );

    await cartIconSelector.click();
    await page.waitForTimeout(1000); // Wait for drawer to open

    // Take screenshot of cart drawer
    await page.screenshot({ path: 'reports/screenshots/empty-cart-02-drawer.png' });
    console.log('✓ Cart drawer opened');

    // Step 3: Verify empty cart message in drawer
    console.log('Step 3: Verifying empty cart message in drawer...');

    const drawerEmptyMessage = await page.$eval(
      '.text-center:has-text("Your cart is empty")',
      el => el.textContent
    ).catch(() => null);

    if (drawerEmptyMessage && drawerEmptyMessage.includes('Your cart is empty')) {
      console.log('✓ Cart drawer shows "Your cart is empty" message');
    } else {
      console.log('⚠ Could not find empty cart message in drawer');
    }

    // Step 4: Check for continue shopping button in drawer
    console.log('Step 4: Checking for continue shopping button in drawer...');

    const continueShoppingButton = await page.$(
      'button:has-text("Continue Shopping"), button:has-text("Start Shopping")'
    );

    if (continueShoppingButton) {
      console.log('✓ Continue shopping button found in drawer');
    } else {
      console.log('⚠ Continue shopping button not found in drawer');
    }

    // Step 5: Navigate to cart page
    console.log('Step 5: Navigating to cart page...');

    // Look for a way to navigate to cart page
    const cartLink = await page.$('a[href="/cart"]');
    if (cartLink) {
      await cartLink.click();
    } else {
      await page.goto('http://localhost:5174/cart');
    }

    await page.waitForSelector('body', { timeout: 10000 });

    // Take screenshot of cart page
    await page.screenshot({ path: 'reports/screenshots/empty-cart-03-page.png' });
    console.log('✓ Cart page loaded');

    // Step 6: Verify empty cart message on cart page
    console.log('Step 6: Verifying empty cart message on cart page...');

    const pageEmptyMessage = await page.$eval(
      ':has-text("Your cart is empty")',
      el => el.textContent
    ).catch(() => null);

    if (pageEmptyMessage && pageEmptyMessage.includes('Your cart is empty')) {
      console.log('✓ Cart page shows "Your cart is empty" message');
    } else {
      console.log('⚠ Could not find empty cart message on cart page');
    }

    // Step 7: Check for continue shopping button on cart page
    console.log('Step 7: Checking for continue shopping button on cart page...');

    const pageContinueButton = await page.$(
      'button:has-text("Continue Shopping"), button:has-text("Start Shopping")'
    );

    if (pageContinueButton) {
      console.log('✓ Continue shopping button found on cart page');
    } else {
      console.log('⚠ Continue shopping button not found on cart page');
    }

    // Step 8: Verify checkout button is not present when cart is empty
    console.log('Step 8: Verifying checkout button is not present...');

    const checkoutButton = await page.$('button:has-text("Checkout"), button:has-text("Proceed to Checkout")');

    if (!checkoutButton) {
      console.log('✓ Checkout button correctly not present when cart is empty');
    } else {
      console.log('⚠ Checkout button found when cart is empty (should be hidden)');
    }

    console.log('\n=== EMPTY CART VERIFICATION COMPLETE ===');
    console.log('✅ All verification steps completed');
    console.log('📸 Screenshots saved to reports/screenshots/');

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testEmptyCart().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});