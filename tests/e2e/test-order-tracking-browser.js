import puppeteer from 'puppeteer';

async function testOrderTracking() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    console.log('🚀 Testing Order Tracking with Browser Automation');

    // Navigate to the site
    await page.goto('http://localhost:5173');
    console.log('✅ Site loaded');

    // Check if we're already logged in
    const loginButton = await page.$('a[href="/login"]');
    if (loginButton) {
      // Login first
      await page.goto('http://localhost:5173/login');
      await page.waitForSelector('input[type="email"]');
      await page.type('input[type="email"]', 'customer@example.com');
      await page.type('input[type="password"]', 'customer123');
      await page.click('button[type="submit"]');

      await page.waitForNavigation();
      console.log('✅ Logged in successfully');
    }

    // Navigate to order history
    await page.goto('http://localhost:5173/orders');
    await page.waitForTimeout(1000);

    // Check if we have orders
    const orderLinks = await page.$$('[href^="/orders/"]');
    if (orderLinks.length === 0) {
      console.log('❌ No orders found');
      return;
    }

    console.log(`✅ Found ${orderLinks.length} order(s)`);

    // Click on the first order
    await orderLinks[0].click();
    await page.waitForTimeout(1000);

    // Check if tracking number is displayed
    const trackingNumberText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const trackingElement = elements.find(el =>
        el.textContent.toLowerCase().includes('tracking number')
      );
      return trackingElement ? trackingElement.textContent : null;
    });

    if (trackingNumberText) {
      console.log('✅ Tracking number section found:', trackingNumberText);

      // Check if tracking number is present
      const trackingNumber = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('p, span, div'));
        const trackingElement = elements.find(el =>
          el.textContent && el.textContent.match(/TRK-\d{8}-\d{6}-\d{6}/)
        );
        return trackingElement ? trackingElement.textContent : null;
      });

      if (trackingNumber) {
        console.log('✅ Tracking number found:', trackingNumber);

        // Verify format
        if (/^TRK-\d{8}-\d{6}-\d{6}$/.test(trackingNumber)) {
          console.log('✅ Tracking number format is correct');
        } else {
          console.log('❌ Tracking number format is incorrect');
        }
      } else {
        console.log('ℹ️  No tracking number displayed (order may not be shipped yet)');
      }
    } else {
      console.log('ℹ️  Tracking number section not found');
    }

    // Check order status
    const status = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const statusElement = elements.find(el =>
        el.textContent && (el.textContent.toLowerCase().includes('pending') ||
                         el.textContent.toLowerCase().includes('processing') ||
                         el.textContent.toLowerCase().includes('shipped') ||
                         el.textContent.toLowerCase().includes('delivered'))
      );
      return statusElement ? statusElement.textContent : null;
    });

    console.log('Order status:', status);

    console.log('🎉 Order tracking test completed successfully');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testOrderTracking();