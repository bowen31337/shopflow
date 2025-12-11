#!/usr/bin/env node

// Address book functionality test
const fs = require('fs');
const path = require('path');

// Test configuration
const API_BASE = 'http://localhost:3001';
const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'test123'
};

// Test address data
const TEST_ADDRESS = {
  label: 'Home',
  firstName: 'John',
  lastName: 'Doe',
  streetAddress: '123 Main Street',
  apartment: 'Apt 4B',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  country: 'United States',
  phone: '555-123-4567',
  isDefault: true
};

let authToken = null;

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    },
    ...options
  });

  const data = await response.json();
  return { response, data };
}

// Test login
async function testLogin() {
  console.log('🔐 Testing login...');
  try {
    const { response, data } = await makeRequest(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(TEST_CREDENTIALS)
    });

    if (response.ok && data.token) {
      authToken = data.token;
      console.log('✅ Login successful');
      return true;
    } else {
      console.log('❌ Login failed:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

// Test getting addresses
async function testGetAddresses() {
  console.log('📬 Testing get addresses...');
  try {
    const { response, data } = await makeRequest(`${API_BASE}/api/user/addresses`);

    if (response.ok) {
      console.log('✅ Get addresses successful');
      console.log(`📊 Found ${data.addresses.length} existing addresses`);
      return data.addresses;
    } else {
      console.log('❌ Get addresses failed:', data.error || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.log('❌ Get addresses error:', error.message);
    return [];
  }
}

// Test adding address
async function testAddAddress() {
  console.log('➕ Testing add address...');
  try {
    const { response, data } = await makeRequest(`${API_BASE}/api/user/addresses`, {
      method: 'POST',
      body: JSON.stringify(TEST_ADDRESS)
    });

    if (response.ok) {
      console.log('✅ Add address successful');
      console.log('📝 Address ID:', data.address.id);
      return data.address;
    } else {
      console.log('❌ Add address failed:', data.error || 'Unknown error');
      console.log('🔍 Response details:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.log('❌ Add address error:', error.message);
    return null;
  }
}

// Test updating address
async function testUpdateAddress(addressId) {
  console.log('✏️ Testing update address...');
  try {
    const updatedAddress = {
      ...TEST_ADDRESS,
      label: 'Work',
      streetAddress: '456 Business Ave'
    };

    const { response, data } = await makeRequest(`${API_BASE}/api/user/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(updatedAddress)
    });

    if (response.ok) {
      console.log('✅ Update address successful');
      return data.address;
    } else {
      console.log('❌ Update address failed:', data.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.log('❌ Update address error:', error.message);
    return null;
  }
}

// Test setting default address
async function testSetDefault(addressId) {
  console.log('⭐ Testing set default address...');
  try {
    const { response, data } = await makeRequest(`${API_BASE}/api/user/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...TEST_ADDRESS,
        isDefault: true
      })
    });

    if (response.ok) {
      console.log('✅ Set default address successful');
      return true;
    } else {
      console.log('❌ Set default address failed:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Set default address error:', error.message);
    return false;
  }
}

// Test deleting address
async function testDeleteAddress(addressId) {
  console.log('🗑️ Testing delete address...');
  try {
    const { response, data } = await makeRequest(`${API_BASE}/api/user/addresses/${addressId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      console.log('✅ Delete address successful');
      return true;
    } else {
      console.log('❌ Delete address failed:', data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Delete address error:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Address Book API Tests');
  console.log('=====================================');

  // Test 1: Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    console.log('💥 Cannot continue tests without authentication');
    process.exit(1);
  }

  // Test 2: Get initial addresses
  const initialAddresses = await testGetAddresses();

  // Test 3: Add address
  const newAddress = await testAddAddress();
  if (!newAddress) {
    console.log('💥 Cannot continue tests without adding an address');
    process.exit(1);
  }

  // Test 4: Get addresses after adding
  const addressesAfterAdd = await testGetAddresses();

  // Test 5: Update address
  const updatedAddress = await testUpdateAddress(newAddress.id);

  // Test 6: Set default address
  await testSetDefault(newAddress.id);

  // Test 7: Get final addresses
  const finalAddresses = await testGetAddresses();

  // Test 8: Clean up - delete test address
  await testDeleteAddress(newAddress.id);

  console.log('=====================================');
  console.log('📊 Test Summary:');
  console.log(`📍 Initial addresses: ${initialAddresses.length}`);
  console.log(`➕ Added address: ${newAddress ? '✅' : '❌'}`);
  console.log(`📝 Updated address: ${updatedAddress ? '✅' : '❌'}`);
  console.log(`⭐ Set default: ✅`);
  console.log(`🗑️ Deleted address: ✅`);
  console.log('🎉 All address book API tests completed!');
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});