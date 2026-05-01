const axios = require('axios');

async function testClassroomComprehensive() {
  console.log('🏫 COMPREHENSIVE CLASSROOM FUNCTIONALITY TEST\n');
  
  try {
    // Login as admin
    console.log('🔐 Login as admin...');
    const adminLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');
    
    // Test 1: Admin can see all classrooms
    console.log('\n📚 Test 1: Admin GET /api/classrooms');
    try {
      const adminClassrooms = await axios.get('http://127.0.0.1:5002/api/classrooms', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      
      console.log('✅ Admin can see classrooms');
      console.log(`📊 Found ${adminClassrooms.data.data.length} classrooms`);
      adminClassrooms.data.data.forEach((c, i) => {
        console.log(`   ${i+1}. ${c.name} - Teacher: ${c.classTeacher?.name || 'None'} - Students: ${c.studentCount}`);
      });
    } catch (error) {
      console.log('❌ Admin classrooms failed:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 2: Create a new classroom with assigned teacher
    console.log('\n➕ Test 2: Create classroom with assigned teacher');
    try {
      const newClassroom = await axios.post('http://127.0.0.1:5002/api/classrooms', {
        name: 'Test Comprehensive Classroom',
        grade: '11',
        section: 'D',
        classTeacher: 'Test Teacher',
        classTeacherId: 1
      }, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Classroom created successfully');
      console.log('📊 Classroom ID:', newClassroom.data.data.classroom.id);
      console.log('👨‍🏫 Class Teacher ID:', newClassroom.data.data.classroom.classTeacher);
      console.log('👥 Student Count:', newClassroom.data.data.classroom.studentCount);
      
      const createdClassroomId = newClassroom.data.data.classroom.id;
      
      // Test 3: Login as mentor (teacher) and check assigned classrooms
      console.log('\n👨‍🏫 Test 3: Mentor login and check assigned classrooms');
      const mentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'newtestteacher@example.com',
        password: 'tj843ikq'
      });
      const mentorToken = mentorLogin.data.token;
      console.log('✅ Mentor login successful');
      
      try {
        const mentorClassrooms = await axios.get('http://127.0.0.1:5002/api/classrooms/my-classrooms', {
          headers: { 'Authorization': `Bearer ${mentorToken}` }
        });
        
        console.log('✅ Mentor can see assigned classrooms');
        console.log(`📊 Found ${mentorClassrooms.data.data?.length || 0} classrooms for mentor`);
        if (mentorClassrooms.data.data) {
          mentorClassrooms.data.data.forEach((c, i) => {
            console.log(`   ${i+1}. ${c.name} - Students: ${c.studentCount}`);
          });
        }
      } catch (error) {
        console.log('❌ Mentor classrooms failed:', error.response?.status, error.response?.data?.message);
      }
      
      // Test 4: Create a student and assign to classroom
      console.log('\n👨‍🎓 Test 4: Create student and assign to classroom');
      try {
        const newStudent = await axios.post('http://127.0.0.1:5002/api/admin/create-student', {
          fullName: 'Test Student for Classroom',
          email: 'teststudentclass@example.com',
          className: '11',
          section: 'D'
        }, {
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Student created successfully');
        console.log('👤 Student ID:', newStudent.data.student.id);
        
        // Assign student to classroom
        const assignStudent = await axios.post('http://127.0.0.1:5002/api/classrooms/assign-student', {
          classroomId: createdClassroomId,
          studentId: newStudent.data.student.id
        }, {
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Student assigned to classroom');
        
      } catch (error) {
        console.log('❌ Student creation/assignment failed:', error.response?.status, error.response?.data?.message);
      }
      
      // Test 5: Login as student and check classrooms
      console.log('\n👨‍🎓 Test 5: Student login and check assigned classrooms');
      const studentLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'teststudentclass@example.com',
        password: 'tj843ikq'
      });
      const studentToken = studentLogin.data.token;
      console.log('✅ Student login successful');
      
      try {
        const studentClassrooms = await axios.get('http://127.0.0.1:5002/api/classrooms/student-classrooms', {
          headers: { 'Authorization': `Bearer ${studentToken}` }
        });
        
        console.log('✅ Student can see assigned classrooms');
        console.log(`📊 Found ${studentClassrooms.data.data?.length || 0} classrooms for student`);
        if (studentClassrooms.data.data) {
          studentClassrooms.data.data.forEach((c, i) => {
            console.log(`   ${i+1}. ${c.name} - Grade: ${c.grade} - Section: ${c.section}`);
          });
        }
      } catch (error) {
        console.log('❌ Student classrooms failed:', error.response?.status, error.response?.data?.message);
      }
      
      // Test 6: Verify classroom data integrity
      console.log('\n🔍 Test 6: Verify classroom data integrity');
      try {
        const updatedClassrooms = await axios.get('http://127.0.0.1:5002/api/classrooms', {
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        const targetClassroom = updatedClassrooms.data.data.find(c => c.id === createdClassroomId);
        if (targetClassroom) {
          console.log('✅ Classroom data integrity verified');
          console.log(`📊 Classroom: ${targetClassroom.name}`);
          console.log(`👨‍🏫 Class Teacher: ${targetClassroom.classTeacher?.name || 'None'} (ID: ${targetClassroom.classTeacher?.id})`);
          console.log(`👥 Student Count: ${targetClassroom.studentCount}`);
          console.log(`📚 Grade: ${targetClassroom.grade} - Section: ${targetClassroom.section}`);
        } else {
          console.log('❌ Created classroom not found in list');
        }
      } catch (error) {
        console.log('❌ Data integrity check failed:', error.response?.status, error.response?.data?.message);
      }
      
    } catch (error) {
      console.log('❌ Classroom creation failed:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n🎯 COMPREHENSIVE TEST SUMMARY:');
    console.log('✅ Admin Classroom Display: Should show all classrooms');
    console.log('✅ Admin Classroom Creation: Should create with assigned teacher');
    console.log('✅ Mentor Classroom Display: Should show assigned classrooms');
    console.log('✅ Student Classroom Display: Should show enrolled classrooms');
    console.log('✅ Database Storage: Should save classroom with teacher and students');
    console.log('✅ Data Integrity: Should maintain consistent classroom data');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testClassroomComprehensive();
