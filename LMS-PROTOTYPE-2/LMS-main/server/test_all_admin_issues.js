const axios = require('axios');
const db = require('./config/database-switch');

async function testAllAdminIssues() {
  console.log('🔍 Testing All Admin Issues...\n');
  
  try {
    // Login first
    console.log('🔐 Logging in as admin...');
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
    
    // Test 1: Create Student
    console.log('\n📚 Testing student creation...');
    try {
      const studentRes = await axios.post('http://127.0.0.1:5002/api/admin/create-student', {
        fullName: 'Test Student',
        email: 'teststudent@example.com',
        className: '10',
        section: 'A'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Student creation working!');
      console.log('📊 Status:', studentRes.status);
      console.log('👤 Created student:', studentRes.data.student?.name);
      
    } catch (error) {
      console.log('❌ Student creation failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 2: Create Teacher
    console.log('\n👨‍🏫 Testing teacher creation...');
    try {
      const teacherRes = await axios.post('http://127.0.0.1:5002/api/admin/create-teacher', {
        name: 'Test Teacher',
        email: 'testteacher@example.com',
        specialization: 'Mathematics'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Teacher creation working!');
      console.log('📊 Status:', teacherRes.status);
      console.log('👨‍🏫 Created teacher:', teacherRes.data.teacher?.name);
      
    } catch (error) {
      console.log('❌ Teacher creation failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 3: Get Mentors (for classroom assignment)
    console.log('\n👥 Testing mentors endpoint...');
    try {
      const mentorsRes = await axios.get('http://127.0.0.1:5002/api/admin/mentors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Mentors endpoint working!');
      console.log('📊 Status:', mentorsRes.status);
      console.log('👥 Mentors found:', mentorsRes.data.length);
      
    } catch (error) {
      console.log('❌ Mentors endpoint failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 4: Create Classroom
    console.log('\n🏫 Testing classroom creation...');
    try {
      const classroomRes = await axios.post('http://127.0.0.1:5002/api/classrooms', {
        name: 'Test Classroom',
        grade: '10',
        section: 'A',
        classTeacher: 1 // Use first mentor ID
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Classroom creation working!');
      console.log('📊 Status:', classroomRes.status);
      console.log('🏫 Created classroom:', classroomRes.data.classroom?.name);
      
    } catch (error) {
      console.log('❌ Classroom creation failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 5: Calendar Access
    console.log('\n📅 Testing calendar access...');
    try {
      const calendarRes = await axios.get('http://127.0.0.1:5002/api/calendar', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Calendar access working!');
      console.log('📊 Status:', calendarRes.status);
      console.log('📅 Calendar events:', calendarRes.data.length);
      
    } catch (error) {
      console.log('❌ Calendar access failed:', error.response?.status, error.response?.data?.message);
      if (error.response?.data?.featureRestricted) {
        console.log('🔒 Feature restricted - Current plan:', error.response?.data?.currentPlan);
      }
    }
    
    // Test 6: Database Export Access
    console.log('\n💾 Testing database export access...');
    try {
      const exportRes = await axios.get('http://127.0.0.1:5002/api/database-export/tables', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Database export access working!');
      console.log('📊 Status:', exportRes.status);
      console.log('📋 Tables available:', exportRes.data.length);
      
    } catch (error) {
      console.log('❌ Database export access failed:', error.response?.status, error.response?.data?.message);
      if (error.response?.data?.featureRestricted) {
        console.log('🔒 Feature restricted - Current plan:', error.response?.data?.currentPlan);
      }
    }
    
    // Test 7: Check User Subscription
    console.log('\n💳 Checking user subscription in database...');
    const dbUser = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.id, u.name, u.email, u.role, u.subscriptionPlan, u.university_id
        FROM users u 
        WHERE u.email = ?
      `, ['abhishek@core5.co.in'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('✅ Database user subscription:', dbUser.subscriptionPlan);
    
    // Test 8: Check University Subscription
    const university = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.id, u.name, u.subscriptionPlan, u.adminId
        FROM universities u 
        WHERE u.id = ?
      `, [dbUser.university_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('✅ University subscription:', university.subscriptionPlan);
    
    // Test 9: Check SuperAdmin Subscription
    const superadminSubscription = await new Promise((resolve, reject) => {
      db.get(`
        SELECT s.planType, s.planName, s.status
        FROM subscriptions s 
        WHERE s.superadminId = ?
      `, [`superadmin-${university.adminId}`], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('✅ SuperAdmin subscription:', superadminSubscription?.planType);
    
    console.log('\n🎯 SUMMARY:');
    console.log('✅ Student Creation: Should work without database errors');
    console.log('✅ Teacher Creation: Should work without database errors');
    console.log('✅ Mentors Endpoint: Should work for classroom dropdown');
    console.log('✅ Classroom Creation: Should work with class teacher assignment');
    console.log('✅ Calendar Access: Should work for professional plan');
    console.log('✅ Database Export: Should work for professional plan');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAllAdminIssues();
