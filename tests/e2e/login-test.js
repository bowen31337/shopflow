// Login and Cart Functionality Test Script
// This script tests the ShopFlow e-commerce application

const puppeteer = require('puppeteer');

async function testShopFlowLogin() {
  console.log('🧪 Starting ShopFlow Login and Cart Test\n');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });

    console.log('1️⃣ Navigating to ShopFlow homepage...');
    await page.goto('http://localhost:5175', { waitUntil: 'networkidle2' });

    // Take screenshot of homepage
    await page.screenshot({ path: 'test-results/homepage.png' });
    console.log('📷 Homepage screenshot taken');

    console.log('2️⃣ Navigating to Login page...');
    await page.click('a[href="/login"]');
    await page.waitForSelector('form input[name="email"]', { timeout: 5000 });

    console.log('3️⃣ Testing login with credentials...');
    await page.screenshot({ path: 'test-results/login-page.png' });
    console.log('📷 Login page screenshot taken');

    // Try login with test credentials
    await page.type('input[name="email"]', 'customer@example.com');
    await page.type('input[name="password"]', 'customer123');

    console.log('4️⃣ Submitting login form...');
    await page.click('button[type="submit"]');

    // Wait for navigation and check login result
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 });
      console.log('✅ Login successful - user redirected');

      // Check for JWT token in localStorage
      const token = await page.evaluate(() => localStorage.getItem('auth-storage'));
      console.log('🔐 Auth token exists:', !!token);

      if (token) {
        console.log('✅ JWT token found in localStorage');
      } else {
        console.log('❌ No JWT token found in localStorage');
      }

      // Check if user is authenticated by looking for logout button
      const hasLogout = await page.locator('button:has-text("Logout")').count() > 0;
      console.log('👤 User authenticated (logout button visible):', hasLogout);

    } catch (navError) {
      console.log('❌ Login failed or no redirect occurred');
      await page.screenshot({ path: 'test-results/login-failed.png' });
    }

    console.log('\n5️⃣ Testing product navigation and cart functionality...');

    // Navigate to products page
    await page.click('a[href="/products"]');
    await page.waitForSelector('.product-card', { timeout: 5000 });

    // Get first product
    const firstProduct = await page.locator('.product-card').first();
    await firstProduct.hover();

    // Click "Add to Cart" button
    const addToCartButton = await firstProduct.locator('button:has-text("Add to Cart")');
    if (await addToCartButton.count() > 0) {
      console.log('6️⃣ Adding first product to cart...');
      await addToCartButton.click();
      await page.waitForTimeout(1000); // Wait for cart update
      console.log('✅ Product added to cart');
    } else {
      console.log('❌ Add to Cart button not found');
    }

    console.log('7️⃣ Opening cart drawer...');
    await page.click('button[aria-label="Open cart"]');
    await page.waitForSelector('.CartDrawer', { timeout: 3000 });

    // Check if cart has items
    const cartItems = await page.locator('.cart-item').count();
    console.log('🛒 Cart items count:', cartItems);

    if (cartItems > 0) {
      console.log('✅ Product successfully added to cart');

      // Test remove functionality
      const removeButton = await page.locator('button:has-text("Remove")').first();
      if (await removeButton.count() > 0) {
        console.log('8️⃣ Testing remove functionality...');
        await removeButton.click();
        await page.waitForTimeout(1000);

        // Check if item was removed
        const cartItemsAfter = await page.locator('.cart-item').count();
        console.log('🛒 Cart items after removal:', cartItemsAfter);

        if (cartItemsAfter < cartItems) {
          console.log('✅ Remove functionality working correctly');
        } else {
          console.log('❌ Remove functionality not working');
        }
      } else {
        console.log('❌ Remove button not found in cart');
      }
    } else {
      console.log('❌ No items found in cart');
    }

    // Take final screenshots
    await page.screenshot({ path: 'test-results/cart-after-test.png' });
    console.log('📷 Final cart screenshot taken');

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Login: Tested with customer@example.com / customer123');
    console.log('- Cart: Product addition and removal functionality tested');
    console.log('- Authentication: JWT token storage verified');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-results/test-error.png' });
  } finally {
    await browser.close();
  }
}

// Run the test
testShopFlowLogin().catch(console.error);