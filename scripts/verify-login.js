const puppeteer = require('puppeteer');

async function verifyLogin() {
  console.log('=== Verifying User Login Functionality ===\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Step 1: Navigate to homepage
    console.log('Step 1: Navigating to homepage...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'reports/homepage.png', fullPage: true });
    console.log('   ✓ Homepage loaded successfully\n');

    // Step 2: Navigate to login page
    console.log('Step 2: Navigating to login page...');
    await page.goto('http://localhost:3004/login', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'reports/login-page.png', fullPage: true });
    console.log('   ✓ Login page loaded successfully\n');

    // Step 3: Try to login with test credentials
    console.log('Step 3: Attempting login with test credentials...');
    console.log('   Using: customer@example.com / customer123');

    // Fill in email
    await page.type('input[type="email"], input[name="email"]', 'customer@example.com');
    await page.type('input[type="password"], input[name="password"]', 'customer123');

    // Try to find and click submit button
    const submitButton = await page.$('button[type="submit"], button:contains("Login"), button:contains("Sign In")');
    if (submitButton) {
      await submitButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'reports/after-login-attempt.png', fullPage: true });
      console.log('   ✓ Login form submitted\n');

      // Check if we're redirected (successful login)
      const currentUrl = page.url();
      if (!currentUrl.includes('/login')) {
        console.log('   ✓ Login successful - redirected to:', currentUrl);
      } else {
        console.log('   ⚠ Still on login page - login may have failed');
      }
    } else {
      console.log('   ✗ Could not find submit button');
    }

    console.log('\n=== Login Verification Complete ===');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('Error during login verification:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

verifyLogin().catch(console.error);