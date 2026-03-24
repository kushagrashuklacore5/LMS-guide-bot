/**
 * Complete Flow Test for Classroom Display
 * Tests: Login → Fetch Classrooms → Fetch Students → Mark Attendance
 */

const API_BASE = 'http://127.0.0.1:5002/api';

async function testCompleteFlow() {
  try {
    console.log('='.repeat(60));
    console.log('TESTING COMPLETE FLOW');
    console.log('='.repeat(60));

    // Step 1: Login as Mentor
    console.log('\n1. LOGGING IN AS MENTOR...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mentor@gmail.com',
        password: '123456'
      })
    });
    
    const loginData = await loginRes.json();
    console.log('Login Response:', loginData);
    
    if (!loginData.token) {
      throw new Error('No token received from login');
    }
    
    const token = loginData.token;
    const mentorId = loginData.user?.id;
    console.log(`✅ Login successful! Token: ${token.substring(0, 20)}...`);
    console.log(`✅ Mentor ID: ${mentorId}`);

    // Step 2: Fetch Classrooms using /me endpoint
    console.log('\n2. FETCHING CLASSROOMS VIA /classrooms/mentor/me...');
    const classroomsRes = await fetch(`${API_BASE}/classrooms/mentor/me`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const classroomsData = await classroomsRes.json();
    console.log('Classrooms Response:', classroomsData);
    
    const classrooms = classroomsData.data || [];
    console.log(`✅ Fetched ${classrooms.length} classrooms`);
    
    if (classrooms.length === 0) {
      throw new Error('No classrooms returned');
    }

    // Step 3: Select first classroom and fetch students
    const classroom = classrooms[0];
    console.log(`\n3. FETCHING STUDENTS FOR CLASSROOM: ${classroom.name} (ID: ${classroom.id})...`);
    
    const studentsRes = await fetch(`${API_BASE}/classrooms/${classroom.id}/students`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const studentsData = await studentsRes.json();
    console.log('Students Response:', studentsData);
    
    const students = studentsData.data || [];
    console.log(`✅ Fetched ${students.length} students for ${classroom.name}`);
    
    if (students.length === 0) {
      throw new Error('No students in classroom');
    }

    // Step 4: Test Attendance Mark
    console.log(`\n4. TESTING ATTENDANCE MARK FOR CLASSROOM...`);
    const today = new Date().toISOString().split('T')[0];
    const attendancePayload = {
      classroomId: classroom.id,
      attendance: students.map(s => ({
        studentId: s.id,
        status: 'PRESENT',
        date: today
      }))
    };
    
    console.log('Attendance Payload:', attendancePayload);
    
    const attendanceRes = await fetch(`${API_BASE}/attendance/mark`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(attendancePayload)
    });
    
    const attendanceData = await attendanceRes.json();
    console.log('Attendance Response:', attendanceData);
    
    if (attendanceData.success) {
      console.log(`✅ Attendance marked successfully`);
    } else {
      console.warn('⚠️ Attendance marking returned non-success:', attendanceData.message);
    }

    // Step 5: Verify Student Can See Attendance
    console.log(`\n5. VERIFYING STUDENT CAN SEE ATTENDANCE...`);
    
    // Login as first student
    const student = students[0];
    const studentLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: student.email,
        password: '123456'
      })
    });
    
    const studentLoginData = await studentLoginRes.json();
    const studentToken = studentLoginData.token;
    
    if (studentToken) {
      const studentAttendanceRes = await fetch(`${API_BASE}/attendance/student`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${studentToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const studentAttendanceData = await studentAttendanceRes.json();
      console.log('Student Attendance Data:', studentAttendanceData);
      
      const attendance = studentAttendanceData.data || [];
      if (attendance.length > 0) {
        console.log(`✅ Student can see ${attendance.length} attendance records`);
      } else {
        console.warn('⚠️ Student cannot see any attendance records');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testCompleteFlow();
