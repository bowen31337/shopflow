const puppeteer = require('puppeteer');

async function simpleVerification() {
  console.log('Simple Google Login Verification...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,  // Run headless first to test
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Navigate to login page
    console.log('1. Loading login page...');
    await page.goto('http://localhost:3002/login', { waitUntil: 'networkidle2' });

    // Get page content
    const pageContent = await page.content();
    console.log('2. Page content loaded');

    // Look for Google login elements in the HTML
    const googlePatterns = [
      /google/i,
      /oauth/i,
      /Continue with Google/i,
      /Sign in with Google/i,
      /Login with Google/i
    ];

    console.log('\n3. Searching for Google login patterns...');
    googlePatterns.forEach(pattern => {
      if (pattern.test(pageContent)) {
        console.log(`   ✓ Found pattern: ${pattern.source}`);
      } else {
        console.log(`   ✗ Pattern not found: ${pattern.source}`);
      }
    });

    // Try to find Google login button by text
    const googleButton = await page.$('button');
    if (googleButton) {
      const buttonText = await page.evaluate(btn => btn.textContent.trim(), googleButton);
      console.log(`\n4. Sample button text: "${buttonText}"`);

      if (buttonText.toLowerCase().includes('google')) {
        console.log('   ✓ Found Google login button!');
      }
    }

    // Try to find any form or link that might be for Google login
    const forms = await page.$$eval('form', forms =>
      forms.map((form, index) => ({
        index,
        action: form.action,
        method: form.method,
        id: form.id,
        className: form.className
      }))
    );

    console.log('\n5. Forms found:');
    forms.forEach(form => {
      console.log(`   Form ${form.index}: action=${form.action}, method=${form.method}`);
      if (form.action && form.action.includes('google')) {
        console.log('   ✓ Found Google-related form!');
      }
    });

    // Take screenshot
    await page.screenshot({ path: 'login-page-simple.png', fullPage: true });
    console.log('\n   ✓ Screenshot saved: login-page-simple.png');

    // Try to find any element containing 'google'
    const googleLinks = await page.$$eval('a', links =>
      links.filter(link => /google/i.test(link.textContent || link.href))
        .map(link => ({
          text: link.textContent.trim(),
          href: link.href
        }))
    );

    console.log('\n6. Google-related links:');
    if (googleLinks.length > 0) {
      googleLinks.forEach(link => {
        console.log(`   ✓ "${link.text}" -> ${link.href}`);
      });
    } else {
      console.log('   ✗ No Google-related links found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

simpleVerification().catch(console.error);