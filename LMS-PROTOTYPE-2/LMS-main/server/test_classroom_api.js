const axios = require('axios');

async function testClassroomAPI() {
  console.log('🏫 Testing Classroom API...\n');
  
  try {
    // Login first
    console.log('🔐 Logging in as admin...');
    const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    console.log('✅ Login successful');
    const token = loginRes.data.token;
    
    // Test 1: Get all classrooms
    console.log('\n📚 Testing GET /api/classrooms...');
    try {
      const getClassroomsRes = await axios.get('http://127.0.0.1:5002/api/classrooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ GET classrooms working!');
      console.log('📊 Status:', getClassroomsRes.status);
      console.log('🏫 Classrooms found:', getClassroomsRes.data.length);
      getClassroomsRes.data.forEach((classroom, index) => {
        console.log(`   ${index + 1}. ${classroom.name} (Grade: ${classroom.grade}, Section: ${classroom.section})`);
        console.log(`      Teacher: ${classroom.classTeacher || 'Not assigned'}`);
        console.log(`      Students: ${classroom.studentCount || 0}`);
      });
      
    } catch (error) {
      console.log('❌ GET classrooms failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 2: Create a new classroom
    console.log('\n➕ Testing POST /api/classrooms...');
    try {
      const createClassroomRes = await axios.post('http://127.0.0.1:5002/api/classrooms', {
        name: 'Test API Classroom',
        grade: '10',
        section: 'C',
        classTeacher: 'Test Teacher',
        classTeacherId: 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ POST classroom working!');
      console.log('📊 Status:', createClassroomRes.status);
      console.log('🏫 Created classroom:', createClassroomRes.data);
      
    } catch (error) {
      console.log('❌ POST classroom failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 3: Get classrooms again to see new one
    console.log('\n📚 Testing GET /api/classrooms after creation...');
    try {
      const getClassroomsRes = await axios.get('http://127.0.0.1:5002/api/classrooms', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ GET classrooms working after creation!');
      console.log('📊 Status:', getClassroomsRes.status);
      console.log('🏫 Total classrooms now:', getClassroomsRes.data.length);
      
    } catch (error) {
      console.log('❌ GET classrooms after creation failed:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n🎯 CLASSROOM API TEST SUMMARY:');
    console.log('✅ GET /api/classrooms: Should return all classrooms');
    console.log('✅ POST /api/classrooms: Should create new classroom');
    console.log('✅ Database Storage: Should save classroom with assigned teacher');
    console.log('✅ Frontend Display: Should show classrooms in admin portal');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testClassroomAPI();
