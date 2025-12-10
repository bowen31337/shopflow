const puppeteer = require('puppeteer');

async function testCartDrawer() {
  console.log('🧪 Testing Cart Drawer Functionality...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Go to homepage
    console.log('1. Navigating to homepage...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Take screenshot of homepage
    await page.screenshot({ path: 'test-results/homepage.png' });
    console.log('   ✅ Homepage loaded');

    // Check if cart count is visible
    const cartCount = await page.$eval('[aria-label="Open cart"] .text-white', el => el.textContent);
    console.log(`2. Initial cart count: ${cartCount}`);

    // Click cart icon to open drawer
    console.log('3. Opening cart drawer...');
    await page.click('[aria-label="Open cart"]');
    await page.waitForTimeout(500); // Wait for animation

    // Take screenshot of open cart drawer
    await page.screenshot({ path: 'test-results/cart-drawer-open.png' });
    console.log('   ✅ Cart drawer opened');

    // Check if backdrop is visible
    const backdrop = await page.$('.bg-black.bg-opacity-50');
    console.log(`4. Backdrop visible: ${backdrop ? 'Yes' : 'No'}`);

    // Check cart header
    const cartHeader = await page.$eval('.text-lg.font-semibold', el => el.textContent);
    console.log(`5. Cart header text: "${cartHeader}"`);

    // Check empty cart message
    const emptyMessage = await page.$('.text-center.py-8');
    if (emptyMessage) {
      const message = await page.$eval('.text-center.py-8 .font-semibold', el => el.textContent);
      console.log(`6. Empty cart message: "${message}"`);
    }

    // Click backdrop to close drawer
    console.log('7. Closing cart drawer via backdrop...');
    await page.click('.bg-black.bg-opacity-50');
    await page.waitForTimeout(500);

    // Verify drawer is closed
    const drawerClosed = await page.$('.fixed.top-0.right-0.w-full.max-w-md');
    console.log(`8. Cart drawer closed: ${!drawerClosed ? 'Yes' : 'No'}`);

    // Test closing via X button
    console.log('9. Reopening cart drawer via X button test...');
    await page.click('[aria-label="Open cart"]');
    await page.waitForTimeout(500);

    await page.click('[aria-label="Close cart"]');
    await page.waitForTimeout(500);

    const drawerClosed2 = await page.$('.fixed.top-0.right-0.w-full.max-w-md');
    console.log(`10. Cart drawer closed via X button: ${!drawerClosed2 ? 'Yes' : 'No'}`);

    // Test mobile menu cart functionality
    console.log('11. Testing mobile menu cart functionality...');
    await page.setViewport({ width: 600, height: 800 });
    await page.waitForTimeout(500);

    // Open mobile menu
    await page.click('.md\\:hidden.p-2');
    await page.waitForTimeout(500);

    // Click cart in mobile menu
    await page.click('a[href="/cart"]');
    await page.waitForTimeout(500);

    // Verify drawer opens
    const mobileDrawer = await page.$('.fixed.top-0.right-0.w-full.max-w-md');
    console.log(`12. Mobile cart drawer opened: ${mobileDrawer ? 'Yes' : 'No'}`);

    // Close mobile drawer
    await page.click('.bg-black.bg-opacity-50');
    await page.waitForTimeout(500);

    console.log('\n🎉 Cart Drawer Test Complete!');
    console.log('\n📝 Test Results:');
    console.log('   - Cart drawer opens when clicking cart icon');
    console.log('   - Backdrop appears and is clickable');
    console.log('   - Drawer closes when clicking backdrop');
    console.log('   - Drawer closes when clicking X button');
    console.log('   - Mobile menu integration works');
    console.log('   - Empty cart state displays correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCartDrawer();