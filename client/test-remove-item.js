import puppeteer from 'puppeteer';

async function testRemoveItemFromCart() {
  console.log('Starting remove item from cart test...');

  try {
    // Connect to existing Chrome instance
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: { width: 1200, height: 800 }
    });

    // Create a new page
    const page = await browser.newPage();

    // Step 1: Navigate to the application
    console.log('1. Navigating to http://localhost:5173');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/homepage.png' });

    // Capture page content to understand the structure
    const pageContent = await page.content();
    console.log('Page content length:', pageContent.length);

    // Step 2: Go to Login page and login
    console.log('2. Going to Login page and logging in');

    // First, try to find login link by text
    const loginLink = await page.$('a[href*="login"]');
    if (loginLink) {
      await loginLink.click();
    } else {
      // Try to find login button
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    }

    await page.waitForSelector('input[name="email"]', { timeout: 10000 });

    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'test123');

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Step 3: Go to Products page
    console.log('3. Going to Products page');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.product-card', { timeout: 10000 });

    // Step 4: Click on a product
    console.log('4. Clicking on a product');
    const firstProduct = await page.$('.product-card a');
    if (firstProduct) {
      await firstProduct.click();
      await page.waitForSelector('.product-detail', { timeout: 10000 });

      // Step 5: Add to cart with quantity 1
      console.log('5. Adding product to cart with quantity 1');
      const quantityInput = await page.$('input[name="quantity"]');
      if (quantityInput) {
        await quantityInput.type('1');
      } else {
        console.log('No quantity input found, trying add to cart button');
      }
      await page.click('.add-to-cart-btn');

      // Wait for success message or cart update
      await page.waitForTimeout(1000);

      // Step 6: Open cart drawer
      console.log('6. Opening cart drawer');
      // Try clicking the cart button in header
      const cartButton = await page.$('button[aria-label="Open cart"]');
      if (cartButton) {
        await cartButton.click();
      } else {
        // Try to find cart icon or link
        const cartIcon = await page.$('button:has-text("🛒")');
        if (cartIcon) {
          await cartIcon.click();
        } else {
          await page.click('a[href="/cart"]');
        }
      }
      await page.waitForSelector('.cart-drawer', { timeout: 10000 });

      // Step 7: Click remove/delete button
      console.log('7. Clicking remove/delete button');
      const removeButton = await page.$('.cart-item .remove-btn');
      if (removeButton) {
        await removeButton.click();
        await page.waitForTimeout(1000);

        // Step 8-10: Verify removal
        console.log('8-10. Verifying item removal, cart count, and subtotal');
        const cartIsEmpty = await page.$eval('.cart-drawer', el => el.textContent.includes('Your cart is empty'));
        console.log('Cart is empty:', cartIsEmpty);

        const cartCount = await page.$eval('.cart-count', el => el.textContent);
        console.log('Cart count:', cartCount);

        const subtotal = await page.$eval('.cart-subtotal', el => el.textContent);
        console.log('Subtotal:', subtotal);

        // Take final screenshots
        await page.screenshot({ path: 'test-results/cart-after-removal.png' });

        console.log('Test completed successfully!');
      } else {
        console.log('Remove button not found');
        await page.screenshot({ path: 'test-results/cart-no-remove-btn.png' });
      }
    } else {
      console.log('No products found');
      await page.screenshot({ path: 'test-results/products-not-found.png' });
    }

    await browser.disconnect();
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testRemoveItemFromCart();