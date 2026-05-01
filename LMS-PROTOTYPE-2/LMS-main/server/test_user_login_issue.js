const axios = require('axios');
const bcrypt = require('bcryptjs');

async function testUserLoginIssue() {
  console.log('🧪 Testing user login issue with generated password...\n');
  
  try {
    // Test 1: Create a new user via API
    console.log('👤 Creating a new test user...');
    
    const createUserRes = await axios.post('http://127.0.0.1:5002/api/superadmin/create-user', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'GeneratedPass123!',
      role: 'student',
      universityId: 1
    });
    
    console.log('✅ User created:', createUserRes.data.user);
    
    // Test 2: Try to login with the same password
    console.log('\n🔐 Testing login with the same password...');
    
    try {
      const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'testuser@example.com',
        password: 'GeneratedPass123!'
      });
      
      console.log('✅ Login successful:', loginRes.data.user);
      console.log('✅ No issue found - password works correctly');
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
      
      // Test 3: Check the stored password hash
      console.log('\n🔍 Checking stored password hash...');
      
      const db = require('./config/database-switch');
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', ['testuser@example.com'], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (user) {
        console.log('✅ User found in database');
        console.log('📝 Stored password hash:', user.password);
        
        // Test password comparison
        const isMatch = await bcrypt.compare('GeneratedPass123!', user.password);
        console.log('🔐 Password comparison result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
        
        if (!isMatch) {
          console.log('🔍 Testing with different password formats...');
          
          // Test with empty password
          const emptyMatch = await bcrypt.compare('', user.password);
          console.log('🔐 Empty password comparison:', emptyMatch ? '✅ MATCH' : '❌ NO MATCH');
          
          // Test with null password
          try {
            const nullMatch = await bcrypt.compare(null, user.password);
            console.log('🔐 Null password comparison:', nullMatch ? '✅ MATCH' : '❌ NO MATCH');
          } catch (e) {
            console.log('❌ Null password comparison error:', e.message);
          }
        }
      } else {
        console.log('❌ User not found in database');
      }
    }
    
    // Test 4: Create university with admin and test that login
    console.log('\n🏫 Testing university creation with admin...');
    
    const createUniRes = await axios.post('http://127.0.0.1:5002/api/superadmin/create-university', {
      universityName: 'Test University',
      area: 'Test Area',
      adminName: 'Test Admin',
      adminEmail: 'testadmin@example.com'
    });
    
    console.log('✅ University created:', createUniRes.data.university);
    console.log('🔑 Generated admin password:', createUniRes.data.generatedPassword);
    
    // Test 5: Try to login with generated admin password
    console.log('\n🔐 Testing admin login with generated password...');
    
    try {
      const adminLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'testadmin@example.com',
        password: createUniRes.data.generatedPassword
      });
      
      console.log('✅ Admin login successful:', adminLoginRes.data.user);
      
    } catch (adminLoginError) {
      console.log('❌ Admin login failed:', adminLoginError.response?.data?.message || adminLoginError.message);
      
      // Check the stored admin password hash
      console.log('\n🔍 Checking stored admin password hash...');
      
      const admin = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', ['testadmin@example.com'], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (admin) {
        console.log('✅ Admin found in database');
        console.log('📝 Stored admin password hash:', admin.password);
        
        // Test password comparison
        const adminMatch = await bcrypt.compare(createUniRes.data.generatedPassword, admin.password);
        console.log('🔐 Admin password comparison result:', adminMatch ? '✅ MATCH' : '❌ NO MATCH');
      }
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE email IN (?, ?)', ['testuser@example.com', 'testadmin@example.com'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM universities WHERE name = ?', ['Test University'], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
    }
  }
}

testUserLoginIssue();
