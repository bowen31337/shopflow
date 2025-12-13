const axios = require('axios');

async function testFrontend() {
  console.log('=== Testing Frontend Accessibility ===\n');

  try {
    // Test if frontend is accessible
    console.log('1. Testing frontend accessibility...');
    const response = await axios.get('http://localhost:3004', { timeout: 5000 });
    console.log('   ✅ Frontend is accessible');
    console.log('   Status:', response.status);
    console.log('   Content-Type:', response.headers['content-type']);

    // Check if it's HTML content
    if (response.headers['content-type'] && response.headers['content-type'].includes('text/html')) {
      console.log('   ✅ HTML content received');

      // Check for React/Vite indicators
      const html = response.data;
      if (html.includes('vite') || html.includes('react') || html.includes('Vite')) {
        console.log('   ✅ React/Vite application detected');
      }

      // Check for common e-commerce elements
      if (html.includes('ShopFlow') || html.includes('shopflow') || html.includes('E-Commerce')) {
        console.log('   ✅ ShopFlow branding detected');
      }

      // Check for routing
      if (html.includes('react-router') || html.includes('Router')) {
        console.log('   ✅ Routing library detected');
      }

      console.log('\n   Frontend appears to be working correctly!');

    } else {
      console.log('   ⚠️ Unexpected content type:', response.headers['content-type']);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('   ❌ Frontend not accessible - connection refused');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('   ❌ Frontend not accessible - timeout');
    } else {
      console.log('   ❌ Frontend error:', error.message);
    }
  }
}

testFrontend().catch(console.error);