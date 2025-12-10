const puppeteer = require('puppeteer');

async function inspectPage() {
  console.log('🔍 Inspecting Homepage Structure...\n');

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

    // Wait a bit for React to render
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: 'test-results/homepage-inspect.png' });
    console.log('   ✅ Screenshot taken');

    // Get page HTML
    const html = await page.content();
    console.log('\n2. Page HTML structure:');
    console.log('   📊 HTML length:', html.length);

    // Look for shop-related elements
    const shopElements = await page.$$eval('*[href="/cart"]', elements => elements.map(el => el.outerHTML));
    console.log('\n3. Cart link elements found:', shopElements.length);

    // Look for cart icons
    const cartIcons = await page.$$eval('span', elements => {
      return elements.map(el => {
        const text = el.textContent;
        const hasCartEmoji = text.includes('🛒') || text.includes('cart') || text.includes('Cart');
        return { text: text.slice(0, 50), hasCartEmoji, tagName: el.tagName };
      }).filter(el => el.hasCartEmoji);
    });
    console.log('\n4. Cart-related text elements:', cartIcons);

    // Look for all buttons
    const buttons = await page.$$eval('button', elements => elements.map(el => ({
      text: el.textContent.slice(0, 30),
      ariaLabel: el.getAttribute('aria-label')
    })));
    console.log('\n5. Buttons found:', buttons.length);
    console.log('   Buttons:', buttons);

  } catch (error) {
    console.error('❌ Inspection failed:', error.message);
  } finally {
    await browser.close();
  }
}

inspectPage();