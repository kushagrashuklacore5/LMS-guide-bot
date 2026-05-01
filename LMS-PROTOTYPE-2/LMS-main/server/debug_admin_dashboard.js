const axios = require('axios');
const db = require('./config/database-switch');

async function debugAdminDashboard() {
  console.log('🔍 Debugging admin dashboard step by step...\n');
  
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
    console.log('👤 User:', user);
    
    const adminUniversityId = user.universityId || 1;
    console.log('🏫 University ID:', adminUniversityId);
    
    // Test each query individually
    console.log('\n📊 Query 1: User statistics');
    try {
      const userStats = await new Promise((resolve, reject) => {
        db.all(`
          SELECT role, COUNT(*) as count
          FROM users
          WHERE university_id = ?
          GROUP BY role
        `, [adminUniversityId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      console.log('✅ User statistics:', userStats);
    } catch (error) {
      console.log('❌ User statistics failed:', error.message);
      return;
    }
    
    console.log('\n📊 Query 2: Course statistics');
    try {
      const courseStats = await new Promise((resolve, reject) => {
        db.get(`
          SELECT COUNT(*) as totalCourses 
          FROM courses 
          WHERE university_id = ?
        `, [adminUniversityId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      console.log('✅ Course statistics:', courseStats);
    } catch (error) {
      console.log('❌ Course statistics failed:', error.message);
      return;
    }
    
    console.log('\n📊 Query 3: Payment statistics');
    try {
      const paymentStats = await new Promise((resolve, reject) => {
        db.get(`
          SELECT 
            COUNT(*) as totalPayments,
            SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as totalRevenue
          FROM payments
          WHERE studentId IN (SELECT id FROM users WHERE university_id = ?)
        `, [adminUniversityId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      console.log('✅ Payment statistics:', paymentStats);
    } catch (error) {
      console.log('❌ Payment statistics failed:', error.message);
      return;
    }
    
    console.log('\n📊 Query 4: Recent users');
    try {
      const recentUsers = await new Promise((resolve, reject) => {
        db.all(`
          SELECT id, name, email, role, created_at as createdAt
          FROM users
          WHERE university_id = ?
          ORDER BY created_at DESC
          LIMIT 5
        `, [adminUniversityId], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      
      console.log('✅ Recent users:', recentUsers.length, 'users');
      console.log('👤 Recent users data:', recentUsers);
    } catch (error) {
      console.log('❌ Recent users failed:', error.message);
      return;
    }
    
    // Now test the actual API endpoint
    console.log('\n🌐 Testing API endpoint...');
    try {
      const response = await axios.get('http://127.0.0.1:5002/api/admin/dashboard', {
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

debugAdminDashboard();
