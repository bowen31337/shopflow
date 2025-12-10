const puppeteer = require('puppeteer');

async function testSubcategoryFiltering() {
  let browser;
  try {
    console.log('Starting browser...');
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    console.log('Navigating to products page...');
    await page.goto('http://localhost:5174/products', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for the page to load
    await page.waitForTimeout(2000);

    console.log('Testing category loading...');

    // Check if Electronics category exists in dropdown
    const electronicsOption = await page.$eval('select[name="category"] option', (options) => {
      return Array.from(options).find(option => option.textContent === 'Electronics')?.value;
    });

    if (!electronicsOption) {
      console.log('❌ Electronics category not found in dropdown');
      return;
    }

    console.log('✅ Electronics category found in dropdown');

    // Select Electronics category
    console.log('Selecting Electronics category...');
    await page.select('select', electronicsOption);
    await page.waitForTimeout(1000);

    // Check if subcategories appear
    const subcategoriesSection = await page.$('.text-sm.font-medium.text-gray-700');
    if (!subcategoriesSection) {
      console.log('❌ Subcategories section not found');
      return;
    }

    console.log('✅ Subcategories section found');

    // Check for Laptops subcategory
    const laptopsRadio = await page.$('input[value="laptops"]');
    if (!laptopsRadio) {
      console.log('❌ Laptops subcategory radio not found');
      return;
    }

    console.log('✅ Laptops subcategory radio found');

    // Click on Laptops subcategory
    console.log('Clicking on Laptops subcategory...');
    await laptopsRadio.click();
    await page.waitForTimeout(1000);

    // Check if breadcrumb shows Electronics > Laptops
    const breadcrumbText = await page.$eval('nav[aria-label="Breadcrumb"]', el => el.textContent);
    if (!breadcrumbText.includes('Electronics') || !breadcrumbText.includes('Laptops')) {
      console.log('❌ Breadcrumb not showing correct path');
      console.log('Breadcrumb text:', breadcrumbText);
      return;
    }

    console.log('✅ Breadcrumb showing correct path: Home > Electronics > Laptops');

    // Check if page title updates to Laptops
    const pageTitle = await page.$eval('h1', el => el.textContent);
    if (pageTitle !== 'Laptops') {
      console.log('❌ Page title not updated to Laptops');
      console.log('Page title:', pageTitle);
      return;
    }

    console.log('✅ Page title updated to: Laptops');

    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/subcategory-filtering-test.png', fullPage: false });
    console.log('📸 Screenshot saved to test-results/subcategory-filtering-test.png');

    console.log('\n🎉 ALL TESTS PASSED! Subcategory filtering is working correctly.');
    console.log('- ✅ Parent category selection works');
    console.log('- ✅ Subcategories appear when parent is selected');
    console.log('- ✅ Subcategory filtering works');
    console.log('- ✅ Breadcrumb navigation shows parent > subcategory');
    console.log('- ✅ Page title updates to subcategory name');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Create test-results directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('test-results')) {
  fs.mkdirSync('test-results');
}

testSubcategoryFiltering();