import puppeteer from 'puppeteer';

async function testRemoveItemFromCart() {
  console.log('🧪 Starting remove item from cart test...');

  try {
    // Connect to existing Chrome instance
    const browser = await puppeteer.connect({
      browserURL: 'http://localhost:9222',
      defaultViewport: { width: 1200, height: 800 }
    });

    // Create a new page
    const page = await browser.newPage();

    // Step 1: Login
    console.log('🔐 Step 1: Logging in');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/login-success.png' });

    console.log('✅ Login successful');

    // Step 2: Add product to cart via API
    console.log('➕ Step 2: Adding product to cart via API');
    const addResult = await page.evaluate(async () => {
      try {
        // First, get a list of products
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        const firstProduct = productsData.products[0];

        if (!firstProduct) {
          return { success: false, error: 'No products found' };
        }

        // Add first product to cart
        const response = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: firstProduct.id,
            quantity: 1
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add to cart');
        }

        return await response.json();
      } catch (error) {
        console.error('Error adding to cart:', error);
        return { success: false, error: error.message };
      }
    });

    if (!addResult.success) {
      console.log('❌ Failed to add product to cart:', addResult.error);
      return;
    }

    console.log('✅ Product added to cart via API');
    console.log('📦 Cart subtotal after adding:', addResult.subtotal.toFixed(2));

    // Step 3: Get cart items
    console.log('🔍 Step 3: Getting cart items');
    const cartData = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/cart');
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching cart:', error);
        return null;
      }
    });

    if (!cartData || !cartData.items || cartData.items.length === 0) {
      console.log('❌ No items found in cart');
      return;
    }

    console.log('✅ Cart items found:', cartData.items.length);
    console.log('📦 Cart subtotal before removal: $' + cartData.subtotal.toFixed(2));

    // Step 4: Remove item via API
    console.log('🗑️  Step 4: Removing item via API');
    const itemId = cartData.items[0].id;
    const itemToRemove = cartData.items[0];

    const removeResult = await page.evaluate(async (itemId) => {
      try {
        const response = await fetch(`/api/cart/items/${itemId}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          throw new Error('Failed to remove item');
        }
        return await response.json();
      } catch (error) {
        console.error('Error removing item:', error);
        return null;
      }
    }, itemId);

    if (!removeResult) {
      console.log('❌ Failed to remove item via API');
      return;
    }

    console.log('✅ Item removed successfully via API');
    console.log('📦 Cart subtotal after removal: $' + removeResult.subtotal.toFixed(2));

    // Step 5: Verify cart is empty
    console.log('✅ Step 5: Verifying cart is empty');
    const finalCartData = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/cart');
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching cart:', error);
        return null;
      }
    });

    if (!finalCartData) {
      console.log('❌ Failed to fetch final cart data');
      return;
    }

    console.log('✅ Final cart items:', finalCartData.items.length);
    console.log('✅ Final cart subtotal: $' + finalCartData.subtotal.toFixed(2));

    // Step 6: Check UI
    console.log('🔄 Step 6: Checking UI');
    await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'test-results/final-cart-empty.png' });

    const finalCartEmpty = await page.evaluate(() => {
      return document.body.textContent.includes('Your cart is empty');
    });

    console.log('Final cart empty in UI:', finalCartEmpty);

    // Step 7: Generate test report
    console.log('📄 Step 7: Generating test report');

    const testPassed = (
      finalCartData.items.length === 0 &&
      finalCartData.subtotal === 0 &&
      finalCartEmpty
    );

    console.log('\n' + '='.repeat(60));
    console.log('🎯 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Login: SUCCESSFUL');
    console.log('✅ Add to cart via API: SUCCESSFUL');
    console.log('✅ Remove via API: SUCCESSFUL');
    console.log('✅ Cart empty after removal:', finalCartData.items.length === 0 ? '✅ YES' : '❌ NO');
    console.log('✅ Subtotal $0.00:', finalCartData.subtotal === 0 ? '✅ YES' : '❌ NO');
    console.log('✅ UI shows empty cart:', finalCartEmpty ? '✅ YES' : '❌ NO');
    console.log('='.repeat(60));
    console.log('🎉 OVERALL TEST RESULT:', testPassed ? '✅ PASSED' : '❌ FAILED');
    console.log('='.repeat(60));

    if (testPassed) {
      console.log('\n🎉 The "Remove item from cart" functionality is working correctly!');
      console.log('✅ Item removal via API successful');
      console.log('✅ Cart state properly updated');
      console.log('✅ UI properly reflects changes');
      console.log('✅ Subtotal correctly recalculated to $0.00');
    } else {
      console.log('\n❌ The "Remove item from cart" functionality has issues!');
    }

    await browser.disconnect();
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }
}

testRemoveItemFromCart();