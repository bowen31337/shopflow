// Cart Functionality Verification Test
// This test verifies that the shopping cart functionality works correctly

import puppeteer from 'puppeteer';

async function verifyCartFunctionality() {
  console.log('🛒 Cart Functionality Verification Test\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800', '--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Step 1: Login as a user to get auth token
    console.log('1. Logging in as test user...');
    const loginResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'customer@example.com',
            password: 'customer123'
          })
        });
        const data = await response.json();
        // Store auth token in localStorage
        if (data.accessToken) {
          localStorage.setItem('auth-storage', JSON.stringify({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken
          }));
        }
        return {
          success: response.ok,
          user: data.user
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log(`   ✅ Login: ${loginResponse.success ? 'PASS' : 'FAIL'}`);
    if (!loginResponse.success) {
      console.log(`   ❌ Login failed: ${loginResponse.error || 'Unknown error'}`);
      return false;
    }

    // Step 2: Test adding items to cart
    console.log('2. Testing Add to Cart...');
    const addToCartResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/cart/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('auth-storage')).accessToken
          },
          body: JSON.stringify({
            productId: 1, // TechPro Laptop Pro 15
            quantity: 1
          })
        });
        const data = await response.json();
        return {
          success: response.ok,
          cartItem: data.cartItem
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log(`   ✅ Add to Cart: ${addToCartResponse.success ? 'PASS' : 'FAIL'}`);
    if (addToCartResponse.success) {
      console.log(`   🛒 Added: ${addToCartResponse.cartItem.product_name}`);
    }

    // Step 3: Test viewing cart
    console.log('3. Testing View Cart...');
    const viewCartResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/cart', {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('auth-storage')).accessToken
          }
        });
        const data = await response.json();
        return {
          success: response.ok,
          cartItems: data.cartItems,
          total: data.total
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log(`   ✅ View Cart: ${viewCartResponse.success ? 'PASS' : 'FAIL'}`);
    if (viewCartResponse.success) {
      console.log(`   📦 Cart Items: ${viewCartResponse.cartItems.length}`);
      console.log(`   💰 Total: $${viewCartResponse.total.toFixed(2)}`);
    }

    // Step 4: Test updating cart quantity
    console.log('4. Testing Update Cart Quantity...');
    const updateCartResponse = await page.evaluate(async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/cart/items/1`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('auth-storage')).accessToken
          },
          body: JSON.stringify({
            quantity: 2
          })
        });
        const data = await response.json();
        return {
          success: response.ok,
          updatedQuantity: data.cartItem.quantity
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log(`   ✅ Update Quantity: ${updateCartResponse.success ? 'PASS' : 'FAIL'}`);
    if (updateCartResponse.success) {
      console.log(`   📊 Updated Quantity: ${updateCartResponse.updatedQuantity}`);
    }

    // Step 5: Take screenshot
    console.log('5. Capturing Screenshot...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'test-results/cart-functionality-test.png' });
    console.log('   ✅ Screenshot captured');

    const overallSuccess = loginResponse.success && addToCartResponse.success &&
                          viewCartResponse.success && updateCartResponse.success;

    console.log('\n' + '='.repeat(50));
    console.log('📋 CART FUNCTIONALITY VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`🎯 Overall Status: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔐 Login: ${loginResponse.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🛒 Add to Cart: ${addToCartResponse.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📦 View Cart: ${viewCartResponse.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📊 Update Quantity: ${updateCartResponse.success ? '✅ PASS' : '❌ FAIL'}`);

    return overallSuccess;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
verifyCartFunctionality()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 Cart functionality verification completed successfully!');
      console.log('✅ All cart operations working correctly');
    } else {
      console.log('⚠️  Issues detected during cart functionality verification.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });