
const mongoose = require('mongoose');
const { spawn } = require('child_process');

const API_URL = 'http://localhost:5000/api';
let adminToken, classTeacherToken, courseTeacherToken, studentToken;
let classTeacherId, courseTeacherId, studentId, classroomId, courseId;

async function runTest() {
  try {
    console.log('--- STARTING END-TO-END TEST ---');

    // 1. Create Users (Directly in DB to save time/avoid auth issues for creation)
    await mongoose.connect('mongodb://127.0.0.1:27017/lms_db');
    
    const User = require('./server/models/User');
    const Classroom = require('./server/models/Classroom');
    const Course = require('./server/models/Course');
    
    // Clear DB
    await User.deleteMany({ email: { $in: ['admin@test.com', 'class@test.com', 'course@test.com', 'student@test.com'] } });
    await Classroom.deleteMany({});
    await Course.deleteMany({});

    console.log('1. DB Cleared');

    // Create Admin
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      isApproved: true
    });
    
    // Create Class Teacher
    const classTeacher = await User.create({
      name: 'Class Teacher',
      email: 'class@test.com',
      password: hashedPassword,
      role: 'mentor',
      isApproved: true
    });
    classTeacherId = classTeacher._id.toString();

    // Create Course Teacher
    const courseTeacher = await User.create({
      name: 'Course Teacher',
      email: 'course@test.com',
      password: hashedPassword,
      role: 'mentor',
      isApproved: true
    });
    courseTeacherId = courseTeacher._id.toString();

    // Create Student
    const student = await User.create({
      name: 'Student User',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'student',
      isApproved: true
    });
    studentId = student._id.toString();

    console.log('2. Users Created');

    // Login
    adminToken = await login('admin@test.com');
    classTeacherToken = await login('class@test.com');
    courseTeacherToken = await login('course@test.com');
    studentToken = await login('student@test.com');

    console.log('3. Logged In');

    // 3. Admin Creates Classroom (Manual DB for simplicity)
    const classroom = await Classroom.create({
      name: 'Test Class 101',
      section: 'A',
      classTeacher: classTeacherId,
      students: [studentId]
    });
    classroomId = classroom._id;
    
    // Update Student
    await User.findByIdAndUpdate(studentId, { classroom: classroomId });

    console.log('4. Classroom Created manually in DB');

    // 4. Class Teacher Visibility Test
    try {
      const res = await fetch(`${API_URL}/classrooms/my-classroom`, {
        headers: { Authorization: `Bearer ${classTeacherToken}` }
      });
      const data = await res.json();
      console.log('Class Teacher Visibility:', data && data.name ? 'SUCCESS' : 'FAILURE', data);
    } catch (e) {
      console.log('Class Teacher Visibility ERROR:', e.message);
    }

    // 5. Student Visibility Test
    try {
      const res = await fetch(`${API_URL}/classrooms/student-classrooms`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const data = await res.json();
      console.log('Student Visibility:', Array.isArray(data) && data.length > 0 ? 'SUCCESS' : 'FAILURE', data.length);
    } catch (e) {
      console.log('Student Visibility ERROR:', e.message);
    }

    // 6. Class Teacher Creates Course (Manual DB)
    try {
      const course = await Course.create({
        title: 'Math 101',
        description: 'Basic Math',
        mentor: classTeacherId,
        mentorId: classTeacherId,
        courseTeacher: courseTeacherId,
        classroom: classroomId,
        students: [studentId]
      });
      courseId = course._id;
      
      // Link to classroom
      await Classroom.findByIdAndUpdate(classroomId, { $push: { courses: courseId } });
      
      // Link to student
      await User.findByIdAndUpdate(studentId, { $addToSet: { assignedCourses: courseId } });
      
      console.log('6. Course Created manually in DB');
    } catch (e) {
      console.error('Course Creation DB Error', e);
    }

    // 7. Course Teacher Visibility
    try {
      const res = await fetch(`${API_URL}/courses/mentor-courses`, {
        headers: { Authorization: `Bearer ${courseTeacherToken}` }
      });
      const data = await res.json();
      const found = data.find(c => c._id === courseId.toString());
      console.log('Course Teacher Visibility:', found ? 'SUCCESS' : 'FAILURE');
    } catch (e) {
      console.log('Course Teacher Visibility ERROR:', e.message);
    }

    // 8. Student Course Visibility
    try {
      const res = await fetch(`${API_URL}/courses/student-courses`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      const data = await res.json();
      const found = data.find(c => c._id === courseId.toString());
      console.log('Student Course Visibility:', found ? 'SUCCESS' : 'FAILURE');
    } catch (e) {
      console.log('Student Course Visibility ERROR:', e.message);
    }

    console.log('--- TEST COMPLETE ---');
    process.exit(0);

  } catch (err) {
    console.error('TEST ERROR:', err);
    process.exit(1);
  }
}

async function login(email) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'password123' })
  });
  const data = await res.json();
  return data.token;
}

runTest();
