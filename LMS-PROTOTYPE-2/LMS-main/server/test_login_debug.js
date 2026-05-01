const bcrypt = require('bcryptjs');
const db = require('./config/database-switch');
const axios = require('axios');

async function testLoginDebug() {
  console.log('🧪 Debugging login issue with generated password...\n');
  
  try {
    // Test 1: Simulate university creation exactly like the backend does
    console.log('🏫 Simulating university creation with admin...');
    
    const universityName = 'Debug Test University';
    const area = 'Debug Area';
    const adminName = 'Debug Admin';
    const adminEmail = 'debugadmin@example.com';
    
    // Generate password exactly like the backend
    const rawPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
    console.log('🔑 Generated password:', rawPassword);
    console.log('📝 Hashed password:', hashedPassword);
    
    // Create university
    const universityId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO universities (name, area, createdAt, updatedAt)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, [universityName, area], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    console.log('✅ University created with ID:', universityId);
    
    // Create admin user exactly like the backend
    const adminId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO users (name, email, password, role, isApproved, university_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, [adminName, adminEmail, hashedPassword, "admin", 1, universityId], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    console.log('✅ Admin user created with ID:', adminId);
    
    // Update university adminId
    await new Promise((resolve, reject) => {
      db.run('UPDATE universities SET adminId = ? WHERE id = ?', [adminId, universityId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Test 2: Verify the stored data
    console.log('\n🔍 Verifying stored data...');
    
    const storedUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [adminEmail], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('✅ Stored user:', {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      role: storedUser.role,
      university_id: storedUser.university_id,
      isApproved: storedUser.isApproved,
      password_length: storedUser.password.length
    });
    
    // Test 3: Test password comparison directly
    console.log('\n🔐 Testing password comparison...');
    
    const directCompare = await bcrypt.compare(rawPassword, storedUser.password);
    console.log('✅ Direct bcrypt.compare result:', directCompare ? 'MATCH' : 'NO MATCH');
    
    // Test 4: Test login via API
    console.log('\n🌐 Testing login via API...');
    
    try {
      const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: adminEmail,
        password: rawPassword
      });
      
      console.log('✅ API Login successful!');
      console.log('👤 Logged in user:', loginRes.data.user);
      
    } catch (loginError) {
      console.log('❌ API Login failed:', loginError.response?.data?.message || loginError.message);
      
      // Test with different password formats
      console.log('\n🔍 Testing with different password formats...');
      
      const testPasswords = [
        rawPassword,
        rawPassword.trim(),
        rawPassword.toLowerCase(),
        rawPassword.toUpperCase(),
        '12345678', // Common demo password
        ''
      ];
      
      for (const testPwd of testPasswords) {
        try {
          const testRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
            email: adminEmail,
            password: testPwd
          });
          
          console.log(`✅ Login successful with password: "${testPwd}"`);
          break;
          
        } catch (testError) {
          console.log(`❌ Login failed with password "${testPwd}": ${testError.response?.data?.message || testError.message}`);
        }
      }
    }
    
    // Test 5: Check if user is in demo list (which bypasses password)
    console.log('\n🔍 Checking if user is in demo list...');
    
    const demoEmails = [
      "student@gmail.com",
      "mentor@gmail.com", 
      "admin@gmail.com",
      "accountant@demo.com",
      "storekeeper@demo.com",
      "superadmin@core5.com"
    ];
    
    if (demoEmails.includes(adminEmail)) {
      console.log('✅ User is in demo list - password bypassed');
    } else {
      console.log('❌ User is not in demo list - password required');
    }
    
    // Test 6: Manual password verification test
    console.log('\n🔐 Manual password verification test...');
    
    // Create a test user with known password
    const knownPassword = 'TestPassword123!';
    const knownHashedPassword = await bcrypt.hash(knownPassword, 10);
    
    const testUserId = await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO users (name, email, password, role, isApproved, university_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `, ['Manual Test User', 'manualtest@example.com', knownHashedPassword, 'student', 1, 1], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
    
    console.log('✅ Manual test user created with ID:', testUserId);
    
    // Test login with known password
    try {
      const manualLoginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'manualtest@example.com',
        password: knownPassword
      });
      
      console.log('✅ Manual test login successful!');
      console.log('👤 Manual test user logged in:', manualLoginRes.data.user);
      
    } catch (manualLoginError) {
      console.log('❌ Manual test login failed:', manualLoginError.response?.data?.message || manualLoginError.message);
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE email IN (?, ?)', [adminEmail, 'manualtest@example.com'], (err) => {
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
    console.log('\n🎉 Login debug test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginDebug();
