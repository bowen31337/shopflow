#!/usr/bin/env node

// Simple test script for product review functionality - checks page content
const puppeteer = require('puppeteer');

async function testReviewContent() {
  console.log('🧪 Testing ShopFlow Review Content...\n');

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
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Get page content
    const pageContent = await page.content();

    // Check for review-related content
    console.log('2. Checking for review content...');
    const hasReviewSection = pageContent.includes('Customer Reviews');
    const hasReviewCount = pageContent.includes('reviews');
    const hasStars = pageContent.includes('★');

    if (hasReviewSection) {
      console.log('✅ Reviews section found');
    } else {
      console.log('❌ Reviews section not found');
    }

    if (hasReviewCount) {
      console.log('✅ Review count displayed');
    } else {
      console.log('❌ Review count not found');
    }

    if (hasStars) {
      console.log('✅ Star ratings found');
    } else {
      console.log('❌ Star ratings not found');
    }

    // Check for review form or login requirement
    console.log('3. Checking for review form or login requirement...');
    const hasWriteReview = pageContent.includes('Write a Review');
    const hasLoginMessage = pageContent.includes('Login') && pageContent.includes('write a review');

    if (hasWriteReview) {
      console.log('✅ Write a Review button found (user may be authenticated)');
    } else if (hasLoginMessage) {
      console.log('✅ Login requirement message found (expected for non-authenticated users)');
    } else {
      console.log('⚠️  Review form status unclear');
    }

    // Take a screenshot for manual verification
    console.log('4. Taking screenshot for verification...');
    await page.screenshot({ path: 'reports/review-content-test.png', fullPage: true });
    console.log('✅ Screenshot saved to reports/review-content-test.png');

    // Overall success if we found review-related content
    const success = hasReviewSection && (hasReviewCount || hasStars);
    return success;

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
testReviewContent()
  .then(success => {
    console.log('\n' + (success ? '🎉 Review content test completed successfully!' : '💥 Review content test failed!'));
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });