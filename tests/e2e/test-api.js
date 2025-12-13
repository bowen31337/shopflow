const axios = require('axios');

async function testGoogleLoginAPI() {
  console.log('Testing Google Login API Endpoint...\n');

  try {
    console.log('1. Testing GET request to login page...');
    const loginPageResponse = await axios.get('http://localhost:3002/login', {
      timeout: 5000
    });
    console.log(`   ✓ Login page accessible (Status: ${loginPageResponse.status})`);

    console.log('2. Testing POST request to Google login API...');
    const googleLoginResponse = await axios.post('http://localhost:3002/api/auth/google', {}, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`   ✓ Google login API accessible (Status: ${googleLoginResponse.status})`);
    console.log('   Response data:', JSON.stringify(googleLoginResponse.data, null, 2));

    if (googleLoginResponse.data && googleLoginResponse.data.user && googleLoginResponse.data.accessToken) {
      console.log('   ✓ Google login API returned valid user data and token');
      console.log('   ✓ Mock Google login functionality is working correctly');
    } else {
      console.log('   ⚠ Google login API response missing expected data');
    }

  } catch (error) {
    if (error.response) {
      console.error(`   ✗ API Error (Status: ${error.response.status}):`, error.response.data);
    } else if (error.request) {
      console.error('   ✗ Network Error - No response received:', error.message);
    } else {
      console.error('   ✗ Request Error:', error.message);
    }
  }
}

testGoogleLoginAPI();