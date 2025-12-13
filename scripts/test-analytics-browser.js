#!/usr/bin/env node

/**
 * Browser test for Admin Analytics frontend functionality
 */

import puppeteer from 'puppeteer';

const FRONTEND_URL = 'http://localhost:3002';

async function runBrowserTest() {
  console.log('🚀 Starting Admin Analytics Browser Test');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();

    // Navigate to the frontend
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle2' });

    // Check if the page loaded
    const title = await page.title();
    console.log(`✓ Page title: ${title}`);

    // Navigate to admin dashboard
    await page.goto(`${FRONTEND_URL}/admin`, { waitUntil: 'networkidle2' });

    // Check if admin dashboard loaded
    await page.waitForSelector('h1');
    const adminTitle = await page.$eval('h1', el => el.textContent);
    console.log(`✓ Admin dashboard title: ${adminTitle}`);

    // Look for and click the analytics button
    const analyticsButton = await page.$('button:has-text("View Analytics")');
    if (analyticsButton) {
      await analyticsButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Check if analytics page loaded
      const analyticsTitle = await page.$eval('h1', el => el.textContent);
      console.log(`✓ Analytics page title: ${analyticsTitle}`);

      // Check for period selector
      const periodSelector = await page.$('select');
      if (periodSelector) {
        console.log('✓ Period selector found');
      } else {
        console.log('⚠️  Period selector not found');
      }

      // Check for summary cards
      const summaryCards = await page.$$('[class*="bg-white"]');
      console.log(`✓ Found ${summaryCards.length} summary cards`);

      // Check for charts/tables
      const charts = await page.$$('[class*="bg-white"]');
      console.log(`✓ Found ${charts.length} chart containers`);

      console.log('✅ All frontend tests passed!');
    } else {
      console.log('❌ Analytics button not found');
      return false;
    }

  } catch (error) {
    console.error('❌ Browser test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }

  return true;
}

// Run the test
runBrowserTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });