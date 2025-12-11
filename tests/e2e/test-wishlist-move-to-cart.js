import puppeteer from 'puppeteer';

async function testWishlistMoveToCart() {
  console.log('🔄 Testing move product from wishlist to cart...');

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

    // First, add a product to wishlist
    console.log('❤️ Adding product to wishlist first...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });

    // Find and click first wishlist heart button
    const wishlistButtons = await page.$$('button');
    let wishlistButton = null;
    for (const button of wishlistButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && (text.includes('🤍') || text.includes('❤️'))) {
        wishlistButton = button;
        break;
      }
    }

    if (wishlistButton) {
      await wishlistButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Product added to wishlist');
    } else {
      console.log('❌ No wishlist button found');
      await browser.close();
      return;
    }

    // Navigate to wishlist
    console.log('📋 Navigating to wishlist...');
    await page.goto('http://localhost:5173/wishlist', { waitUntil: 'networkidle2' });

    // Take screenshot
    await page.screenshot({ path: 'test-results/wishlist-page.png', fullPage: true });

    // Check if wishlist has items
    const wishlistItems = await page.$$('[data-testid="wishlist-item"], .wishlist-item, .product-card');
    console.log(`📦 Wishlist items found: ${wishlistItems.length}`);

    if (wishlistItems.length === 0) {
      console.log('❌ No items in wishlist');
      await browser.close();
      return;
    }

    // Find "Move to Cart" button
    const buttons = await page.$$('button');
    let moveToCartButton = null;
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Move to Cart')) {
        moveToCartButton = button;
        break;
      }
    }

    if (!moveToCartButton) {
      console.log('❌ No "Move to Cart" button found');
      // List all buttons for debugging
      const allButtons = await page.$$eval('button', els => els.map(el => el.textContent));
      console.log('All buttons found:', allButtons);
      await browser.close();
      return;
    }

    console.log('🔄 Clicking "Move to Cart" button...');
    await moveToCartButton.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for success message
    const successMessages = await page.$$eval('.success-message, .alert, .toast, [role="alert"]', els => els.map(el => el.textContent));
    console.log('Success messages:', successMessages);

    // Navigate to cart to verify item was added
    console.log('🛒 Navigating to cart...');
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });

    // Check cart items
    const cartItems = await page.$$('[data-testid="cart-item"], .cart-item, .cart-product');
    console.log(`🛒 Cart items found: ${cartItems.length}`);

    if (cartItems.length > 0) {
      console.log('✅ SUCCESS: Product moved from wishlist to cart!');

      // Take screenshot of cart
      await page.screenshot({ path: 'test-results/cart-after-move.png', fullPage: true });

      // Optional: Check if item was removed from wishlist
      await page.goto('http://localhost:5173/wishlist', { waitUntil: 'networkidle2' });
      const updatedWishlistItems = await page.$$('[data-testid="wishlist-item"], .wishlist-item, .product-card');
      console.log(`📋 Wishlist items after move: ${updatedWishlistItems.length}`);

      if (updatedWishlistItems.length < wishlistItems.length) {
        console.log('✅ Item was removed from wishlist after moving to cart');
      }
    } else {
      console.log('❌ FAILED: Cart is empty after moving item from wishlist');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

testWishlistMoveToCart();