const puppeteer = require('puppeteer');

async function testInfiniteScroll() {
  console.log('🚀 Starting infinite scroll test...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to products page
    console.log('📦 Navigating to products page...');
    await page.goto('http://localhost:5173/products', { waitUntil: 'networkidle2' });

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .bg-white.rounded-lg', { timeout: 10000 });

    console.log('✅ Products loaded successfully');

    // Check initial products count
    const initialProducts = await page.$$('[data-testid="product-card"], .bg-white.rounded-lg');
    console.log(`📊 Initial products count: ${initialProducts.length}`);

    // Enable infinite scroll toggle
    console.log('🔄 Enabling infinite scroll...');
    const infiniteScrollCheckbox = await page.$('input[type="checkbox"]'); // Find the infinite scroll checkbox
    if (infiniteScrollCheckbox) {
      await infiniteScrollCheckbox.click();
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ Infinite scroll enabled');
    } else {
      console.log('⚠️  Infinite scroll checkbox not found, continuing...');
    }

    // Verify infinite scroll is enabled
    const isChecked = await page.evaluate(() => {
      const checkbox = document.querySelector('input[type="checkbox"]');
      return checkbox ? checkbox.checked : false;
    });

    if (isChecked) {
      console.log('✅ Infinite scroll toggle is checked');
    } else {
      console.log('❌ Infinite scroll toggle is not checked');
    }

    // Scroll to bottom to trigger infinite scroll
    console.log('⬇️  Scrolling to bottom...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for loading more products
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check for loading indicator
    const loadingText = await page.evaluate(() => {
      const loadingElement = document.querySelector('.h-10.flex.items-center.justify-center');
      return loadingElement ? loadingElement.textContent.trim() : '';
    });

    console.log(`📄 Loading text: "${loadingText}"`);

    // Wait for more products to load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check final products count
    const finalProducts = await page.$$('[data-testid="product-card"], .bg-white.rounded-lg');
    console.log(`📊 Final products count: ${finalProducts.length}`);

    // Verify more products were loaded
    if (finalProducts.length > initialProducts.length) {
      console.log('✅ Infinite scroll working: More products loaded!');
    } else {
      console.log('❌ Infinite scroll not working: No additional products loaded');
    }

    // Test scrolling again
    console.log('⬇️  Scrolling again...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const afterSecondScroll = await page.$$('[data-testid="product-card"], .bg-white.rounded-lg');
    console.log(`📊 Products after second scroll: ${afterSecondScroll.length}`);

    if (afterSecondScroll.length > finalProducts.length) {
      console.log('✅ Second scroll successful: More products loaded!');
    } else {
      console.log('ℹ️  Second scroll: No new products (may have reached end)');
    }

    // Test pagination is hidden when infinite scroll is enabled
    const paginationVisible = await page.evaluate(() => {
      const pagination = document.querySelector('.mt-8 .pagination');
      return pagination ? true : false;
    });

    if (!paginationVisible) {
      console.log('✅ Pagination correctly hidden when infinite scroll is enabled');
    } else {
      console.log('❌ Pagination should be hidden when infinite scroll is enabled');
    }

    // Test infinite scroll toggle off
    console.log('🔄 Disabling infinite scroll...');
    if (infiniteScrollCheckbox) {
      await infiniteScrollCheckbox.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Verify pagination is now visible
    const paginationVisibleAfter = await page.evaluate(() => {
      const pagination = document.querySelector('.mt-8 .pagination');
      return pagination ? true : false;
    });

    if (paginationVisibleAfter) {
      console.log('✅ Pagination visible when infinite scroll is disabled');
    } else {
      console.log('❌ Pagination should be visible when infinite scroll is disabled');
    }

    console.log('\n🎉 Infinite scroll test completed!');
    return {
      success: true,
      initialProducts: initialProducts.length,
      finalProducts: finalProducts.length,
      afterSecondScroll: afterSecondScroll.length,
      infiniteScrollEnabled: isChecked
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// Run the test
testInfiniteScroll()
  .then((result) => {
    console.log('\n📊 Test Results:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.finalProducts > result.initialProducts) {
      console.log('\n✅ INFINITE SCROLL TEST PASSED!');
      process.exit(0);
    } else {
      console.log('\n❌ INFINITE SCROLL TEST FAILED!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });