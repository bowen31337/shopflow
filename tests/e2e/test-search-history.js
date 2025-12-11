import puppeteer from 'puppeteer';

async function testSearchHistory() {
  console.log('🧪 Testing Search History Feature');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to homepage
    console.log('1. Navigating to homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Wait for page to load
    await page.waitForSelector('input[placeholder="Search products..."]', { timeout: 10000 });
    console.log('✓ Homepage loaded successfully');

    // Test 1: Click on search bar without typing - should show search history (empty initially)
    console.log('2. Testing search history when clicking search bar without typing...');
    const searchInput = await page.$('input[placeholder="Search products..."]');

    // Click on search bar to focus
    await searchInput.click();
    await page.waitForTimeout(500);

    // Check if search history dropdown appears (should not for empty history)
    const searchHistoryDropdown = await page.$('.search-history-container');
    if (!searchHistoryDropdown) {
      console.log('✓ No search history dropdown shown when history is empty');
    } else {
      console.log('✗ Search history dropdown should not appear when history is empty');
      return false;
    }

    // Test 2: Perform first search
    console.log('3. Performing first search for "phone"...');
    await searchInput.click();
    await page.keyboard.type('phone');
    await page.keyboard.press('Enter');

    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);

    // Verify we're on search results page
    const url = page.url();
    if (url.includes('search=phone')) {
      console.log('✓ First search completed and URL updated');
    } else {
      console.log('✗ URL should contain search parameter');
      return false;
    }

    // Test 3: Perform second search
    console.log('4. Performing second search for "laptop"...');
    const searchInput2 = await page.$('input[placeholder="Search products..."]');
    await searchInput2.click();
    await page.keyboard.type('laptop');
    await page.keyboard.press('Enter');

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);

    const url2 = page.url();
    if (url2.includes('search=laptop')) {
      console.log('✓ Second search completed and URL updated');
    } else {
      console.log('✗ URL should contain search parameter');
      return false;
    }

    // Test 4: Click search bar without typing to show search history
    console.log('5. Testing search history display...');
    const searchInput3 = await page.$('input[placeholder="Search products..."]');
    await searchInput3.click();
    await page.waitForTimeout(500);

    // Check if search history dropdown appears
    const searchHistoryDropdown2 = await page.$('.search-history-container');
    if (searchHistoryDropdown2) {
      console.log('✓ Search history dropdown appears');

      // Check if it contains recent searches
      const historyItems = await page.$$eval('.search-history-container .px-4.py-2.hover\\:bg-gray-100', elements =>
        elements.map(el => el.textContent.trim())
      );

      if (historyItems.length > 0) {
        console.log('✓ Search history contains items:', historyItems);
      } else {
        console.log('✗ Search history should contain recent searches');
        return false;
      }
    } else {
      console.log('✗ Search history dropdown should appear when history exists');
      return false;
    }

    // Test 5: Click on a previous search to re-execute it
    console.log('6. Testing search history item selection...');
    const firstHistoryItem = await page.$('.search-history-container button');
    if (firstHistoryItem) {
      await firstHistoryItem.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(1000);

      const url3 = page.url();
      if (url3.includes('search=')) {
        console.log('✓ Search history item click re-executes search');
      } else {
        console.log('✗ Search history item should trigger search');
        return false;
      }
    } else {
      console.log('✗ Search history should have clickable items');
      return false;
    }

    // Test 6: Test clicking outside closes search history
    console.log('7. Testing click outside to close search history...');
    const searchInput4 = await page.$('input[placeholder="Search products..."]');
    await searchInput4.click();
    await page.waitForTimeout(500);

    const searchHistoryDropdown3 = await page.$('.search-history-container');
    if (searchHistoryDropdown3) {
      // Click outside
      await page.click('body');
      await page.waitForTimeout(500);

      const searchHistoryDropdown4 = await page.$('.search-history-container');
      if (!searchHistoryDropdown4) {
        console.log('✓ Search history closes when clicking outside');
      } else {
        console.log('✗ Search history should close when clicking outside');
        return false;
      }
    }

    // Test 7: Test mobile view
    console.log('8. Testing mobile responsive view...');
    await page.setViewport({ width: 600, height: 800 });

    // Open mobile menu
    const menuButton = await page.$('button[aria-label="Open cart"]');
    if (!menuButton) {
      // Try to find mobile menu button
      const mobileMenuButton = await page.$('[class*="md:hidden"]');
      if (mobileMenuButton) {
        await mobileMenuButton.click();
        await page.waitForTimeout(500);

        // Find search input in mobile menu
        const mobileSearch = await page.$('input[placeholder="Search products..."]');
        if (mobileSearch) {
          await mobileSearch.click();
          await page.waitForTimeout(500);

          const mobileSearchHistory = await page.$('.search-history-container');
          if (mobileSearchHistory) {
            console.log('✓ Search history works in mobile view');
          } else {
            console.log('✗ Search history should work in mobile view');
            return false;
          }
        }
      }
    }

    console.log('\n🎉 All search history tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testSearchHistory()
  .then(success => {
    if (success) {
      console.log('\n✅ Search History Feature: PASSED');
      process.exit(0);
    } else {
      console.log('\n❌ Search History Feature: FAILED');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test execution error:', error);
    process.exit(1);
  });