// Test vendor stock API endpoints
const API = 'http://localhost:5002';

// Test endpoints
const testEndpoints = async () => {
  console.log('\n=== Testing Vendor Stock API Endpoints ===');
  
  try {
    // Test GET all vendor stock
    console.log('1. Testing GET /api/vendor/stock...');
    const getAllRes = await fetch(`${API}/vendor/stock`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-testing'
      }
    });
    
    console.log('GET All Status:', getAllRes.status);
    if (getAllRes.ok) {
      const allData = await getAllRes.json();
      console.log('GET All Response:', allData);
    }
    
    // Test GET vendor stock stats
    console.log('2. Testing GET /api/vendor/stock/stats...');
    const getStatsRes = await fetch(`${API}/vendor/stock/stats`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-testing'
      }
    });
    
    console.log('GET Stats Status:', getStatsRes.status);
    if (getStatsRes.ok) {
      const statsData = await getStatsRes.json();
      console.log('GET Stats Response:', statsData);
    }
    
    // Test GET vendor stock categories
    console.log('3. Testing GET /api/vendor/stock/categories...');
    const getCategoriesRes = await fetch(`${API}/vendor/stock/categories`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-testing'
      }
    });
    
    console.log('GET Categories Status:', getCategoriesRes.status);
    if (getCategoriesRes.ok) {
      const categoriesData = await getCategoriesRes.json();
      console.log('GET Categories Response:', categoriesData);
    }
    
    // Test POST vendor stock
    console.log('4. Testing POST /api/vendor/stock...');
    const testItem = {
      name: 'Test Item',
      category: 'Test Category',
      quantity: 10,
      unit_price: 99.99,
      min_stock: 5,
      description: 'Test item for debugging'
    };
    
    const postRes = await fetch(`${API}/vendor/stock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-testing'
      },
      body: JSON.stringify(testItem)
    });
    
    console.log('POST Status:', postRes.status);
    if (postRes.ok) {
      const postData = await postRes.json();
      console.log('POST Response:', postData);
    }
    
    console.log('\n=== API Tests Complete ===');
    
  } catch (error) {
    console.error('API Test Error:', error.message);
  }
};

testEndpoints();
