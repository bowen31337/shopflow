const axios = require('axios');

async function checkOrdersAPI() {
    console.log('🚀 Checking Orders API Response Format...\n');

    const BASE_URL = 'http://localhost:3001';
    let authToken = '';

    try {
        // 1. Login as customer
        console.log('1. Logging in as customer...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'customer@example.com',
            password: 'customer123'
        });

        authToken = loginResponse.data.accessToken;
        console.log('   ✅ Login successful');

        // 2. Get user's orders
        console.log('\n2. Fetching user orders...');
        const ordersResponse = await axios.get(`${BASE_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        console.log('   Orders response status:', ordersResponse.status);
        console.log('   Orders response data:', ordersResponse.data);
        console.log('   Orders response data type:', typeof ordersResponse.data);

        if (Array.isArray(ordersResponse.data)) {
            console.log('   ✅ Orders is an array with length:', ordersResponse.data.length);
        } else if (ordersResponse.data && typeof ordersResponse.data === 'object') {
            console.log('   ⚠️ Orders is an object, keys:', Object.keys(ordersResponse.data));
            if (ordersResponse.data.orders) {
                console.log('   ✅ Found orders array:', ordersResponse.data.orders);
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
}

checkOrdersAPI().catch(console.error);