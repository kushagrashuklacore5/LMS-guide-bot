const bcrypt = require('bcryptjs');
const db = require('./config/database-switch');
const axios = require('axios');

async function testDirectUserCreation() {
  console.log('🧪 Testing direct user creation and login...\n');
  
  try {
    // Test 1: Create user directly in database with password
    console.log('👤 Creating test user directly in database...');
    
    const testEmail = 'directtest@example.com';
    const testPassword = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    const userId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO users (name, email, password, role, isApproved, university_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, ['Direct Test User', testEmail, hashedPassword, 'student', 1, 1], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    console.log('✅ User created with ID:', userId);
    console.log('📝 Password used:', testPassword);
    
    // Test 2: Try to login with the password
    console.log('\n🔐 Testing login...');
    
    try {
      const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: testEmail,
        password: testPassword
      });
      
      console.log('✅ Login successful!');
      console.log('👤 User logged in:', loginRes.data.user);
      console.log('✅ Direct user creation and login working correctly');
      
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data?.message || loginError.message);
      
      // Test 3: Check the stored password hash
      console.log('\n🔍 Checking stored password hash...');
      
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [testEmail], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (user) {
        console.log('✅ User found in database');
        console.log('📝 Stored password hash:', user.password);
        
        // Test password comparison
        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log('🔐 Password comparison result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
        
        if (isMatch) {
          console.log('✅ Password hash is correct, issue might be in login logic');
        } else {
          console.log('❌ Password hash comparison failed');
        }
      }
    }
    
    // Test 4: Test university creation with admin
    console.log('\n🏫 Testing university creation with admin...');
    
    const uniAdminEmail = 'uniadmin@example.com';
    const uniAdminPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedAdminPassword = await bcrypt.hash(uniAdminPassword, 10);
    
    // Create university
    const universityId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO universities (name, area, createdAt, updatedAt)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, ['Test University', 'Test Area'], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    console.log('✅ University created with ID:', universityId);
    
    // Create admin user
    const adminId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO users (name, email, password, role, isApproved, university_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, ['Test Admin', uniAdminEmail, hashedAdminPassword, 'admin', 1, universityId], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    // Update university adminId
    await new Promise((resolve, reject) => {
      db.run('UPDATE universities SET adminId = ? WHERE id = ?', [adminId, universityId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Admin user created with ID:', adminId);
    console.log('🔑 Generated admin password:', uniAdminPassword);
    
    // Test 5: Try to login with admin password
    console.log('\n🔐 Testing admin login...');
    
    try {
      const adminLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: uniAdminEmail,
        password: uniAdminPassword
      });
      
      console.log('✅ Admin login successful!');
      console.log('👤 Admin logged in:', adminLoginRes.data.user);
      
    } catch (adminLoginError) {
      console.log('❌ Admin login failed:', adminLoginError.response?.data?.message || adminLoginError.message);
      
      // Check the stored admin password hash
      console.log('\n🔍 Checking stored admin password hash...');
      
      const admin = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [uniAdminEmail], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (admin) {
        console.log('✅ Admin found in database');
        console.log('📝 Stored admin password hash:', admin.password);
        
        // Test password comparison
        const adminMatch = await bcrypt.compare(uniAdminPassword, admin.password);
        console.log('🔐 Admin password comparison result:', adminMatch ? '✅ MATCH' : '❌ NO MATCH');
      }
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE email IN (?, ?)', [testEmail, uniAdminEmail], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM universities WHERE id = ?', [universityId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Cleanup completed');
    console.log('\n🎉 Direct user creation test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDirectUserCreation();
