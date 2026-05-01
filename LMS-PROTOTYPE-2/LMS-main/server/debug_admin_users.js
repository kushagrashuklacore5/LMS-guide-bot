const axios = require('axios');
const db = require('./config/database-switch');

async function debugAdminUsers() {
  console.log('🔍 Debugging admin users endpoint...\n');
  
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    console.log('✅ Login successful');
    const token = loginRes.data.token;
    const user = loginRes.data.user;
    
    console.log('👤 User info:');
    console.log('   ID:', user.id);
    console.log('   Role:', user.role);
    console.log('   University ID:', user.universityId);
    
    // Test the exact query from getAllUsers
    const adminUniversityId = user.universityId || 1;
    console.log('🏫 Using university ID:', adminUniversityId);
    
    console.log('\n📊 Testing the exact query from getAllUsers...');
    
    try {
      const users = await new Promise((resolve, reject) => {
        db.all(`
          SELECT u.id, u.name, u.email, u.role, u.isApproved, u.created_at as createdAt,
                 CASE WHEN u.role = 'student' THEN s.studentId ELSE NULL END as studentId,
                 CASE WHEN u.role = 'student' THEN s.grade ELSE NULL END as grade
          FROM users u 
          LEFT JOIN students s ON u.id = s.userId 
          WHERE u.university_id = ?
          ORDER BY u.created_at DESC
        `, [adminUniversityId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      console.log('✅ Query successful!');
      console.log('📊 Found users:', users.length);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.role}) - ${user.email}`);
      });
      
    } catch (error) {
      console.log('❌ Query failed:', error.message);
      console.log('🔍 Error details:', error);
      
      // Let's try a simpler query to see what's wrong
      console.log('\n📊 Testing simpler query without JOIN...');
      try {
        const simpleUsers = await new Promise((resolve, reject) => {
          db.all(`
            SELECT id, name, email, role, isApproved, created_at as createdAt
            FROM users 
            WHERE university_id = ?
            ORDER BY created_at DESC
          `, [adminUniversityId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
        
        console.log('✅ Simple query successful!');
        console.log('📊 Found users:', simpleUsers.length);
        
      } catch (simpleError) {
        console.log('❌ Simple query also failed:', simpleError.message);
      }
    }
    
    // Test the actual API endpoint
    console.log('\n🌐 Testing /api/admin/users endpoint...');
    try {
      const response = await axios.get('http://127.0.0.1:5002/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ API endpoint working!');
      console.log('📊 Response:', response.data);
      
    } catch (error) {
      console.log('❌ API endpoint failed:', error.response?.status, error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugAdminUsers();
