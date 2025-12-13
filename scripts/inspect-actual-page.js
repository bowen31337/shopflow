const puppeteer = require('puppeteer');

async function inspectActualPage() {
  console.log('Inspecting Actual Login Page Elements...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security'
      ]
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });

    // Get all button texts
    const buttons = await page.$$eval('button', buttons =>
      buttons.map((btn, index) => ({
        index,
        text: btn.textContent.trim(),
        id: btn.id,
        className: btn.className,
        disabled: btn.disabled
      }))
    );

    console.log('Buttons found on page:');
    buttons.forEach(btn => {
      console.log(`  Button: "${btn.text}" (ID: ${btn.id || 'N/A'}, Class: ${btn.className || 'N/A'}, Disabled: ${btn.disabled})`);
    });

    // Get all clickable elements
    const clickableElements = await page.$$eval('button, a, input[type="button"], input[type="submit"]', elements =>
      elements.map((el, index) => ({
        index,
        tagName: el.tagName,
        text: el.textContent.trim(),
        href: el.href || '',
        value: el.value || '',
        id: el.id,
        className: el.className
      }))
    );

    console.log('\nClickable elements:');
    clickableElements.forEach(el => {
      const displayText = el.tagName === 'A' ? el.href : (el.tagName === 'INPUT' ? el.value : el.text);
      console.log(`  ${el.tagName}: "${displayText}" (${el.id || 'no-id'})`);
    });

    // Search for elements containing "Google"
    const googleElements = await page.$$eval('*', elements =>
      elements.filter(el => el.textContent && el.textContent.toLowerCase().includes('google'))
        .map(el => ({
          tagName: el.tagName,
          text: el.textContent.trim(),
          id: el.id,
          className: el.className
        }))
    );

    console.log('\nElements containing "Google":');
    googleElements.forEach(el => {
      console.log(`  ${el.tagName}: "${el.text}" (${el.id || 'no-id'})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

inspectActualPage().catch(console.error);