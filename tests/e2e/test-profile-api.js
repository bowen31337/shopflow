// Simple test script to verify API endpoints
// This would be run in a browser environment

const API_BASE = 'http://localhost:3001/api';

async function testProfileEndpoints() {
  console.log('Testing Profile API Endpoints...');

  // Test 1: Health check
  try {
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✓ Health check:', healthData.status);
  } catch (error) {
    console.log('✗ Health check failed:', error);
  }

  // Test 2: Unauthenticated profile access (should fail)
  try {
    const profileResponse = await fetch(`${API_BASE}/user/profile`);
    if (profileResponse.status === 401) {
      console.log('✓ Profile endpoint requires authentication');
    } else {
      console.log('✗ Profile endpoint should require authentication');
    }
  } catch (error) {
    console.log('✗ Profile endpoint test failed:', error);
  }

  // Test 3: Test login to get token (would need valid credentials)
  // This is just a template - would need actual user credentials
  /*
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'customer123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('✓ Login successful, token received');

    // Test 4: Authenticated profile access
    const profileResponse = await fetch(`${API_BASE}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    const profileData = await profileResponse.json();
    console.log('✓ Profile data retrieved:', profileData.user.name);

    // Test 5: Update profile
    const updateResponse = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User Updated',
        phone: '123-456-7890'
      })
    });

    const updateData = await updateResponse.json();
    console.log('✓ Profile updated successfully:', updateData.message);

  } catch (error) {
    console.log('✗ Login/profile test failed:', error);
  }
  */

  console.log('Profile API endpoint testing complete!');
}

// Run tests
testProfileEndpoints();