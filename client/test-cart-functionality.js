import puppeteer from 'puppeteer';

async function testCartFunctionality() {
  console.log('🛒 Testing cart functionality...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-ipc-flooding-protection'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  try {
    // First, login programmatically to set up the auth state
    console.log('🔐 Logging in programmatically...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    await page.evaluate(async () => {
      // Simulate the login process
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        })
      });

      const data = await response.json();
      const { accessToken: token, user } = data;

      // Store in localStorage like Zustand persist would
      const authStorage = {
        state: {
          user: user,
          token: token
        },
        version: 0
      };

      localStorage.setItem('auth-storage', JSON.stringify(authStorage));

      // Set auth header for future requests
      localStorage.setItem('token', token);
    });

    // Navigate to homepage
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

    // Navigate to products page
    console.log('🛍️  Navigating to products page...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });

    // Take screenshot of products page
    await page.screenshot({ path: 'test-results/products-page.png', fullPage: true });

    // Find and click first "Add to Cart" button
    console.log('🛒 Adding first product to cart...');
    const buttons = await page.$$eval('button', els => els.map(el => el.textContent));
    console.log('All buttons found:', buttons);

    // Find button with "Add to Cart" text
    const buttonsElements = await page.$$('button');
    let addToCartButton = null;
    for (const button of buttonsElements) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Add to Cart')) {
        addToCartButton = button;
        break;
      }
    }

    if (addToCartButton) {
      await addToCartButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check for success message
      const successMessage = await page.$$eval('.success-message, .alert, .toast', els => els.map(el => el.textContent));
      console.log('Success messages:', successMessage);
    } else {
      console.log('❌ No "Add to Cart" button found');
    }

    // Navigate to cart
    console.log('🛒 Navigating to cart...');
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });

    // Check cart items
    const cartItems = await page.$$('[data-testid="cart-item"], .cart-item, .cart-product');
    console.log('🛒 Cart items found:', cartItems.length);

    if (cartItems.length > 0) {
      console.log('✅ Cart contains items');

      // Test remove functionality
      const removeButton = await page.$('[data-testid="remove-item"], [data-testid="delete-item"], .remove-item, .delete-item, .remove-btn, button:has-text("Remove")');
      if (removeButton) {
        console.log('🗑️  Testing remove functionality...');
        await removeButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if item was removed
        const cartItemsAfterRemove = await page.$$('[data-testid="cart-item"], .cart-item, .cart-product');
        console.log('🛒 Cart items after removal:', cartItemsAfterRemove.length);

        if (cartItemsAfterRemove.length < cartItems.length) {
          console.log('✅ Remove functionality working');
        } else {
          console.log('⚠️  Remove functionality may not be working');
        }
      } else {
        console.log('❌ No remove button found');
      }
    } else {
      console.log('❌ Cart is empty');
    }

    await page.screenshot({ path: 'test-results/cart-functionality-test.png', fullPage: true });

  } catch (error) {
    console.error('❌ Cart functionality test failed:', error);
    await page.screenshot({ path: 'test-results/cart-functionality-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testCartFunctionality().catch(console.error);