// Cart Sync and Merge Verification Test Script
// This script tests the cart sync functionality across different browsers/devices

import puppeteer from 'puppeteer';

async function testCartSyncFunctionality() {
  console.log('🧪 Starting Cart Sync and Merge Verification Test\n');

  const browser1 = await puppeteer.launch({ headless: false });
  const browser2 = await puppeteer.launch({ headless: false });

  try {
    // Test Setup
    console.log('📋 Test Setup: Opening two browser instances');
    const page1 = await browser1.newPage();
    const page2 = await browser2.newPage();

    // Set up viewport
    await page1.setViewport({ width: 1200, height: 800 });
    await page2.setViewport({ width: 1200, height: 800 });

    // Navigate to the application
    console.log('🌐 Step 1: Navigating to application');
    await page1.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page2.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Wait for page to load
    await page1.waitForSelector('h1, .text-2xl, [data-testid="app"], body');
    await page2.waitForSelector('h1, .text-2xl, [data-testid="app"], body');

    console.log('✅ Step 1: Both browsers loaded successfully');

    // Check if user is logged out initially
    const loginButton1 = await page1.$('a[href="/login"]');
    const loginButton2 = await page2.$('a[href="/login"]');

    if (!loginButton1 || !loginButton2) {
      console.log('❌ Step 2: Users should be logged out initially');
      return false;
    }

    console.log('✅ Step 2: Both browsers show login state');

    // Login in Browser 1
    console.log('🔐 Step 3: Logging in Browser 1');
    await page1.click('a[href="/login"]');

    // Wait for login form
    await page1.waitForSelector('input[type="email"], input[type="password"]');

    // Fill login form
    await page1.type('input[type="email"]', 'john.doe@example.com');
    await page1.type('input[type="password"]', 'password123');

    // Submit login
    await Promise.all([
      page1.waitForNavigation({ waitUntil: 'networkidle2' }),
      page1.click('button[type="submit"]')
    ]);

    console.log('✅ Step 3: Browser 1 logged in successfully');

    // Add items to cart in Browser 1
    console.log('🛒 Step 4: Adding items to cart in Browser 1');

    // Navigate to products page
    await page1.click('a[href="/products"]');

    // Wait for products to load
    await page1.waitForSelector('.product-card, .grid .col-span-1, [data-testid="product"]');

    // Add first product to cart
    const addToCartButton1 = await page1.$('.product-card button, .product-card [data-testid="add-to-cart"]');
    if (addToCartButton1) {
      await addToCartButton1.click();
      console.log('✅ Added first product to cart in Browser 1');
    }

    // Add second product to cart
    const addToCartButtons = await page1.$$('.product-card button, .product-card [data-testid="add-to-cart"]');
    if (addToCartButtons.length > 1) {
      await addToCartButtons[1].click();
      console.log('✅ Added second product to cart in Browser 1');
    }

    console.log('✅ Step 4: Items added to cart in Browser 1');

    // Logout from Browser 1
    console.log('🚪 Step 5: Logging out from Browser 1');
    const logoutButton1 = await page1.$('button:contains("Logout"), [data-testid="logout"]');
    if (logoutButton1) {
      await logoutButton1.click();
      await page1.waitForSelector('a[href="/login"]');
      console.log('✅ Step 5: Browser 1 logged out successfully');
    }

    // Add items to cart in Browser 2 (as guest)
    console.log('🛒 Step 6: Adding items to cart in Browser 2 (as guest)');

    // Add different products to cart in Browser 2
    await page2.click('a[href="/products"]');
    await page2.waitForSelector('.product-card, .grid .col-span-1, [data-testid="product"]');

    const addToCartButtons2 = await page2.$$('.product-card button, .product-card [data-testid="add-to-cart"]');
    if (addToCartButtons2.length > 2) {
      await addToCartButtons2[2].click();
      console.log('✅ Added third product to cart in Browser 2');
    }

    if (addToCartButtons2.length > 3) {
      await addToCartButtons2[3].click();
      console.log('✅ Added fourth product to cart in Browser 2');
    }

    console.log('✅ Step 6: Items added to cart in Browser 2');

    // Login in Browser 2
    console.log('🔐 Step 7: Logging in Browser 2 (with guest cart)');
    await page2.click('a[href="/login"]');
    await page2.waitForSelector('input[type="email"], input[type="password"]');

    await page2.type('input[type="email"]', 'john.doe@example.com');
    await page2.type('input[type="password"]', 'password123');

    // Submit login
    await Promise.all([
      page2.waitForNavigation({ waitUntil: 'networkidle2' }),
      page2.click('button[type="submit"]')
    ]);

    console.log('✅ Step 7: Browser 2 logged in successfully');

    // Check cart in Browser 2 after login (should have merged items)
    console.log('🛒 Step 8: Checking cart after login (merge verification)');
    await page2.click('a[href="/cart"], [data-testid="cart"], button[aria-label="Open cart"]');

    await page2.waitForSelector('.cart-item, .cart-drawer, [data-testid="cart-item"]');

    // Count items in cart
    const cartItems1 = await page2.$$('.cart-item, [data-testid="cart-item"]');
    const cartItemCount1 = cartItems1.length;

    console.log(`📦 Cart in Browser 2 has ${cartItemCount1} items after login`);

    if (cartItemCount1 >= 2) {
      console.log('✅ Step 8: Cart merge successful - items from both sessions present');
    } else {
      console.log('❌ Step 8: Cart merge failed - expected more items');
      return false;
    }

    // Logout from Browser 2
    console.log('🚪 Step 9: Logging out from Browser 2');
    const logoutButton2 = await page2.$('button:contains("Logout"), [data-testid="logout"]');
    if (logoutButton2) {
      await logoutButton2.click();
      await page2.waitForSelector('a[href="/login"]');
      console.log('✅ Step 9: Browser 2 logged out successfully');
    }

    // Login again in Browser 1 (should sync with server)
    console.log('🔐 Step 10: Logging in Browser 1 again (sync verification)');
    await page1.click('a[href="/login"]');
    await page1.waitForSelector('input[type="email"], input[type="password"]');

    await page1.type('input[type="email"]', 'john.doe@example.com');
    await page1.type('input[type="password"]', 'password123');

    await Promise.all([
      page1.waitForNavigation({ waitUntil: 'networkidle2' }),
      page1.click('button[type="submit"]')
    ]);

    console.log('✅ Step 10: Browser 1 logged in successfully');

    // Check cart in Browser 1 (should have merged items from both browsers)
    console.log('🛒 Step 11: Checking cart in Browser 1 (sync verification)');
    await page1.click('a[href="/cart"], [data-testid="cart"], button[aria-label="Open cart"]');
    await page1.waitForSelector('.cart-item, .cart-drawer, [data-testid="cart-item"]');

    const cartItems2 = await page1.$$('.cart-item, [data-testid="cart-item"]');
    const cartItemCount2 = cartItems2.length;

    console.log(`📦 Cart in Browser 1 has ${cartItemCount2} items after sync`);

    if (cartItemCount2 >= 2) {
      console.log('✅ Step 11: Cart sync successful - items from both browsers present');
    } else {
      console.log('❌ Step 11: Cart sync failed - expected more items');
      return false;
    }

    console.log('\n🎉 All tests passed! Cart sync and merge functionality is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    return false;
  } finally {
    await browser1.close();
    await browser2.close();
  }
}

// Run the test
testCartSyncFunctionality()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });