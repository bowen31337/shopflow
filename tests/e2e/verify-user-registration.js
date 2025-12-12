import puppeteer from 'puppeteer';

async function verifyUserRegistration() {
  console.log('🧪 Verifying User Registration Functionality\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800', '--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Capture console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Test 1: Navigate to homepage
    console.log('1. Testing Homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const homepageText = await page.evaluate(() => document.body.innerText);
    const homepageSuccess = homepageText.includes('ShopFlow');
    console.log(`   ✅ Homepage loads: ${homepageSuccess}`);

    // Test 2: Navigate to registration page
    console.log('2. Testing Registration Page...');
    try {
      // Try multiple approaches to find the registration link
      const hasRegisterLink = await page.locator('a[href="/register"]').count() > 0;
      const hasSignUpLink = await page.locator('a:has-text("Sign Up")').count() > 0;
      const hasRegisterText = homepageText.includes('register') || homepageText.includes('sign up');

      if (hasRegisterLink) {
        await page.click('a[href="/register"]');
      } else if (hasSignUpLink) {
        await page.click('a:has-text("Sign Up")');
      } else if (hasRegisterText) {
        await page.goto('http://localhost:3000/register', { waitUntil: 'networkidle2' });
      } else {
        throw new Error('No registration link found');
      }

      await page.waitForSelector('form', { timeout: 5000 });
      console.log('   ✅ Registration page loads');
    } catch (error) {
      console.log('   ❌ Registration page not accessible');
      return false;
    }

    // Test 3: Fill registration form
    console.log('3. Testing Registration Form...');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'testpassword123';

    await page.type('input[name="email"]', testEmail);
    await page.type('input[name="password"]', testPassword);
    await page.type('input[name="name"]', 'Test User');
    await page.type('input[name="confirmPassword"]', testPassword);

    // Test 4: Submit registration
    console.log('4. Testing Registration Submission...');
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for success indicators
    const pageText = await page.evaluate(() => document.body.innerText);
    const registrationSuccess = pageText.includes('Welcome') || pageText.includes('success') || pageText.includes('login');

    console.log(`   ✅ Registration submission: ${registrationSuccess}`);

    // Test 5: Check for authentication state
    console.log('5. Testing Authentication State...');
    const hasLogoutButton = await page.locator('button:has-text("Logout")').count() > 0;
    const hasAccountMenu = await page.locator('[aria-label="Account"]').count() > 0;

    console.log(`   ✅ Authentication state: ${hasLogoutButton || hasAccountMenu}`);

    // Take final screenshot
    await page.screenshot({ path: 'test-results/user-registration-verification.png' });

    const overallSuccess = homepageSuccess && registrationSuccess && (hasLogoutButton || hasAccountMenu) && consoleErrors.length === 0;

    console.log('\n' + '='.repeat(50));
    console.log('📋 USER REGISTRATION VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`🎯 Overall Status: ${overallSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🏠 Homepage: ${homepageSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📝 Registration Form: ${registrationSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔐 Authentication: ${hasLogoutButton || hasAccountMenu ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔍 Console Errors: ${consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console Errors:');
      consoleErrors.forEach(error => console.log(`   - ${error}`));
    }

    return overallSuccess;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
verifyUserRegistration()
  .then(success => {
    console.log('\n' + '='.repeat(50));
    if (success) {
      console.log('🎉 User registration verification completed successfully!');
    } else {
      console.log('⚠️  Issues detected during user registration verification.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });