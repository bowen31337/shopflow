#!/usr/bin/env node

// Simple test script for product review functionality - verifies static elements
const puppeteer = require('puppeteer');

async function testReviewElements() {
  console.log('🧪 Testing ShopFlow Review Elements (Static)...\n');

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to product detail page
    console.log('1. Navigating to product detail page...');
    await page.goto('http://localhost:3000/products/techpro-laptop-pro-15', { waitUntil: 'networkidle2' });

    // Check if product page loaded
    const pageTitle = await page.title();
    if (pageTitle.toLowerCase().includes('shopflow')) {
      console.log('✅ Product page loaded successfully');
    } else {
      console.log('❌ Product page failed to load');
      return false;
    }

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if reviews section exists
    console.log('2. Checking for reviews section...');
    const reviewsSection = await page.$(':text("Customer Reviews")');
    if (reviewsSection) {
      console.log('✅ Reviews section found');
    } else {
      console.log('❌ Reviews section not found');
      return false;
    }

    // Check if existing reviews are displayed
    console.log('3. Checking for existing reviews...');
    const existingReviews = await page.$(':text("reviews")');
    if (existingReviews) {
      console.log('✅ Existing reviews are displayed');
    } else {
      console.log('❌ Existing reviews not found');
      return false;
    }

    // Check if "Login to write a review" message appears for non-authenticated users
    console.log('4. Checking login requirement message...');
    const loginMessage = await page.$(':text("Login")');
    const writeReviewMessage = await page.$(':text("write a review")');
    if (loginMessage || writeReviewMessage) {
      console.log('✅ Login requirement message found (expected for non-authenticated users)');
    } else {
      console.log('⚠️  Login requirement message not found (user might be authenticated)');
    }

    // Take a screenshot for manual verification
    console.log('5. Taking screenshot for verification...');
    await page.screenshot({ path: 'reports/review-form-test.png', fullPage: true });
    console.log('✅ Screenshot saved to reports/review-form-test.png');

    return true;

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testReviewElements()
  .then(success => {
    console.log('\n' + (success ? '🎉 Review elements test completed successfully!' : '💥 Review elements test failed!'));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });