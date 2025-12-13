// Test admin functionality
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

// Admin credentials
const ADMIN_EMAIL = 'admin@shopflow.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = '';

async function loginAsAdmin() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    authToken = response.data.accessToken;
    console.log('✓ Admin login successful');
    return response.data.accessToken;
  } catch (error) {
    console.error('✗ Admin login failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    throw error;
  }
}

async function testAdminMetrics() {
  try {
    const response = await axios.get(`${API_BASE}/admin/metrics`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✓ Admin metrics fetched successfully');
    console.log('Metrics:', {
      totalRevenue: response.data.totalRevenue,
      totalOrders: response.data.totalOrders,
      totalCustomers: response.data.totalCustomers,
      avgOrderValue: response.data.avgOrderValue,
      recentOrdersCount: response.data.recentOrders?.length || 0
    });

    return response.data;
  } catch (error) {
    console.error('✗ Admin metrics failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testAdminProducts() {
  try {
    const response = await axios.get(`${API_BASE}/admin/products`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✓ Admin products fetched successfully');
    console.log(`Products count: ${response.data.products.length}`);
    console.log('First product:', response.data.products[0]?.name);

    return response.data;
  } catch (error) {
    console.error('✗ Admin products failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testAdminOrders() {
  try {
    const response = await axios.get(`${API_BASE}/admin/orders`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✓ Admin orders fetched successfully');
    console.log(`Orders count: ${response.data.orders.length}`);
    console.log('First order:', response.data.orders[0]?.order_number);

    return response.data;
  } catch (error) {
    console.error('✗ Admin orders failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testAdminCustomers() {
  try {
    const response = await axios.get(`${API_BASE}/admin/customers`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✓ Admin customers fetched successfully');
    console.log(`Customers count: ${response.data.customers.length}`);
    console.log('First customer:', response.data.customers[0]?.name);

    return response.data;
  } catch (error) {
    console.error('✗ Admin customers failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testAdminCategories() {
  try {
    const response = await axios.get(`${API_BASE}/admin/categories`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✓ Admin categories fetched successfully');
    console.log(`Categories count: ${response.data.categories.length}`);
    console.log('First category:', response.data.categories[0]?.name);

    return response.data;
  } catch (error) {
    console.error('✗ Admin categories failed:', error.response?.data || error.message);
    throw error;
  }
}

async function testAdminPromoCodes() {
  try {
    const response = await axios.get(`${API_BASE}/admin/promo-codes`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✓ Admin promo codes fetched successfully');
    console.log(`Promo codes count: ${response.data.promoCodes.length}`);

    return response.data;
  } catch (error) {
    console.error('✗ Admin promo codes failed:', error.response?.data || error.message);
    throw error;
  }
}

async function runTests() {
  console.log('=== Admin Dashboard Tests ===\n');

  try {
    // Login as admin
    await loginAsAdmin();

    // Test all admin endpoints
    await testAdminMetrics();
    await testAdminProducts();
    await testAdminOrders();
    await testAdminCustomers();
    await testAdminCategories();
    await testAdminPromoCodes();

    console.log('\n✓ All admin tests passed!');
  } catch (error) {
    console.error('\n✗ Some admin tests failed!');
    process.exit(1);
  }
}

runTests();