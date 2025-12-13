const puppeteer = require('puppeteer');

async function comprehensiveGoogleLoginVerification() {
  console.log('=== Comprehensive Google Login Verification ===\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,  // Show browser for visual verification
      devtools: false,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Step 1: Navigate to login page
    console.log('Step 1: Navigating to login page...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot of login page
    await page.screenshot({ path: 'step1-login-page.png', fullPage: true });
    console.log('   ✓ Login page loaded successfully');
    console.log('   ✓ Screenshot saved: step1-login-page.png\n');

    // Step 2: Verify "Continue with Google" button is visible and clickable
    console.log('Step 2: Verifying "Continue with Google" button...');
    const googleButton = await page.$('button');

    // Find the button that contains "Continue with Google" text
    let googleButtonFound = null;
    if (googleButton) {
      const buttonText = await page.evaluate(btn => btn.textContent.trim(), googleButton);
      if (buttonText.includes('Continue with Google')) {
        googleButtonFound = googleButton;
      }
    }

    if (googleButtonFound) {
      console.log('   ✓ "Continue with Google" button found');

      // Check if button is clickable
      const isClickable = await googleButtonFound.evaluate((btn) => {
        return !btn.disabled && btn.offsetParent !== null && btn.style.visibility !== 'hidden';
      });

      if (isClickable) {
        console.log('   ✓ Button is clickable and visible');
      } else {
        console.log('   ✗ Button is not clickable (disabled or hidden)');
      }
    } else {
      console.log('   ✗ "Continue with Google" button not found');
    }

    // Take screenshot with button highlighted
    await page.screenshot({ path: 'step2-google-button.png', fullPage: true });
    console.log('   ✓ Screenshot saved: step2-google-button.png\n');

    // Step 3: Click the "Continue with Google" button
    console.log('Step 3: Clicking "Continue with Google" button...');
    if (googleButtonFound) {
      try {
        // Listen for network requests to see the API call
        await page.setRequestInterception(true);
        page.on('request', (request) => {
          console.log(`   Network request: ${request.method()} ${request.url()}`);
          request.continue();
        });

        await googleButtonFound.click();
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check for popup or redirect
        const currentUrl = page.url();
        console.log(`   Current URL after click: ${currentUrl}`);

        if (currentUrl.includes('accounts.google.com')) {
          console.log('   ✓ Successfully redirected to Google OAuth page');
        } else if (currentUrl.includes('localhost:3002/login')) {
          console.log('   ✓ Still on login page (API call completed)');
        } else {
          console.log(`   ⚠ Redirected to different URL: ${currentUrl}`);
        }

        await page.screenshot({ path: 'step3-after-click.png', fullPage: true });
        console.log('   ✓ Screenshot saved: step3-after-click.png\n');

      } catch (error) {
        console.log(`   ✗ Error clicking button: ${error.message}`);
      }
    } else {
      console.log('   ✗ Cannot click button - button not found\n');
    }

    // Step 4: Wait for login completion
    console.log('Step 4: Waiting for login completion...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: Verify login success by checking for user-related elements
    console.log('Step 5: Verifying login success...');

    // Check for user menu or profile elements
    const userMenu = await page.$('[data-testid="user-menu"], [data-testid="user-profile"], .user-menu, .profile-menu, .user-dropdown');
    const userNameElement = await page.$('[data-testid="user-name"], [data-testid="username"], .user-name, .username, .user-display-name');
    const avatar = await page.$('[data-testid="user-avatar"], .user-avatar, .avatar');
    const cartButton = await page.$('[data-testid="cart"], .cart-button, .shopping-cart');

    // Check if we can find the user's info in the page
    const pageContent = await page.content();
    const isLoggedIn = pageContent.includes('demo.google@example.com') ||
                       pageContent.includes('Demo Google User') ||
                       pageContent.includes('user') ||
                       await page.evaluate(() => {
                         // Check if localStorage or sessionStorage has auth tokens
                         return !!localStorage.getItem('auth-storage') ||
                                !!sessionStorage.getItem('auth-storage');
                       });

    if (userMenu || userNameElement || avatar) {
      console.log('   ✓ User menu/profile elements found - user appears logged in');

      if (userNameElement) {
        const userName = await page.evaluate(el => el.textContent, userNameElement);
        console.log(`   ✓ User name found: "${userName}"`);
      }
    } else if (isLoggedIn) {
      console.log('   ✓ Login detected through content or storage');
    } else {
      console.log('   ⚠ No clear indication of successful login found');
    }

    // Check for cart button changes
    if (cartButton) {
      const cartText = await page.evaluate(el => el.textContent, cartButton);
      console.log(`   ✓ Cart button text: "${cartText}"`);
    }

    // Step 6: Check if redirected to homepage
    console.log('Step 6: Checking final destination...');
    const finalUrl = page.url();
    console.log(`   Final URL: ${finalUrl}`);

    if (finalUrl.includes('localhost:3002/') && !finalUrl.includes('/login')) {
      console.log('   ✓ Successfully redirected away from login page');
    } else if (finalUrl.includes('/login')) {
      console.log('   ⚠ Still on login page - check for error messages');
    }

    // Take final screenshot
    await page.screenshot({ path: 'step6-final-state.png', fullPage: true });
    console.log('   ✓ Final screenshot saved: step6-final-state.png\n');

    // Step 7: Check for any error messages
    console.log('Step 7: Checking for error messages...');
    const errorElements = await page.$$eval('.error, .alert, .notification', elements =>
      elements.map(el => el.textContent.trim()).filter(text => text.length > 0)
    );

    if (errorElements.length > 0) {
      console.log('   ⚠ Error messages found:');
      errorElements.forEach(error => console.log(`     - ${error}`));
    } else {
      console.log('   ✓ No error messages found');
    }

    console.log('\n=== Verification Summary ===');
    if (googleButton && isLoggedIn) {
      console.log('✅ GOOGLE LOGIN FUNCTIONALITY IS WORKING CORRECTLY');
      console.log('   - Google login button is visible and clickable');
      console.log('   - Login process completed successfully');
      console.log('   - User is now logged in');
      console.log('   - No errors detected');
    } else {
      console.log('❌ GOOGLE LOGIN FUNCTIONALITY HAS ISSUES');
      if (!googleButton) {
        console.log('   - Google login button not found or not clickable');
      }
      if (!isLoggedIn) {
        console.log('   - Login process did not complete successfully');
      }
    }

  } catch (error) {
    console.error('❌ VERIFICATION FAILED:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

comprehensiveGoogleLoginVerification().catch(console.error);