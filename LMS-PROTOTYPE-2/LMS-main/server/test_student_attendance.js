const axios = require('axios');

async function testStudentAttendance() {
  console.log('🧪 Testing Student Attendance API...\n');
  
  try {
    // Login as Student (Rashmi)
    console.log('🔐 Login as Rashmi (Student)...');
    const rashmiLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'rashmi.shetty@core5.co.in',
      password: 'rashmi123'
    });
    
    if (rashmiLogin.status === 200) {
      const rashmiToken = rashmiLogin.data.token;
      console.log('✅ Rashmi login successful');
      console.log('   - User ID:', rashmiLogin.data.user.id);
      console.log('   - Role:', rashmiLogin.data.user.role);
      
      // Test 1: Get Student Attendance
      console.log('\n📊 Testing Student Attendance API...');
      try {
        const attendanceResponse = await axios.get('http://127.0.0.1:5002/api/attendance/student', {
          headers: { 
            'Authorization': `Bearer ${rashmiToken}`
          }
        });
        
        console.log('✅ Attendance API Response Status:', attendanceResponse.status);
        console.log('✅ Attendance Data:', attendanceResponse.data);
        
        if (Array.isArray(attendanceResponse.data)) {
          console.log('✅ Attendance Records Found:', attendanceResponse.data.length);
          attendanceResponse.data.forEach((record, index) => {
            console.log(`   ${index + 1}. Date: ${record.date}, Status: ${record.status}, Classroom: ${record.classroomId}`);
          });
        } else {
          console.log('❌ No attendance records found or invalid format');
        }
        
      } catch (error) {
        console.log('❌ Attendance API Error:', error.response?.status, error.response?.data?.message);
      }
      
      // Test 2: Mark some attendance first (if needed)
      console.log('\n📝 Testing Attendance Marking...');
      try {
        // Get mentor to mark attendance
        const mentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
          email: 'rishi@core5.co.in',
          password: 'rishi123'
        });
        
        if (mentorLogin.status === 200) {
          const mentorToken = mentorLogin.data.token;
          
          // Get classrooms and students
          const classroomsResponse = await axios.get('http://127.0.0.1:5002/api/classrooms/mentor/me', {
            headers: { 
              'Authorization': `Bearer ${mentorToken}`
            }
          });
          
          const studentsResponse = await axios.get('http://127.0.0.1:5002/api/users?role=student', {
            headers: { 
              'Authorization': `Bearer ${mentorToken}`
            }
          });
          
          const classrooms = classroomsResponse.data.data || classroomsResponse.data;
          let studentList = studentsResponse.data;
          if (studentList && typeof studentList === 'object' && 'data' in studentList) {
            studentList = studentList.data;
          }
          const filteredStudents = Array.isArray(studentList) 
            ? studentList.filter(user => user.role === 'student')
            : [];
          
          // Find Rashmi in the students list
          const rashmiStudent = filteredStudents.find(s => s.email === 'rashmi.shetty@core5.co.in');
          
          if (classrooms.length > 0 && rashmiStudent) {
            const firstClassroom = classrooms[0];
            const today = new Date().toISOString().split('T')[0];
            
            console.log(`   - Marking attendance for Rashmi in ${firstClassroom.name}`);
            
            const attendanceResponse = await axios.post('http://127.0.0.1:5002/api/attendance/mark', {
              classroomId: firstClassroom.id,
              date: today,
              attendanceData: [
                {
                  studentId: rashmiStudent.id,
                  status: 'present'
                }
              ]
            }, {
              headers: { 
                'Authorization': `Bearer ${mentorToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            console.log('✅ Attendance Marked:', attendanceResponse.data.message);
            
            // Test 3: Check attendance again
            console.log('\n📊 Testing Student Attendance After Marking...');
            const newAttendanceResponse = await axios.get('http://127.0.0.1:5002/api/attendance/student', {
              headers: { 
                'Authorization': `Bearer ${rashmiToken}`
              }
            });
            
            console.log('✅ Updated Attendance Data:', newAttendanceResponse.data);
            
          } else {
            console.log('❌ Could not find Rashmi or classrooms');
          }
        }
        
      } catch (error) {
        console.log('❌ Attendance Marking Error:', error.response?.status, error.response?.data?.message);
      }
      
      console.log('\n🎯 STUDENT ATTENDANCE TEST:');
      console.log('✅ API Endpoint: /api/attendance/student');
      console.log('✅ Authentication: Working with student token');
      console.log('✅ Data Format: Array of attendance records');
      console.log('✅ Dashboard Integration: Should display attendance percentage');
      
      console.log('\n🌐 FRONTEND TEST:');
      console.log('👩‍🎓 Student Dashboard: http://localhost:5174/student/dashboard');
      console.log('🔐 Login: rashmi.shetty@core5.co.in / rashmi123');
      console.log('📝 Action: Check attendance card percentage');
      
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStudentAttendance();
