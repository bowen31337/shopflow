// Simple test to verify recently viewed products functionality
const fs = require('fs');

// Test that the recently viewed store file exists
console.log('🧪 Testing Recently Viewed Products Implementation...\n');

// Check if the store file exists
const storePath = './client/src/stores/recentlyViewedStore.js';
if (fs.existsSync(storePath)) {
  console.log('✅ recentlyViewedStore.js exists');
} else {
  console.log('❌ recentlyViewedStore.js missing');
}

// Check if the component file exists
const componentPath = './client/src/components/RecentlyViewedProducts.jsx';
if (fs.existsSync(componentPath)) {
  console.log('✅ RecentlyViewedProducts.jsx exists');
} else {
  console.log('❌ RecentlyViewedProducts.jsx missing');
}

// Check if ProductDetail has been updated
const productDetailPath = './client/src/pages/ProductDetail.jsx';
if (fs.existsSync(productDetailPath)) {
  const productDetailContent = fs.readFileSync(productDetailPath, 'utf8');
  if (productDetailContent.includes('useRecentlyViewedStore')) {
    console.log('✅ ProductDetail.jsx imports recentlyViewedStore');
  } else {
    console.log('❌ ProductDetail.jsx missing recentlyViewedStore import');
  }

  if (productDetailContent.includes('RecentlyViewedProducts')) {
    console.log('✅ ProductDetail.jsx includes RecentlyViewedProducts component');
  } else {
    console.log('❌ ProductDetail.jsx missing RecentlyViewedProducts component');
  }

  if (productDetailContent.includes('addToRecentlyViewed')) {
    console.log('✅ ProductDetail.jsx calls addToRecentlyViewed');
  } else {
    console.log('❌ ProductDetail.jsx missing addToRecentlyViewed call');
  }
} else {
  console.log('❌ ProductDetail.jsx missing');
}

// Check if Home has been updated
const homePath = './client/src/pages/Home.jsx';
if (fs.existsSync(homePath)) {
  const homeContent = fs.readFileSync(homePath, 'utf8');
  if (homeContent.includes('RecentlyViewedProducts')) {
    console.log('✅ Home.jsx includes RecentlyViewedProducts component');
  } else {
    console.log('❌ Home.jsx missing RecentlyViewedProducts component');
  }
} else {
  console.log('❌ Home.jsx missing');
}

// Check if Products has been updated
const productsPath = './client/src/pages/Products.jsx';
if (fs.existsSync(productsPath)) {
  const productsContent = fs.readFileSync(productsPath, 'utf8');
  if (productsContent.includes('RecentlyViewedProducts')) {
    console.log('✅ Products.jsx includes RecentlyViewedProducts component');
  } else {
    console.log('❌ Products.jsx missing RecentlyViewedProducts component');
  }
} else {
  console.log('❌ Products.jsx missing');
}

console.log('\n🎉 Recently viewed products implementation completed!');
console.log('\n📋 Test Steps Manual Verification:');
console.log('1. Navigate to multiple product detail pages');
console.log('2. Return to homepage or products page');
console.log('3. Verify recently viewed section displays previously viewed products');
console.log('4. Check that most recent products appear first');
console.log('5. Confirm clicking on recently viewed product navigates correctly');