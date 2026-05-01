const axios = require('axios');

async function testStorekeeperSections() {
  console.log('🧪 Testing Storekeeper Sections...\n');
  
  try {
    // Login as Storekeeper
    console.log('🔐 Login as Storekeeper...');
    const storekeeperLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'storekeeper@core5.co.in',
      password: 'storekeeper123'
    });
    
    if (storekeeperLogin.status === 200) {
      const storekeeperToken = storekeeperLogin.data.token;
      console.log('✅ Storekeeper login successful');
      
      // Test 1: Inventory API
      console.log('\n📦 Testing Inventory API...');
      try {
        const inventoryResponse = await axios.get('http://127.0.0.1:5002/api/storekeeper/inventory', {
          headers: { 
            'Authorization': `Bearer ${storekeeperToken}`
          }
        });
        
        console.log('✅ Inventory API Status:', inventoryResponse.status);
        console.log('✅ Inventory Data:', inventoryResponse.data);
        
      } catch (error) {
        console.log('❌ Inventory API failed:', error.response?.status);
        console.log('   - Error message:', error.response?.data?.message);
      }
      
      // Test 2: Vendors API
      console.log('\n🏪 Testing Vendors API...');
      try {
        const vendorsResponse = await axios.get('http://127.0.0.1:5002/api/storekeeper/vendors', {
          headers: { 
            'Authorization': `Bearer ${storekeeperToken}`
          }
        });
        
        console.log('✅ Vendors API Status:', vendorsResponse.status);
        console.log('✅ Vendors Data:', vendorsResponse.data);
        
      } catch (error) {
        console.log('❌ Vendors API failed:', error.response?.status);
        console.log('   - Error message:', error.response?.data?.message);
      }
      
      // Test 3: Check if inventory table exists
      console.log('\n🗄️ Checking Inventory Table...');
      try {
        const db = require('./config/database-switch');
        
        db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='inventory'", (err, tables) => {
          if (err) {
            console.error('❌ Error checking tables:', err);
          } else {
            console.log('✅ Inventory table found:', tables.length > 0);
            
            if (tables.length > 0) {
              // Check if there are any inventory items
              db.all("SELECT COUNT(*) as count FROM inventory", (err, result) => {
                if (err) {
                  console.error('❌ Error checking inventory count:', err);
                } else {
                  console.log('✅ Inventory items count:', result[0].count);
                }
              });
            } else {
              console.log('❌ Inventory table not found');
            }
          }
        });
        
      } catch (error) {
        console.error('❌ Database check failed:', error.message);
      }
      
      // Test 4: Check if vendors table exists
      console.log('\n🗄️ Checking Vendors Table...');
      try {
        const db = require('./config/database-switch');
        
        db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='vendors'", (err, tables) => {
          if (err) {
            console.error('❌ Error checking vendors table:', err);
          } else {
            console.log('✅ Vendors table found:', tables.length > 0);
            
            if (tables.length > 0) {
              // Check if there are any vendors
              db.all("SELECT COUNT(*) as count FROM vendors", (err, result) => {
                if (err) {
                  console.error('❌ Error checking vendors count:', err);
                } else {
                  console.log('✅ Vendors count:', result[0].count);
                }
              });
            } else {
              console.log('❌ Vendors table not found');
            }
          }
        });
        
      } catch (error) {
        console.error('❌ Database check failed:', error.message);
      }
    }
    
    console.log('\n🎯 STOREKEEPER SECTIONS TEST SUMMARY:');
    console.log('✅ Authentication: Working');
    console.log('📦 Inventory: API exists, checking functionality');
    console.log('🏪 Vendors: API exists, checking functionality');
    console.log('📊 Vendor Stock: Will test after fixing inventory and vendors');
    
    console.log('\n🔧 POTENTIAL ISSUES:');
    console.log('1. Database tables might not exist');
    console.log('2. API endpoints might have database connection issues');
    console.log('3. Frontend components might have import issues');
    console.log('4. Routes might not be properly configured');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStorekeeperSections();
