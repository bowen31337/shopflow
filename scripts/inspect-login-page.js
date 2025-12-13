const puppeteer = require('puppeteer');

async function inspectLoginPage() {
  console.log('Inspecting Login Page...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-site-isolation-trials'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to login page
    console.log('1. Loading login page...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Take screenshot
    await page.screenshot({ path: 'login-page-inspection.png', fullPage: true });
    console.log('   ✓ Screenshot saved: login-page-inspection.png');

    // Get all buttons on the page
    const buttons = await page.$$eval('button', buttons =>
      buttons.map((btn, index) => ({
        index,
        text: btn.textContent.trim(),
        id: btn.id,
        className: btn.className,
        ariaLabel: btn.getAttribute('aria-label'),
        disabled: btn.disabled,
        style: btn.style.display,
        offsetParent: btn.offsetParent !== null
      }))
    );

    console.log('\n2. Buttons found on page:');
    buttons.forEach((btn, index) => {
      console.log(`   Button ${index + 1}:`);
      console.log(`     Text: "${btn.text}"`);
      console.log(`     ID: ${btn.id || 'N/A'}`);
      console.log(`     Class: ${btn.className || 'N/A'}`);
      console.log(`     Aria-label: ${btn.ariaLabel || 'N/A'}`);
      console.log(`     Disabled: ${btn.disabled}`);
      console.log(`     Visible: ${btn.offsetParent}`);
      console.log(`     ---`);
    });

    // Get all links on the page
    const links = await page.$$eval('a', links =>
      links.map((link, index) => ({
        index,
        text: link.textContent.trim(),
        href: link.href,
        id: link.id,
        className: link.className
      }))
    );

    console.log('\n3. Links found on page:');
    links.forEach((link, index) => {
      console.log(`   Link ${index + 1}:`);
      console.log(`     Text: "${link.text}"`);
      console.log(`     Href: ${link.href || 'N/A'}`);
      console.log(`     ID: ${link.id || 'N/A'}`);
      console.log(`     Class: ${link.className || 'N/A'}`);
      console.log(`     ---`);
    });

    // Look for Google-related elements
    const googleElements = await page.$$eval('[href*="google"], [onclick*="google"], [data-provider="google"], [data-testid*="google"], button[aria-label*="Google"], .google, .oauth, .auth', elements =>
      elements.map((el, index) => ({
        index,
        tagName: el.tagName,
        text: el.textContent.trim(),
        href: el.href || el.getAttribute('href'),
        onclick: el.getAttribute('onclick'),
        id: el.id,
        className: el.className,
        ariaLabel: el.getAttribute('aria-label')
      }))
    );

    console.log('\n4. Google-related elements found:');
    googleElements.forEach((el, index) => {
      console.log(`   Element ${index + 1}:`);
      console.log(`     Tag: ${el.tagName}`);
      console.log(`     Text: "${el.text}"`);
      console.log(`     Href: ${el.href || 'N/A'}`);
      console.log(`     ID: ${el.id || 'N/A'}`);
      console.log(`     Class: ${el.className || 'N/A'}`);
      console.log(`     ---`);
    });

    // Wait for user to manually inspect
    console.log('\n5. Manual inspection...');
    console.log('   The browser will remain open for 30 seconds for manual inspection');
    await new Promise(resolve => setTimeout(resolve, 30000));

  } catch (error) {
    console.error('Error during inspection:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

inspectLoginPage().catch(console.error);