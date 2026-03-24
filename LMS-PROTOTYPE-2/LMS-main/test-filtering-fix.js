#!/usr/bin/env node
/**
 * Test: Verify announcement filtering fix
 * Tests that announcements are properly filtered by role
 */

const http = require('http');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5002';
const JWT_SECRET = 'your_jwt_secret_key_here';

// Create tokens
const adminToken = jwt.sign({ userId: 1, role: 'admin', name: 'Admin' }, JWT_SECRET, { expiresIn: '1h' });
const studentToken = jwt.sign({ userId: 3, role: 'student', name: 'Student' }, JWT_SECRET, { expiresIn: '1h' });
const mentorToken = jwt.sign({ userId: 2, role: 'mentor', name: 'Mentor' }, JWT_SECRET, { expiresIn: '1h' });

function request(method, path, token, data = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };
    if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function test() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 ANNOUNCEMENT FILTERING FIX - VERIFICATION TEST');
  console.log('='.repeat(70) + '\n');

  try {
    // Test 1: Admin creates for STUDENTS
    console.log('TEST 1: Admin creates announcement for STUDENTS ONLY\n');
    const res1 = await request('POST', '/api/announcements', adminToken, {
      title: 'Student Update',
      message: 'This is for students only',
      publishFor: 'students'
    });
    console.log(`Status: ${res1.status}`);
    if (res1.status === 201) {
      console.log(`✅ Created with publishFor: "${res1.data.announcement.publishFor}"`);
    } else {
      console.log(`❌ Error:`, res1.data);
    }
    console.log('');

    // Test 2: Admin creates for MENTORS
    console.log('TEST 2: Admin creates announcement for MENTORS/FACULTY ONLY\n');
    const res2 = await request('POST', '/api/announcements', adminToken, {
      title: 'Faculty Notice',
      message: 'This is for faculty only',
      publishFor: 'mentors'
    });
    console.log(`Status: ${res2.status}`);
    if (res2.status === 201) {
      console.log(`✅ Created with publishFor: "${res2.data.announcement.publishFor}"`);
    } else {
      console.log(`❌ Error:`, res2.data);
    }
    console.log('');

    // Test 3: Admin creates for BOTH
    console.log('TEST 3: Admin creates announcement for BOTH\n');
    const res3 = await request('POST', '/api/announcements', adminToken, {
      title: 'General Announcement',
      message: 'This is for everyone',
      publishFor: 'both'
    });
    console.log(`Status: ${res3.status}`);
    if (res3.status === 201) {
      console.log(`✅ Created with publishFor: "${res3.data.announcement.publishFor}"`);
    } else {
      console.log(`❌ Error:`, res3.data);
    }
    console.log('');

    // Test 4: Student fetches
    console.log('TEST 4: Student fetches announcements\n');
    const studentRes = await request('GET', '/api/announcements', studentToken);
    console.log(`Status: ${studentRes.status}`);
    console.log(`Count: ${studentRes.data.length}`);
    console.log('Announcements visible to student:');
    studentRes.data.forEach(a => {
      console.log(`  ✓ "${a.title}" (publishFor: ${a.publishFor})`);
    });
    console.log('');

    // Test 5: Mentor fetches
    console.log('TEST 5: Mentor fetches announcements\n');
    const mentorRes = await request('GET', '/api/announcements', mentorToken);
    console.log(`Status: ${mentorRes.status}`);
    console.log(`Count: ${mentorRes.data.length}`);
    console.log('Announcements visible to mentor:');
    mentorRes.data.forEach(a => {
      console.log(`  ✓ "${a.title}" (publishFor: ${a.publishFor})`);
    });
    console.log('');

    // Test 6: Admin fetches
    console.log('TEST 6: Admin fetches announcements\n');
    const adminRes = await request('GET', '/api/announcements', adminToken);
    console.log(`Status: ${adminRes.status}`);
    console.log(`Count: ${adminRes.data.length}`);
    console.log('Announcements visible to admin:');
    adminRes.data.forEach(a => {
      console.log(`  ✓ "${a.title}" (publishFor: ${a.publishFor})`);
    });
    console.log('');

    // Verification
    console.log('='.repeat(70));
    console.log('VERIFICATION RESULTS:\n');

    const studentHasStudentOnly = studentRes.data.some(a => a.title === 'Student Update');
    const studentHasBoth = studentRes.data.some(a => a.title === 'General Announcement');
    const studentNoFaculty = !studentRes.data.some(a => a.title === 'Faculty Notice');

    const mentorHasFacultyOnly = mentorRes.data.some(a => a.title === 'Faculty Notice');
    const mentorHasBoth = mentorRes.data.some(a => a.title === 'General Announcement');
    const mentorNoStudent = !mentorRes.data.some(a => a.title === 'Student Update');

    const adminHasAll = adminRes.data.length === 3;

    console.log('STUDENT PORTAL:');
    console.log(`  ${studentHasStudentOnly ? '✅' : '❌'} Sees "Student Update" (publishFor: students)`);
    console.log(`  ${studentHasBoth ? '✅' : '❌'} Sees "General Announcement" (publishFor: both)`);
    console.log(`  ${studentNoFaculty ? '✅' : '❌'} Does NOT see "Faculty Notice"`);
    console.log(`  Result: ${studentHasStudentOnly && studentHasBoth && studentNoFaculty ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');

    console.log('MENTOR PORTAL:');
    console.log(`  ${mentorHasFacultyOnly ? '✅' : '❌'} Sees "Faculty Notice" (publishFor: mentors)`);
    console.log(`  ${mentorHasBoth ? '✅' : '❌'} Sees "General Announcement" (publishFor: both)`);
    console.log(`  ${mentorNoStudent ? '✅' : '❌'} Does NOT see "Student Update"`);
    console.log(`  Result: ${mentorHasFacultyOnly && mentorHasBoth && mentorNoStudent ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');

    console.log('ADMIN PORTAL:');
    console.log(`  ${adminHasAll ? '✅' : '❌'} Sees all 3 announcements`);
    console.log(`  Result: ${adminHasAll ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');

    const allPass = studentHasStudentOnly && studentHasBoth && studentNoFaculty && 
                    mentorHasFacultyOnly && mentorHasBoth && mentorNoStudent && 
                    adminHasAll;

    console.log('='.repeat(70));
    if (allPass) {
      console.log('✅ ALL TESTS PASSED - FILTERING IS WORKING CORRECTLY!');
    } else {
      console.log('❌ SOME TESTS FAILED - CHECK THE OUTPUT ABOVE');
    }
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
  }
}

test().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
