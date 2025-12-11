import puppeteer from 'puppeteer';

async function runManualTest() {
  console.log('🧪 Running Manual Search History Test');

  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to our test page
    console.log('1. Loading test page...');
    await page.goto(`file://${process.cwd()}/test-search-history.html`);

    // Wait for page to load
    await page.waitForSelector('#testSearchInput', { timeout: 5000 });
    console.log('✓ Test page loaded');

    // Test 1: Click on search input without typing
    console.log('2. Testing search history display...');
    await page.click('#testSearchInput');
    await page.waitForTimeout(500);

    // Check if history appears
    const historyVisible = await page.$eval('#testSearchHistory', el => el.style.display !== 'none').catch(() => false);

    if (!historyVisible) {
      console.log('✓ No history shown when empty');
    } else {
      console.log('✗ History should not be visible when empty');
      return false;
    }

    // Test 2: Simulate searches
    console.log('3. Simulating searches...');
    await page.click('button[onclick="simulateSearch(\'phone\')"]');
    await page.waitForTimeout(500);

    await page.click('button[onclick="simulateSearch(\'laptop\')"]');
    await page.waitForTimeout(500);

    await page.click('button[onclick="simulateSearch(\'headphones\')"]');
    await page.waitForTimeout(500);

    // Test 3: Check history appears
    console.log('4. Testing history display with items...');
    await page.click('#testSearchInput');
    await page.waitForTimeout(500);

    const historyVisible2 = await page.$eval('#testSearchHistory', el => el.style.display !== 'none').catch(() => false);

    if (historyVisible2) {
      console.log('✓ Search history appears with items');

      // Check history items
      const historyItems = await page.$$eval('#testSearchHistory .history-item', elements =>
        elements.map(el => el.textContent.trim())
      );

      console.log('✓ History items:', historyItems);
    } else {
      console.log('✗ Search history should appear with items');
      return false;
    }

    // Test 4: Test clicking history item
    console.log('5. Testing history item selection...');
    const firstHistoryItem = await page.$('#testSearchHistory .history-item');
    if (firstHistoryItem) {
      await firstHistoryItem.click();
      await page.waitForTimeout(500);

      const inputValue = await page.$eval('#testSearchInput', el => el.value);
      if (inputValue) {
        console.log('✓ History item selected in input:', inputValue);
      } else {
        console.log('✗ History item should populate input');
        return false;
      }
    }

    // Test 5: Test localStorage
    console.log('6. Testing localStorage...');
    await page.click('button[onclick="testLocalStorage()"]');
    await page.waitForTimeout(1000);

    const localStorageResult = await page.$eval('#localStorageResults', el => el.textContent);
    if (localStorageResult.includes('localStorage operations working correctly')) {
      console.log('✓ localStorage operations working');
    } else {
      console.log('✗ localStorage operations failed');
      return false;
    }

    // Test 6: Test click outside
    console.log('7. Testing click outside to close...');
    await page.click('#testSearchInput');
    await page.waitForTimeout(500);

    const historyVisible3 = await page.$eval('#testSearchHistory', el => el.style.display !== 'none').catch(() => false);
    if (historyVisible3) {
      await page.click('body');
      await page.waitForTimeout(500);

      const historyVisible4 = await page.$eval('#testSearchHistory', el => el.style.display !== 'none').catch(() => false);
      if (!historyVisible4) {
        console.log('✓ Search history closes when clicking outside');
      } else {
        console.log('✗ Search history should close when clicking outside');
        return false;
      }
    }

    console.log('\n🎉 All manual tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
runManualTest()
  .then(success => {
    if (success) {
      console.log('\n✅ Manual Search History Test: PASSED');
      process.exit(0);
    } else {
      console.log('\n❌ Manual Search History Test: FAILED');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test execution error:', error);
    process.exit(1);
  });