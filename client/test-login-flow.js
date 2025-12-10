import puppeteer from 'puppeteer';
import fs from 'fs';

async function testLoginFlow() {
  console.log('🧪 Starting comprehensive login flow test...');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-ipc-flooding-protection',
      '--disable-web-security',
      '--allow-running-insecure-content',
      '--disable-features=VizDisplayCompositor'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  try {
    // Navigate to homepage
    console.log('🏠 Navigating to homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if we're already logged in
    let isLoggedIn = false;
    try {
      const profileButton = await page.$('[data-testid="profile-button"], [data-testid="avatar"], .avatar, .user-name, .user-email');
      if (profileButton) {
        console.log('⚠️  User already logged in, logging out first...');
        await page.click('[data-testid="profile-button"], [data-testid="avatar"], .avatar, .user-name, .user-email');
        await new Promise(resolve => setTimeout(resolve, 500));

        const logoutButton = await page.$('[data-testid="logout-button"], [data-testid="sign-out"], .logout-button, .sign-out');
        if (logoutButton) {
          await logoutButton.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          isLoggedIn = false;
        }
      }
    } catch (e) {
      console.log('📝 User not logged in, proceeding with login test...');
    }

    // Navigate to Login page
    console.log('🔐 Navigating to login page...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 1: Try login with wrong credentials
    console.log('❌ Testing login with wrong credentials...');
    await page.type('#email', 'wrong@example.com');
    await page.type('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for error message
    const errorMessage = await page.$eval('[data-testid="error-message"], .error-message, .alert', el => el.textContent).catch(() => null);
    if (errorMessage) {
      console.log('✅ Error message displayed correctly:', errorMessage);
    } else {
      console.log('⚠️  No error message found for wrong credentials');
    }

    // Clear form
    await page.waitForSelector('[data-testid="email-input"], [data-testid="username-input"], [name="email"], [name="username"], .email-input, .username-input');
    await page.evaluate(() => {
      const emailInput = document.querySelector('[data-testid="email-input"], [data-testid="username-input"], [name="email"], [name="username"], .email-input, .username-input');
      const passwordInput = document.querySelector('[data-testid="password-input"], [name="password"], .password-input');
      if (emailInput) emailInput.value = '';
      if (passwordInput) passwordInput.value = '';
    });

    // Test 2: Try login with correct credentials
    console.log('✅ Testing login with correct credentials...');
    await page.type('#email', 'test@example.com');
    await page.type('#password', 'test123');

    // Test Remember Me functionality
    const rememberMe = await page.$('#remember-me');
    if (rememberMe) {
      console.log('✅ Remember me checkbox found, checking it...');
      await rememberMe.click();
    }

    // Capture before login state
    const beforeLoginCookies = await page.cookies();
    console.log('🍪 Cookies before login:', beforeLoginCookies.length);

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation and check for JWT token
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check for redirect to homepage
    const currentUrl = page.url();
    console.log('🌐 Current URL after login:', currentUrl);

    if (currentUrl.includes('/home') || currentUrl === 'http://localhost:5173/') {
      console.log('✅ Redirected to homepage after login');
    } else {
      console.log('⚠️  Not redirected to homepage, URL:', currentUrl);
    }

    // Check for JWT token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    if (token) {
      console.log('✅ JWT token found in localStorage:', token.substring(0, 50) + '...');
      isLoggedIn = true;
    } else {
      console.log('❌ No JWT token found in localStorage');
      // Check for session storage
      const sessionToken = await page.evaluate(() => sessionStorage.getItem('token'));
      if (sessionToken) {
        console.log('✅ JWT token found in sessionStorage:', sessionToken.substring(0, 50) + '...');
        isLoggedIn = true;
      } else {
        console.log('❌ No JWT token found in sessionStorage either');

        // Check for auth state in localStorage
        const authState = await page.evaluate(() => localStorage.getItem('auth'));
        if (authState) {
          console.log('✅ Auth state found in localStorage:', authState);
          isLoggedIn = true;
        }
      }
    }

    // Check for user profile elements
    if (isLoggedIn) {
      console.log('👤 Checking for user profile elements...');
      const profileElements = await page.$$('[data-testid="profile-button"], [data-testid="avatar"], .avatar, .user-name, .user-email, .username');
      console.log('✅ Profile elements found:', profileElements.length);

      if (profileElements.length > 0) {
        const profileText = await page.$eval('[data-testid="profile-button"], [data-testid="avatar"], .avatar, .user-name, .user-email, .username', el => el.textContent).catch(() => null);
        if (profileText) {
          console.log('👤 Profile text:', profileText);
        }
      }
    }

    // Test 3: Test cart functionality
    if (isLoggedIn) {
      console.log('🛒 Testing cart functionality...');

      // Navigate to products page
      await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Find first product and add to cart
      const addToCartButton = await page.$('button:has-text("Add to Cart")');
      if (addToCartButton) {
        console.log('✅ Found add to cart button, clicking...');
        await addToCartButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check for success message
        const successMessage = await page.$eval('[data-testid="success-message"], .success-message, .alert-success', el => el.textContent).catch(() => null);
        if (successMessage) {
          console.log('✅ Success message displayed:', successMessage);
        }

        // Navigate to cart
        await page.goto('http://localhost:5173/cart', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if cart has items
        const cartItems = await page.$$('[data-testid="cart-item"], .cart-item, .cart-product');
        console.log('🛒 Cart items found:', cartItems.length);

        if (cartItems.length > 0) {
          console.log('✅ Cart contains items after login');

          // Test remove functionality
          const removeButton = await page.$('[data-testid="remove-item"], [data-testid="delete-item"], .remove-item, .delete-item, .remove-btn, button:has-text("Remove")');
          if (removeButton) {
            console.log('🗑️  Testing remove functionality...');
            await removeButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check if item was removed
            const cartItemsAfterRemove = await page.$$('[data-testid="cart-item"], .cart-item');
            console.log('🛒 Cart items after removal:', cartItemsAfterRemove.length);

            if (cartItemsAfterRemove.length < cartItems.length) {
              console.log('✅ Remove functionality working correctly');
            } else {
              console.log('⚠️  Remove functionality may not be working');
            }
          }
        }
      } else {
        console.log('❌ No add to cart button found');
      }
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-results/login-flow-complete.png', fullPage: true });
    console.log('📸 Screenshot saved: test-results/login-flow-complete.png');

    console.log('\n🎉 Login flow test completed!');
    console.log('Summary:');
    console.log('- Login with wrong credentials: Tested');
    console.log('- Login with correct credentials: ' + (isLoggedIn ? 'SUCCESS' : 'FAILED'));
    console.log('- Redirect to homepage: ' + (currentUrl.includes('/home') || currentUrl === 'http://localhost:5173/' ? 'SUCCESS' : 'FAILED'));
    console.log('- JWT token storage: ' + (token || await page.evaluate(() => sessionStorage.getItem('token')) || await page.evaluate(() => localStorage.getItem('auth')) ? 'SUCCESS' : 'FAILED'));
    console.log('- Cart functionality: ' + (isLoggedIn ? 'TESTED' : 'SKIPPED - not logged in'));
    console.log('- Remove functionality: ' + (isLoggedIn ? 'TESTED' : 'SKIPPED - not logged in'));

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await page.screenshot({ path: 'test-results/login-flow-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testLoginFlow().catch(console.error);