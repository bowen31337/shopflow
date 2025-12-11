const puppeteer = require('puppeteer');

async function simpleTest() {
  console.log('🧪 Simple Page Navigation Test\n');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1200,800', '--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    // Test 1: Homepage
    console.log('1. Testing Homepage...');
    await page.goto('http://localhost:5176', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const homepageText = await page.evaluate(() => document.body.innerText);
    console.log('Homepage text includes:', {
      shopflow: homepageText.includes('ShopFlow'),
      products: homepageText.includes('Products'),
      cart: homepageText.includes('Cart'),
      wishlist: homepageText.includes('Wishlist'),
      login: homepageText.includes('Login')
    });

    await page.screenshot({ path: 'test-results/simple-homepage.png' });

    // Test 2: Products Page
    console.log('2. Testing Products Page...');
    await page.click('a[href="/products"]').catch(() => {
      page.goto('http://localhost:5176/products', { waitUntil: 'networkidle2' });
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
    const productsText = await page.evaluate(() => document.body.innerText);
    console.log('Products page text includes:', {
      products: productsText.includes('Products'),
      search: productsText.includes('Search'),
      cart: productsText.includes('Cart'),
      wishlist: productsText.includes('Wishlist'),
      add: productsText.includes('Add')
    });

    await page.screenshot({ path: 'test-results/simple-products.png' });

    // Test 3: Check header links
    console.log('3. Checking Header Links...');
    const headerLinks = await page.$$eval('a', links => links.map(a => ({ text: a.textContent.trim(), href: a.href })));
    console.log('Header links found:');
    headerLinks.forEach(link => console.log('  -', link.text, '->', link.href));

    console.log('\n✅ Simple test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

simpleTest();