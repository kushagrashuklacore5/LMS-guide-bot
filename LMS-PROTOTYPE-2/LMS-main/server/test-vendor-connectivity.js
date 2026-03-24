console.log('🔧 Testing Vendor Portal API Endpoints...');
console.log('');

const API_BASE = 'http://127.0.0.1:5002/api';

// Test vendor stats endpoint
async function testVendorStats() {
  console.log('📊 Testing /api/vendor/stats...');
  try {
    const response = await fetch(`${API_BASE}/vendor/stats`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📡 Response Data:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Vendor stats API working correctly');
      console.log('📊 Stats returned:', data.data);
    } else {
      console.log('❌ Vendor stats API failed:', data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Network error testing vendor stats:', error);
  }
}

// Test vendor invoices endpoint
async function testVendorInvoices() {
  console.log('📋 Testing /api/vendor/invoices...');
  try {
    const response = await fetch(`${API_BASE}/vendor/invoices`, {
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('📡 Response Data:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Vendor invoices API working correctly');
      console.log('📋 Invoices returned:', data.data?.length || 0, 'items');
    } else {
      console.log('❌ Vendor invoices API failed:', data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Network error testing vendor invoices:', error);
  }
}

// Test without authentication (should return 401)
async function testUnauthenticated() {
  console.log('🔒 Testing unauthenticated access...');
  try {
    const response = await fetch(`${API_BASE}/vendor/stats`);
    const data = await response.json();
    console.log('📡 Unauthenticated Response:', response.status, data);
  } catch (error) {
    console.error('❌ Error testing unauthenticated:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Vendor Portal API Tests...');
  console.log('🌐 API Base URL:', API_BASE);
  console.log('');
  
  await testUnauthenticated();
  console.log('');
  await testVendorStats();
  console.log('');
  await testVendorInvoices();
  console.log('');
  
  console.log('✅ API Testing Complete!');
  console.log('');
  console.log('🎯 Expected Results:');
  console.log('• All endpoints should return real data from database');
  console.log('• Authentication should work with proper vendor token');
  console.log('• CORS should be properly configured');
  console.log('• Error handling should be functional');
}

runTests();
