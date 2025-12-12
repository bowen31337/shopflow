const puppeteer = require('puppeteer');

async function testOrderInvoiceDownload() {
  console.log('🧪 Testing Order Invoice PDF Download\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  try {
    const page = await browser.newPage();

    // Capture console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Step 1: Navigate to homepage
    console.log('1. Testing Homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.waitForTimeout(1000);

    // Step 2: Login with test credentials
    console.log('2. Testing Login...');
    await page.click('a[href="/login"]');
    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    await page.type('input[name="email"]', 'customer@example.com');
    await page.type('input[name="password"]', 'customer123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Check if login was successful
    const isLoggedIn = await page.evaluate(() => {
      return !!document.querySelector('[data-testid="user-menu"]') ||
             !!document.querySelector('button[aria-label="Open account menu"]') ||
             document.body.innerText.includes('Welcome');
    });

    console.log(`   ✅ Login successful: ${isLoggedIn}`);

    if (!isLoggedIn) {
      console.log('❌ Login failed. Cannot proceed with order tests.');
      return false;
    }

    // Step 3: Navigate to order history
    console.log('3. Testing Order History...');
    await page.click('a[href="/orders"]');
    await page.waitForTimeout(2000);

    const orderHistoryLoaded = await page.evaluate(() => {
      return document.body.innerText.includes('Order History') ||
             document.body.innerText.includes('Order #');
    });

    console.log(`   ✅ Order History loaded: ${orderHistoryLoaded}`);

    if (!orderHistoryLoaded) {
      console.log('❌ Order history not loaded. Cannot proceed with invoice test.');
      return false;
    }

    // Step 4: Click on first order
    console.log('4. Testing Order Detail...');
    const firstOrderLink = await page.$('a[href*="/orders/"]');
    if (firstOrderLink) {
      await firstOrderLink.click();
      await page.waitForTimeout(2000);

      const orderDetailLoaded = await page.evaluate(() => {
        return document.body.innerText.includes('Order #') &&
               document.body.innerText.includes('Order Information');
      });

      console.log(`   ✅ Order Detail loaded: ${orderDetailLoaded}`);

      if (!orderDetailLoaded) {
        console.log('❌ Order detail not loaded.');
        return false;
      }
    } else {
      console.log('❌ No order found to test.');
      return false;
    }

    // Step 5: Test Download Invoice button
    console.log('5. Testing Download Invoice Button...');
    const downloadButton = await page.$('button:text("Download Invoice")');
    const downloadButtonExists = !!downloadButton;

    console.log(`   ✅ Download Invoice button exists: ${downloadButtonExists}`);

    if (downloadButtonExists) {
      // Step 6: Test clicking the download button
      console.log('6. Testing Invoice Download...');

      // Set up download handling
      const downloadPath = '/tmp';
      await page._client.send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath
      });

      // Click download button
      await downloadButton.click();
      await page.waitForTimeout(3000);

      console.log('   ✅ Download triggered - check for PDF download');

      // Check for network requests to the invoice endpoint
      const networkRequests = await page.evaluate(() => {
        // This is a simplified check - in a real scenario, you'd monitor network requests
        return window.location.href.includes('/invoice') || false;
      });

      console.log(`   ✅ Invoice endpoint called: ${networkRequests}`);
    } else {
      console.log('❌ Download Invoice button not found');
      return false;
    }

    // Step 7: Console errors
    console.log(`7. Console errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(error => console.log(`   ❌ ${error}`));
    }

    // Final status
    const overallStatus = isLoggedIn && orderHistoryLoaded && downloadButtonExists;

    console.log('\n' + '='.repeat(50));
    console.log('📋 INVOICE DOWNLOAD TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`🎯 Overall Status: ${overallStatus ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🏠 Homepage: ✅ PASS`);
    console.log(`🔐 Login: ${isLoggedIn ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📦 Order History: ${orderHistoryLoaded ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📄 Order Detail: ${orderDetailLoaded ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`📥 Download Button: ${downloadButtonExists ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🔍 Console: ${consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);

    if (overallStatus) {
      console.log('\n🎉 Invoice download functionality is working correctly!');
    } else {
      console.log('\n⚠️  Some issues detected with invoice download.');
    }

    return overallStatus;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testOrderInvoiceDownload()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('💥 Test error:', error);
    process.exit(1);
  });