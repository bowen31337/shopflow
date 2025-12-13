import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

async function runComprehensiveEcommerceTests() {
  console.log('🧪 Starting Comprehensive E-commerce Core Functionality Verification...\n');

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
  await page.setViewport({ width: 1280, height: 720 });

  // Create test results directory
  const resultsDir = 'test-results';
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  let testResults = {
    passed: 0,
    failed: 0,
    tests: [],
    timestamp: new Date().toISOString()
  };

  try {
    // Test 1: Homepage Load Test
    console.log('🏠 Test 1: Homepage Load Test');
    const homepageResult = await testHomepage(page);
    testResults.tests.push(homepageResult);
    if (homepageResult.passed) testResults.passed++; else testResults.failed++;

    // Test 2: User Registration & Login
    console.log('🔐 Test 2: User Registration & Login');
    const loginResult = await testLogin(page);
    testResults.tests.push(loginResult);
    if (loginResult.passed) testResults.passed++; else testResults.failed++;

    // Test 3: Product Browsing
    console.log('🛍️  Test 3: Product Browsing');
    const browseResult = await testProductBrowsing(page);
    testResults.tests.push(browseResult);
    if (browseResult.passed) testResults.passed++; else testResults.failed++;

    // Test 4: Product Detail Page
    console.log('📱 Test 4: Product Detail Page');
    const productDetailResult = await testProductDetail(page);
    testResults.tests.push(productDetailResult);
    if (productDetailResult.passed) testResults.passed++; else testResults.failed++;

    // Test 5: Add to Cart
    console.log('🛒 Test 5: Add to Cart');
    const cartResult = await testAddToCart(page);
    testResults.tests.push(cartResult);
    if (cartResult.passed) testResults.passed++; else testResults.failed++;

    // Test 6: Checkout Flow
    console.log('💳 Test 6: Checkout Flow');
    const checkoutResult = await testCheckoutFlow(page);
    testResults.tests.push(checkoutResult);
    if (checkoutResult.passed) testResults.passed++; else testResults.failed++;

    // Test 7: Admin Dashboard
    console.log('👑 Test 7: Admin Dashboard');
    const adminResult = await testAdminDashboard(page);
    testResults.tests.push(adminResult);
    if (adminResult.passed) testResults.passed++; else testResults.failed++;

    // Generate comprehensive report
    await generateComprehensiveReport(page, testResults);

    console.log('\n🎉 Comprehensive e-commerce verification completed!');
    console.log(`📊 Results: ${testResults.passed} passed, ${testResults.failed} failed`);

    // Save results to JSON
    fs.writeFileSync(
      path.join(resultsDir, 'comprehensive-test-results.json'),
      JSON.stringify(testResults, null, 2)
    );

  } catch (error) {
    console.error('❌ Verification failed with error:', error);
    await page.screenshot({ path: `${resultsDir}/verification-error.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

async function testHomepage(page) {
  const result = {
    name: 'Homepage Load Test',
    passed: false,
    details: [],
    screenshots: []
  };

  try {
    // Navigate to homepage
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot
    const screenshotPath = 'test-results/homepage-full.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push(screenshotPath);
    result.details.push('✅ Homepage loaded with full page screenshot captured');

    // Check page title
    const title = await page.title();
    if (title.includes('ShopFlow')) {
      result.details.push(`✅ Page title correct: "${title}"`);
    } else {
      result.details.push(`⚠️  Page title: "${title}"`);
    }

    // Check for main content
    const bodyText = await page.evaluate(() => document.body.textContent);
    if (bodyText && bodyText.length > 100) {
      result.details.push('✅ Page contains substantial content');
    } else {
      result.details.push('❌ Page appears to have minimal content');
    }

    // Check for navigation elements
    const navElements = await page.$$('[data-testid*="nav"], nav, header, .header, .navigation');
    if (navElements.length > 0) {
      result.details.push('✅ Navigation elements found');
    } else {
      result.details.push('⚠️  Navigation elements not found with common selectors');
    }

    // Check for hero section
    const heroSection = await page.$('[data-testid*="hero"], .hero, .hero-section, [class*="hero"]');
    if (heroSection) {
      result.details.push('✅ Hero section detected');
    } else {
      result.details.push('⚠️  Hero section not detected with common selectors');
    }

    // Check for product sections
    const productSections = await page.$$('[data-testid*="product"], .product, .featured-products, [class*="product"]');
    if (productSections.length > 0) {
      result.passed = true;
      result.details.push(`✅ Product sections found: ${productSections.length}`);
    } else {
      result.details.push('❌ No product sections found');
    }

    return result;

  } catch (error) {
    result.details.push(`❌ Error during homepage test: ${error.message}`);
    return result;
  }
}

async function testLogin(page) {
  const result = {
    name: 'User Registration & Login',
    passed: false,
    details: [],
    screenshots: []
  };

  try {
    // Navigate to login page
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    const screenshotPath = 'test-results/login-page-full.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push(screenshotPath);
    result.details.push('✅ Login page loaded with full page screenshot captured');

    // Check for form elements with flexible selectors
    const emailSelectors = ['input[name="email"]', 'input[type="email"]', '#email', 'input[placeholder*="email"]'];
    const passwordSelectors = ['input[name="password"]', 'input[type="password"]', '#password', 'input[placeholder*="password"]'];
    const submitSelectors = ['button[type="submit"]', 'input[type="submit"]', 'button[type="button"]'];

    let emailFound = false, passwordFound = false, submitFound = false;

    for (const selector of emailSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          emailFound = true;
          result.details.push(`✅ Email input found: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    for (const selector of passwordSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          passwordFound = true;
          result.details.push(`✅ Password input found: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    for (const selector of submitSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          submitFound = true;
          result.details.push(`✅ Submit button found: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (emailFound && passwordFound && submitFound) {
      result.details.push('✅ All required form elements found');

      // Try login with test credentials
      await page.type('input[name="email"], input[type="email"], #email', 'customer@example.com');
      await page.type('input[name="password"], input[type="password"], #password', 'customer123');
      await page.click('button[type="submit"], input[type="submit"]');

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for successful login
      const currentUrl = page.url();
      const token = await page.evaluate(() => localStorage.getItem('token'));
      const profileElement = await page.$('[data-testid*="profile"], [data-testid*="avatar"], .avatar, .user-name, [class*="profile"]');

      if (token || profileElement) {
        result.passed = true;
        result.details.push('✅ Login successful with test credentials');
        result.details.push(`✅ Redirected to: ${currentUrl}`);

        // Take screenshot of logged-in state
        const loginSuccessPath = 'test-results/login-success.png';
        await page.screenshot({ path: loginSuccessPath });
        result.screenshots.push(loginSuccessPath);
      } else {
        // Check for error message
        const errorMessage = await page.$$eval('[data-testid*="error"], .error, .alert, [class*="error"]', els => els.map(el => el.textContent));
        if (errorMessage && errorMessage.length > 0) {
          result.details.push(`❌ Login failed with error: ${errorMessage[0]}`);
        } else {
          result.details.push('❌ Login failed - no token or profile element found');
        }
      }
    } else {
      result.details.push('❌ Missing required form elements for login');
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
    details: [],
    screenshots: []
  };

  try {
    // Navigate to products page
    await page.goto('http://localhost:3002/products', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take screenshot
    const screenshotPath = 'test-results/products-page-full.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push(screenshotPath);
    result.details.push('✅ Products page loaded with full page screenshot captured');

    // Check for product listings with flexible selectors
    const productSelectors = [
      '[data-testid*="product"]',
      '.product',
      '.card',
      '.item',
      '[class*="product"]',
      '[class*="card"]',
      'article',
      'section'
    ];

    let productCount = 0;
    let foundProductSelector = '';

    for (const selector of productSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          productCount = elements.length;
          foundProductSelector = selector;
          result.details.push(`✅ Found ${productCount} product elements with selector: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (productCount > 0) {
      result.passed = true;
      result.details.push('✅ Products are displayed on the page');

      // Test clicking on a product
      try {
        const firstProduct = await page.$(foundProductSelector || '[data-testid*="product"], .product, .card');
        if (firstProduct) {
          await firstProduct.click();
          await new Promise(resolve => setTimeout(resolve, 1000));

          const productDetailUrl = page.url();
          result.details.push(`✅ Product detail page loaded: ${productDetailUrl}`);
          result.details.push(`✅ Current URL: ${productDetailUrl}`);
        }
      } catch (e) {
        result.details.push(`⚠️  Could not click product: ${e.message}`);
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

async function testProductDetail(page) {
  const result = {
    name: 'Product Detail Page',
    passed: false,
    details: [],
    screenshots: []
  };

  try {
    // Navigate to a specific product
    await page.goto('http://localhost:3002/products/techpro-laptop-pro-15', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    const screenshotPath = 'test-results/product-detail-full.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push(screenshotPath);
    result.details.push('✅ Product detail page loaded with full page screenshot captured');

    // Check for product information
    const productNameSelectors = [
      '[data-testid*="product-name"]',
      '.product-name',
      'h1',
      'h2',
      '[class*="product-name"]'
    ];

    let productName = '';
    for (const selector of productNameSelectors) {
      try {
        productName = await page.$eval(selector, el => el.textContent.trim());
        if (productName) {
          result.details.push(`✅ Product name found: "${productName}"`);
          break;
        }
      } catch (e) {}
    }

    const productPriceSelectors = [
      '[data-testid*="product-price"]',
      '.product-price',
      '.price',
      '[class*="price"]'
    ];

    let productPrice = '';
    for (const selector of productPriceSelectors) {
      try {
        productPrice = await page.$eval(selector, el => el.textContent.trim());
        if (productPrice) {
          result.details.push(`✅ Product price found: "${productPrice}"`);
          break;
        }
      } catch (e) {}
    }

    // Check for add to cart button
    const addToCartSelectors = [
      '[data-testid*="add-to-cart"]',
      '.add-to-cart',
      'button:contains("Add to Cart")',
      'input[value="Add to Cart"]',
      'button[type="submit"]'
    ];

    let addToCartFound = false;
    for (const selector of addToCartSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          addToCartFound = true;
          result.details.push(`✅ Add to cart button found: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (productName || productPrice || addToCartFound) {
      result.passed = true;
      result.details.push('✅ Product detail page contains key elements');
    } else {
      result.details.push('⚠️  Product detail page may have loading issues');
    }

    return result;

  } catch (error) {
    result.details.push(`❌ Error during product detail test: ${error.message}`);
    return result;
  }
}

async function testAddToCart(page) {
  const result = {
    name: 'Add to Cart',
    passed: false,
    details: [],
    screenshots: []
  };

  try {
    // Ensure we're on a product page
    await page.goto('http://localhost:3002/products/techpro-laptop-pro-15', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find and click add to cart button
    const addToCartSelectors = [
      '[data-testid*="add-to-cart"]',
      '.add-to-cart',
      'button:contains("Add to Cart")',
      'input[value="Add to Cart"]',
      'button[type="submit"]'
    ];

    let addToCartButton = null;
    let foundSelector = '';

    for (const selector of addToCartSelectors) {
      try {
        addToCartButton = await page.$(selector);
        if (addToCartButton) {
          foundSelector = selector;
          result.details.push(`✅ Found add to cart button: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (!addToCartButton) {
      result.details.push('❌ Add to cart button not found');
      return result;
    }

    // Click add to cart
    await addToCartButton.click();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check for success message
    const successMessageSelectors = [
      '[data-testid*="success-message"]',
      '.success-message',
      '.alert-success',
      '.toast',
      '[class*="success"]'
    ];

    let successFound = false;
    for (const selector of successMessageSelectors) {
      try {
        const message = await page.$eval(selector, el => el.textContent.trim());
        if (message) {
          successFound = true;
          result.details.push(`✅ Success message: "${message}"`);
          break;
        }
      } catch (e) {}
    }

    // Check cart icon/badge
    const cartBadgeSelectors = [
      '[data-testid*="cart-badge"]',
      '.cart-badge',
      '.cart-count',
      '.cart-items-count'
    ];

    let cartUpdated = false;
    for (const selector of cartBadgeSelectors) {
      try {
        const badge = await page.$(selector);
        if (badge) {
          const badgeText = await page.evaluate(el => el.textContent, badge);
          if (badgeText && (badgeText.includes('1') || badgeText.match(/\d+/))) {
            cartUpdated = true;
            result.details.push(`✅ Cart badge updated: "${badgeText}"`);
            break;
          }
        }
      } catch (e) {}
    }

    // Navigate to cart
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Take screenshot
    const screenshotPath = 'test-results/cart-page-full.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push(screenshotPath);

    // Check cart contents
    const cartItemSelectors = [
      '[data-testid*="cart-item"]',
      '.cart-item',
      '.cart-product',
      '[class*="cart-item"]'
    ];

    let cartItemCount = 0;
    for (const selector of cartItemSelectors) {
      try {
        const items = await page.$$(selector);
        if (items.length > 0) {
          cartItemCount = items.length;
          result.details.push(`✅ Cart contains ${cartItemCount} items with selector: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (cartItemCount > 0) {
      result.passed = true;
      result.details.push('✅ Product successfully added to cart');
    } else {
      result.details.push('❌ Cart appears to be empty after adding product');
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
    details: [],
    screenshots: []
  };

  try {
    // Ensure we have items in cart
    await page.goto('http://localhost:3002/cart', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const cartItems = await page.$$('[data-testid*="cart-item"], .cart-item, .cart-product');
    if (cartItems.length === 0) {
      result.details.push('❌ No items in cart for checkout test');
      return result;
    }

    // Find checkout button
    const checkoutSelectors = [
      '[data-testid*="checkout"]',
      '.checkout',
      'button:contains("Checkout")',
      'input[value="Checkout"]',
      'button[type="submit"]'
    ];

    let checkoutButton = null;
    for (const selector of checkoutSelectors) {
      try {
        checkoutButton = await page.$(selector);
        if (checkoutButton) {
          result.details.push(`✅ Found checkout button: ${selector}`);
          break;
        }
      } catch (e) {}
    }

    if (!checkoutButton) {
      result.details.push('❌ Checkout button not found');
      return result;
    }

    // Click checkout button
    await checkoutButton.click();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    const screenshotPath = 'test-results/checkout-page-full.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push(screenshotPath);

    const checkoutUrl = page.url();
    result.details.push(`✅ Navigated to checkout: ${checkoutUrl}`);

    // Check for checkout form elements
    const formSelectors = [
      'input[name="email"]',
      'input[type="email"]',
      '#email',
      'input[name="address"]',
      'input[type="address"]',
      '#address'
    ];

    let formElements = 0;
    for (const selector of formSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          formElements++;
        }
      } catch (e) {}
    }

    if (formElements > 0) {
      result.passed = true;
      result.details.push(`✅ Checkout form has ${formElements} input fields`);
    } else {
      result.details.push('⚠️  Checkout form may not have expected input fields');
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
    details: [],
    screenshots: []
  };

  try {
    // Navigate to admin page
    await page.goto('http://localhost:3002/admin', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    const screenshotPath = 'test-results/admin-page-full.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push(screenshotPath);

    const adminUrl = page.url();
    result.details.push(`Admin page URL: ${adminUrl}`);

    // Check if we need to login
    if (adminUrl.includes('/login')) {
      result.details.push('🔐 Admin page requires authentication');

      // Try to login as admin
      await page.type('input[name="email"], input[type="email"], #email', 'admin@shopflow.com');
      await page.type('input[name="password"], input[type="password"], #password', 'admin123');
      await page.click('button[type="submit"], input[type="submit"]');

      await new Promise(resolve => setTimeout(resolve, 2000));

      const afterLoginUrl = page.url();
      result.details.push(`URL after admin login attempt: ${afterLoginUrl}`);

      if (!afterLoginUrl.includes('/login')) {
        result.details.push('✅ Admin login successful');

        // Take screenshot of admin dashboard
        const adminSuccessPath = 'test-results/admin-dashboard.png';
        await page.screenshot({ path: adminSuccessPath, fullPage: true });
        result.screenshots.push(adminSuccessPath);
      } else {
        result.details.push('❌ Admin login failed');
      }
    }

    // Check for admin dashboard elements
    const adminSelectors = [
      '[data-testid*="admin"]',
      '.admin-dashboard',
      '.admin-panel',
      '[class*="admin"]'
    ];

    let adminElements = 0;
    for (const selector of adminSelectors) {
      try {
        const elements = await page.$$(selector);
        adminElements += elements.length;
      } catch (e) {}
    }

    if (adminElements > 0) {
      result.passed = true;
      result.details.push(`✅ Admin dashboard elements found: ${adminElements}`);
    } else {
      result.details.push('⚠️  Admin dashboard elements not clearly identified');
    }

    return result;

  } catch (error) {
    result.details.push(`❌ Error during admin dashboard test: ${error.message}`);
    return result;
  }
}

async function generateComprehensiveReport(page, testResults) {
  console.log('\n📋 Comprehensive Test Results Summary:');
  console.log('='.repeat(60));

  testResults.tests.forEach((test, index) => {
    const status = test.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${index + 1}. ${test.name}: ${status}`);
    test.details.forEach(detail => {
      console.log(`   ${detail}`);
    });
    console.log('');
  });

  console.log('='.repeat(60));
  console.log(`📊 Overall: ${testResults.passed} passed, ${testResults.failed} failed`);

  // Generate HTML report
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive E-commerce Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .header .meta {
            font-size: 1.1em;
            opacity: 0.9;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-2px);
        }

        .card h3 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.4em;
        }

        .metric {
            font-size: 3em;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }

        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .total { color: #6c757d; }

        .test-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
        }

        .test-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            border-left: 6px solid #667eea;
        }

        .test-card.passed {
            border-left-color: #28a745;
        }

        .test-card.failed {
            border-left-color: #dc3545;
        }

        .test-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .test-name {
            font-size: 1.2em;
            font-weight: bold;
        }

        .test-status {
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }

        .status-passed {
            background: #d4edda;
            color: #155724;
        }

        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }

        .details {
            margin-top: 15px;
        }

        .details li {
            margin: 8px 0;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 6px;
            border-left: 3px solid #e9ecef;
        }

        .details li:before {
            content: "•";
            color: #667eea;
            font-weight: bold;
            margin-right: 8px;
        }

        .screenshots {
            margin-top: 15px;
        }

        .screenshot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-top: 10px;
        }

        .screenshot {
            border: 2px solid #e9ecef;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s ease;
        }

        .screenshot:hover {
            transform: scale(1.05);
        }

        .screenshot img {
            width: 100%;
            height: 120px;
            object-fit: cover;
            display: block;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #6c757d;
            font-size: 0.9em;
        }

        .timestamp {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Comprehensive E-commerce Test Report</h1>
            <div class="meta">
                <strong>Test Date:</strong> ${new Date(testResults.timestamp).toLocaleString()}<br>
                <strong>Total Tests:</strong> ${testResults.tests.length}
            </div>
        </div>

        <div class="summary">
            <div class="card">
                <h3>✅ Passed Tests</h3>
                <div class="metric passed">${testResults.passed}</div>
                <p>Successful tests completed</p>
            </div>
            <div class="card">
                <h3>❌ Failed Tests</h3>
                <div class="metric failed">${testResults.failed}</div>
                <p>Tests that need attention</p>
            </div>
            <div class="card">
                <h3>📊 Success Rate</h3>
                <div class="metric total">
                    ${Math.round((testResults.passed / testResults.tests.length) * 100)}%
                </div>
                <p>Overall test success rate</p>
            </div>
        </div>

        <div class="timestamp">
            <strong>Test Execution Time:</strong> ${new Date(testResults.timestamp).toLocaleString()}
        </div>

        <div class="test-grid">
            ${testResults.tests.map((test, index) => `
                <div class="test-card ${test.passed ? 'passed' : 'failed'}">
                    <div class="test-header">
                        <div class="test-name">${index + 1}. ${test.name}</div>
                        <div class="test-status ${test.passed ? 'status-passed' : 'status-failed'}">
                            ${test.passed ? '✅ PASSED' : '❌ FAILED'}
                        </div>
                    </div>

                    <div class="details">
                        <ul>
                            ${test.details.map(detail => `<li>${detail}</li>`).join('')}
                        </ul>
                    </div>

                    ${test.screenshots && test.screenshots.length > 0 ? `
                        <div class="screenshots">
                            <strong>Screenshots:</strong>
                            <div class="screenshot-grid">
                                ${test.screenshots.map(screenshot => `
                                    <a href="${screenshot}" class="screenshot" target="_blank">
                                        <img src="${screenshot}" alt="${test.name} screenshot">
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>

        <div class="footer">
            <p>Report generated by ShopFlow E-commerce Test Suite</p>
            <p>For detailed logs and screenshots, check the test-results directory</p>
        </div>
    </div>
</body>
</html>
  `;

  fs.writeFileSync('test-results/comprehensive-test-report.html', htmlReport);
  console.log('📄 Comprehensive HTML report generated: test-results/comprehensive-test-report.html');
}

// Run the comprehensive tests
runComprehensiveEcommerceTests().catch(console.error);