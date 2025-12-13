const puppeteer = require('puppeteer');

async function verifyGoogleLogin() {
  console.log('Starting Google Login Verification...\n');

  let browser;
  try {
    // Launch browser with remote debugging
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
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
    console.log('1. Navigating to login page...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot of login page
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    console.log('   ✓ Login page loaded successfully');
    console.log('   ✓ Screenshot saved: login-page.png\n');

    // Step 2: Verify "Continue with Google" button is visible
    console.log('2. Checking for "Continue with Google" button...');
    const googleButton = await page.$('button[data-testid="google-login"], a[data-testid="google-login"], button[aria-label*="Google"], button[onclick*="google"], [href*="google"]');

    if (googleButton) {
      console.log('   ✓ "Continue with Google" button found');

      // Check if button is clickable
      const isClickable = await googleButton.evaluate((btn) => {
        return !btn.disabled && btn.offsetParent !== null;
      });

      if (isClickable) {
        console.log('   ✓ Button is clickable');
      } else {
        console.log('   ✗ Button is not clickable (disabled or hidden)');
      }
    } else {
      console.log('   ✗ "Continue with Google" button not found');
    }

    // Take screenshot of login page with button
    await page.screenshot({ path: 'login-page-with-button.png', fullPage: true });
    console.log('   ✓ Screenshot saved: login-page-with-button.png\n');

    // Step 3: Click the Google button
    console.log('3. Clicking "Continue with Google" button...');
    if (googleButton) {
      await googleButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Take screenshot after clicking
      await page.screenshot({ path: 'after-google-click.png', fullPage: true });
      console.log('   ✓ Screenshot saved: after-google-click.png');

      // Check if we're redirected to Google OAuth
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);

      if (currentUrl.includes('accounts.google.com')) {
        console.log('   ✓ Successfully redirected to Google OAuth page');
      } else {
        console.log('   ⚠ Not redirected to Google OAuth page');
      }
    } else {
      console.log('   ✗ Cannot click button - button not found');
    }

    // Wait for user interaction or manual verification
    console.log('\n4. Manual verification phase...');
    console.log('   Please manually complete the Google login process');
    console.log('   The browser will remain open for 60 seconds');

    await new Promise(resolve => setTimeout(resolve, 60000));

    // After manual login, check final state
    const finalUrl = page.url();
    console.log(`\n5. Final verification...`);
    console.log(`   Final URL: ${finalUrl}`);

    // Check if user is logged in by looking for user-related elements
    const userMenu = await page.$('[data-testid="user-menu"], [data-testid="user-profile"], .user-menu, .profile-menu');
    const userName = await page.$('[data-testid="user-name"], [data-testid="username"], .user-name, .username');
    const loginStatus = await page.$('[data-testid="login-status"], .login-status, .logged-in');

    if (userMenu) {
      console.log('   ✓ User menu found - user appears to be logged in');
    } else if (userName) {
      console.log('   ✓ Username found - user appears to be logged in');
    } else if (loginStatus) {
      console.log('   ✓ Login status element found - user appears to be logged in');
    } else {
      console.log('   ⚠ No clear indication of successful login');
    }

    // Take final screenshot
    await page.screenshot({ path: 'final-state.png', fullPage: true });
    console.log('   ✓ Final screenshot saved: final-state.png\n');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

verifyGoogleLogin().catch(console.error);