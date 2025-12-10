const puppeteer = require('puppeteer');

async function testSearchFunctionality() {
  console.log('🧪 Testing Search Functionality...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--disable-web-security', '--disable-features=IsolateOrigins', '--disable-site-isolation-trials']
  });

  try {
    const page = await browser.newPage();

    // Navigate to the homepage
    console.log('1. Navigating to homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Wait for the page to load
    await page.waitForSelector('header', { timeout: 10000 });

    // Test 1: Desktop search bar visibility
    console.log('2. Testing desktop search bar visibility...');
    const desktopSearchBar = await page.$('input[placeholder="Search products..."]');
    if (desktopSearchBar) {
      console.log('✅ Desktop search bar is visible');
    } else {
      console.log('❌ Desktop search bar not found');
      return false;
    }

    // Test 2: Mobile menu search bar visibility
    console.log('3. Testing mobile search bar visibility...');
    await page.setViewport({ width: 400, height: 800 });
    await new Promise(resolve => setTimeout(resolve, 500));

    // Click mobile menu button
    const menuButton = await page.$('button[aria-label="Open mobile menu"]');
    if (!menuButton) {
      // Try alternative selector for mobile menu button
      const menuButtons = await page.$$('button');
      for (const btn of menuButtons) {
        const ariaLabel = await page.evaluate(el => el.getAttribute('aria-label'), btn);
        if (ariaLabel === 'Open mobile menu' || (await page.evaluate(el => el.textContent, btn)).includes('menu')) {
          menuButton = btn;
          break;
        }
      }
    }

    if (menuButton) {
      await menuButton.click();
      await new Promise(resolve => setTimeout(resolve, 500));

      const mobileSearchBar = await page.$('input[placeholder="Search products..."]');
      if (mobileSearchBar) {
        console.log('✅ Mobile search bar is visible in menu');
      } else {
        console.log('❌ Mobile search bar not found in menu');
      }
    } else {
      console.log('❌ Mobile menu button not found');
    }

    // Test 3: Search functionality
    console.log('4. Testing search functionality...');
    await page.setViewport({ width: 1200, height: 800 });
    await new Promise(resolve => setTimeout(resolve, 500));

    // Type in search bar and submit
    const searchInput = await page.$('input[placeholder="Search products..."]');
    if (searchInput) {
      await searchInput.click();
      await searchInput.type('shirt');
      await page.keyboard.press('Enter');

      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Check if we're on products page with search parameter
      const currentUrl = page.url();
      if (currentUrl.includes('/products') && currentUrl.includes('search=shirt')) {
        console.log('✅ Search redirects to products page with search parameter');
      } else {
        console.log('❌ Search did not redirect correctly');
        console.log('Current URL:', currentUrl);
        return false;
      }

      // Check if search results are displayed
      await new Promise(resolve => setTimeout(resolve, 1000));
      const productCards = await page.$$('[data-testid="product-card"]');
      if (productCards.length > 0) {
        console.log(`✅ Search results displayed (${productCards.length} products found)`);
      } else {
        console.log('❌ No search results displayed');
      }
    } else {
      console.log('❌ Search input not found');
      return false;
    }

    // Test 4: Search with different keywords
    console.log('5. Testing search with different keywords...');
    await searchInput.click();
    await searchInput.clear();
    await searchInput.type('laptop');
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const laptopUrl = page.url();
    if (laptopUrl.includes('search=laptop')) {
      console.log('✅ Search with different keyword works');
    } else {
      console.log('❌ Search with different keyword failed');
      return false;
    }

    console.log('\n🎉 All search functionality tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

testSearchFunctionality().then(success => {
  process.exit(success ? 0 : 1);
});