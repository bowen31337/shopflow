const puppeteer = require('puppeteer');

async function checkPageContent() {
  console.log('Checking Login Page Content...\n');

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

    // Navigate to login page
    console.log('1. Loading login page...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });

    // Get page content
    const pageContent = await page.content();
    console.log('2. Page content loaded');

    // Find lines containing 'google'
    const lines = pageContent.split('\n');
    console.log('\n3. Lines containing "google":');
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes('google')) {
        console.log(`   Line ${index + 1}: ${line.trim()}`);
      }
    });

    // Look for button elements
    const buttons = await page.$$eval('button', buttons =>
      buttons.map((btn, index) => ({
        index,
        text: btn.textContent.trim(),
        id: btn.id,
        className: btn.className,
        onclick: btn.getAttribute('onclick'),
        type: btn.type
      }))
    );

    console.log('\n4. All buttons found:');
    buttons.forEach(btn => {
      console.log(`   Button: "${btn.text}" (ID: ${btn.id || 'N/A'}, Class: ${btn.className || 'N/A'})`);
      if (btn.text.toLowerCase().includes('google')) {
        console.log('   ✓ This button contains "google"!');
      }
    });

    // Look for any clickable elements
    const clickableElements = await page.$$eval('a, button, input[type="button"], input[type="submit"]', elements =>
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

    console.log('\n5. Clickable elements:');
    clickableElements.forEach(el => {
      const displayText = el.tagName === 'A' ? el.href : (el.tagName === 'INPUT' ? el.value : el.text);
      console.log(`   ${el.tagName}: "${displayText}" (${el.id || 'no-id'})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

checkPageContent().catch(console.error);