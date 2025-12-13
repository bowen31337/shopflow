import puppeteer from 'puppeteer';
import fs from 'fs';

async function verifyCoreFunctionality() {
  console.log('🧪 Starting comprehensive core functionality verification...\n');

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

  // Create results directory
  const resultsDir = 'test-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  let testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };

  try {
    // Test 1: User Registration & Login
    console.log('🔐 Test 1: User Registration & Login');
    const loginResult = await testLogin(page);
    testResults.tests.push(loginResult);
    if (loginResult.passed) testResults.passed++; else testResults.failed++;

    // Test 2: Product Browsing
    console.log('🛍️  Test 2: Product Browsing');
    const browseResult = await testProductBrowsing(page);
    testResults.tests.push(browseResult);
    if (browseResult.passed) testResults.passed++; else testResults.failed++;

    // Test 3: Add to Cart
    console.log('🛒 Test 3: Add to Cart');
    const cartResult = await testAddToCart(page);
    testResults.tests.push(cartResult);
    if (cartResult.passed) testResults.passed++; else testResults.failed++;

    // Test 4: Checkout Flow
    console.log('💳 Test 4: Checkout Flow');
    const checkoutResult = await testCheckoutFlow(page);
    testResults.tests.push(checkoutResult);
    if (checkoutResult.passed) testResults.passed++; else testResults.failed++;

    // Test 5: Admin Dashboard
    console.log('👑 Test 5: Admin Dashboard');
    const adminResult = await testAdminDashboard(page);
    testResults.tests.push(adminResult);
    if (adminResult.passed) testResults.passed++; else testResults.failed++;

    // Generate summary report
    await generateReport(page, testResults);

    console.log('\n🎉 Core functionality verification completed!');
    console.log(`📊 Results: ${testResults.passed} passed, ${testResults.failed} failed`);

  } catch (error) {
    console.error('❌ Verification failed with error:', error);
    await page.screenshot({ path: `${resultsDir}/verification-error.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

async function testLogin(page) {
  const result = {
    name: 'User Registration & Login',
    passed: false,
    details: []
  };

  try {
    // Navigate to homepage
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Navigate to login page
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/login-page.png' });
    result.details.push('Login page loaded successfully');

    // Test login form elements
    const emailInput = await page.$('#email, [name="email"], input[type="email"]');
    const passwordInput = await page.$('#password, [name="password"], input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');

    if (emailInput && passwordInput && submitButton) {
      result.details.push('All login form elements found');
    } else {
      result.details.push('❌ Missing login form elements');
      return result;
    }

    // Try login with test credentials
    await page.type('#email, [name="email"], input[type="email"]', 'test@example.com');
    await page.type('#password, [name="password"], input[type="password"]', 'test123');
    await page.click('button[type="submit"]');

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for successful login
    const currentUrl = page.url();
    const token = await page.evaluate(() => localStorage.getItem('token'));
    const profileElement = await page.$('[data-testid="profile-button"], [data-testid="avatar"], .avatar, .user-name');

    if (token || profileElement) {
      result.passed = true;
      result.details.push('✅ Login successful with test credentials');
      result.details.push(`Redirected to: ${currentUrl}`);
    } else {
      result.details.push('❌ Login failed - no token or profile element found');
    }

    return result;

  } catch (error) {
    result.details.push(`❌ Error during login test: ${error.message}`);
    return result;
  }
}

async function testProductBrowsing(page) {
  const result = {
    name: 'Product Browsing',
    passed: false,
    details: []
  };

  try {
    // Navigate to products page
    await page.goto('http://localhost:3002/products', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    await page.screenshot({ path: 'test-results/products-page.png' });
    result.details.push('Products page loaded successfully');

    // Check for product listings
    const productElements = await page.$$('[data-testid="product-card"], .product-card, .product-item, .product');
    result.details.push(`Found ${productElements.length} product elements`);

    if (productElements.length > 0) {
      result.passed = true;
      result.details.push('✅ Products are displayed');

      // Test clicking on a product
      await productElements[0].click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const productDetailUrl = page.url();
      result.details.push(`Product detail page loaded: ${productDetailUrl}`);

      // Take screenshot of product detail
      await page.screenshot({ path: 'test-results/product-detail-page.png' });

      // Check for product details
      const productName = await page.$eval('[data-testid="product-name"], .product-name, h1', el => el.textContent).catch(() => null);
      const productPrice = await page.$eval('[data-testid="product-price"], .product-price, .price', el => el.textContent).catch(() => null);

      if (productName) {
        result.details.push(`✅ Product name: ${productName}`);
      }
      if (productPrice) {
        result.details.push(`✅ Product price: ${productPrice}`);
      }
    } else {
      result.details.push('❌ No products found on the page');
    }

    return result;

  } catch (error) {
    result.details.push(`❌ Error during product browsing test: ${error.message}`);
    return result;
  }
}

async function testAddToCart(page) {
  const result = {
    name: 'Add to Cart',
    passed: false,
    details: []
  };

  try {
    // Navigate back to products page
    await page.goto('http://localhost:3002/products', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find and click first product
    const firstProduct = await page.$('[data-testid="product-card"], .product-card, .product-item, .product');
    if (firstProduct) {
      await firstProduct.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Find add to cart button
    const addToCartButton = await page.$('[data-testid="add-to-cart"], .add-to-cart, button:has-text("Add to Cart"), button:contains("Add to Cart")');

    if (!addToCartButton) {
      result.details.push('❌ Add to cart button not found');
      return result;
    }

    // Click add to cart
    await addToCartButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check for success message
    const successMessage = await page.$eval('[data-testid="success-message"], .success-message, .alert-success', el => el.textContent).catch(() => null);
    if (successMessage) {
      result.details.push(`✅ Success message: ${successMessage}`);
    }

    // Check cart icon/badge
    const cartBadge = await page.$('[data-testid="cart-badge"], .cart-badge, .cart-count');
    if (cartBadge) {
      const badgeText = await page.evaluate(el => el.textContent, cartBadge);
      result.details.push(`✅ Cart badge shows: ${badgeText}`);
    }

    // Navigate to cart
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take screenshot
    await page.screenshot({ path: 'test-results/cart-page.png' });

    // Check cart contents
    const cartItems = await page.$$('[data-testid="cart-item"], .cart-item, .cart-product');
    result.details.push(`Cart contains ${cartItems.length} items`);

    if (cartItems.length > 0) {
      result.passed = true;
      result.details.push('✅ Product successfully added to cart');

      // Check cart total
      const cartTotal = await page.$eval('[data-testid="cart-total"], .cart-total, .total-price', el => el.textContent).catch(() => null);
      if (cartTotal) {
        result.details.push(`✅ Cart total: ${cartTotal}`);
      }
    } else {
      result.details.push('❌ Cart is empty after adding product');
    }

    return result;

  } catch (error) {
    result.details.push(`❌ Error during add to cart test: ${error.message}`);
    return result;
  }
}

async function testCheckoutFlow(page) {
  const result = {
    name: 'Checkout Flow',
    passed: false,
    details: []
  };

  try {
    // Ensure we have items in cart
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const cartItems = await page.$$('[data-testid="cart-item"], .cart-item');
    if (cartItems.length === 0) {
      result.details.push('❌ No items in cart for checkout test');
      return result;
    }

    // Find checkout button
    const checkoutButton = await page.$('[data-testid="checkout-button"], .checkout-button, button:has-text("Checkout"), button:contains("Checkout")');

    if (!checkoutButton) {
      result.details.push('❌ Checkout button not found');
      return result;
    }

    // Click checkout button
    await checkoutButton.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    await page.screenshot({ path: 'test-results/checkout-page.png' });

    const checkoutUrl = page.url();
    result.details.push(`✅ Navigated to checkout: ${checkoutUrl}`);

    // Check for checkout form
    const emailInput = await page.$('#email, [name="email"], input[type="email"]');
    const addressInput = await page.$('#address, [name="address"], input[type="address"]');
    const submitButton = await page.$('button[type="submit"]');

    if (emailInput && addressInput && submitButton) {
      result.passed = true;
      result.details.push('✅ Checkout form elements found');

      // Fill out basic checkout form
      await page.type('#email, [name="email"], input[type="email"]', 'test@example.com');
      await page.type('#address, [name="address"], input[type="address"]', '123 Test Street, Test City, TC 12345');

      // Take screenshot of filled form
      await page.screenshot({ path: 'test-results/checkout-form-filled.png' });

      result.details.push('✅ Checkout form filled with test data');
    } else {
      result.details.push('❌ Checkout form elements missing');
    }

    return result;

  } catch (error) {
    result.details.push(`❌ Error during checkout flow test: ${error.message}`);
    return result;
  }
}

async function testAdminDashboard(page) {
  const result = {
    name: 'Admin Dashboard',
    passed: false,
    details: []
  };

  try {
    // Navigate to admin page
    await page.goto('http://localhost:3002/admin', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    await page.screenshot({ path: 'test-results/admin-page.png' });

    const adminUrl = page.url();
    result.details.push(`Admin page URL: ${adminUrl}`);

    // Check if we need to login first
    if (adminUrl.includes('/login')) {
      result.details.push('🔐 Admin page requires authentication, attempting login...');

      // Try to login
      await page.type('#email, [name="email"], input[type="email"]', 'admin@example.com');
      await page.type('#password, [name="password"], input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');

      await new Promise(resolve => setTimeout(resolve, 2000));

      const afterLoginUrl = page.url();
      result.details.push(`URL after admin login attempt: ${afterLoginUrl}`);

      if (!afterLoginUrl.includes('/login')) {
        result.details.push('✅ Admin login successful');
      } else {
        result.details.push('❌ Admin login failed');
      }
    }

    // Check for admin dashboard elements
    const dashboardElements = await page.$$('[data-testid="admin-dashboard"], .admin-dashboard, [data-testid="admin-panel"], .admin-panel');
    if (dashboardElements.length > 0) {
      result.passed = true;
      result.details.push('✅ Admin dashboard elements found');
    } else {
      result.details.push('⚠️  Admin dashboard elements not found (may require admin privileges)');
    }

    // Check for common admin features
    const productManagement = await page.$('[data-testid="product-management"], .product-management, a:has-text("Products")');
    const orderManagement = await page.$('[data-testid="order-management"], .order-management, a:has-text("Orders")');
    const userManagement = await page.$('[data-testid="user-management"], .user-management, a:has-text("Users")');

    if (productManagement) result.details.push('✅ Product management link found');
    if (orderManagement) result.details.push('✅ Order management link found');
    if (userManagement) result.details.push('✅ User management link found');

    return result;

  } catch (error) {
    result.details.push(`❌ Error during admin dashboard test: ${error.message}`);
    return result;
  }
}

async function generateReport(page, testResults) {
  console.log('\n📋 Test Results Summary:');
  console.log('='.repeat(50));

  testResults.tests.forEach((test, index) => {
    const status = test.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${index + 1}. ${test.name}: ${status}`);
    test.details.forEach(detail => {
      console.log(`   - ${detail}`);
    });
    console.log('');
  });

  console.log('='.repeat(50));
  console.log(`📊 Overall: ${testResults.passed} passed, ${testResults.failed} failed`);

  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Core Functionality Verification Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .test { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { border-color: #4CAF50; background: #f1f8e9; }
        .failed { border-color: #f44336; background: #ffebee; }
        .details { margin-top: 10px; }
        .details li { margin: 5px 0; }
        .summary { font-weight: bold; font-size: 18px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Core Functionality Verification Report</h1>
        <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        <p class="summary">Overall Results: ${testResults.passed} passed, ${testResults.failed} failed</p>
    </div>

    ${testResults.tests.map((test, index) => `
        <div class="test ${test.passed ? 'passed' : 'failed'}">
            <h3>${index + 1}. ${test.name} - ${test.passed ? '✅ PASSED' : '❌ FAILED'}</h3>
            <ul class="details">
                ${test.details.map(detail => `<li>${detail}</li>`).join('')}
            </ul>
        </div>
    `).join('')}
</body>
</html>
  `;

  fs.writeFileSync('test-results/verification-report.html', htmlReport);
  console.log('📄 HTML report generated: test-results/verification-report.html');
}

// Run the verification
verifyCoreFunctionality().catch(console.error);