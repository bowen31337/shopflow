const puppeteer = require('puppeteer');

async function inspectCartElements() {
  console.log('🔍 Inspecting Cart Elements...\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Go to homepage
    console.log('1. Navigating to homepage...');
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });

    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage-inspect.png' });

    // Get all buttons
    const buttons = await page.$$eval('button', elements => elements.map(el => ({
      text: el.textContent.trim(),
      ariaLabel: el.getAttribute('aria-label'),
      className: el.className
    })));

    console.log('\n2. All buttons found:');
    console.log(JSON.stringify(buttons, null, 2));

    // Get all links
    const links = await page.$$eval('a', elements => elements.map(el => ({
      text: el.textContent.trim(),
      href: el.getAttribute('href'),
      className: el.className
    })));

    console.log('\n3. All links found:');
    console.log(JSON.stringify(links, null, 2));

    // Look for cart-related elements
    const cartElements = await page.$$eval('*[href="/cart"]', elements => elements.map(el => el.outerHTML));
    console.log('\n4. Cart link elements:', cartElements.length);

    // Look for shop emoji
    const shopEmoji = await page.$$eval('span', elements => {
      return elements.map(el => ({
        text: el.textContent,
        className: el.className
      })).filter(el => el.text.includes('🛒'));
    });
    console.log('\n5. Shop emoji elements:', shopEmoji);

  } catch (error) {
    console.error('❌ Inspection failed:', error.message);
  } finally {
    await browser.close();
  }
}

inspectCartElements();