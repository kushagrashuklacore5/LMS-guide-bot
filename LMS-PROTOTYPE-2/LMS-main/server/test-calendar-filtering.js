#!/usr/bin/env node
/**
 * Test: Verify calendar event filtering fix
 * Tests that calendar events are properly filtered by role
 */

const http = require('http');
const jwt = require('jsonwebtoken');

const API_URL = 'http://127.0.0.1:5002';
const JWT_SECRET = 'your_jwt_secret_key_here';

// Create tokens
const adminToken = jwt.sign({ userId: 1, role: 'admin', name: 'Admin' }, JWT_SECRET, { expiresIn: '1h' });
const studentToken = jwt.sign({ userId: 3, role: 'student', name: 'Student' }, JWT_SECRET, { expiresIn: '1h' });
const mentorToken = jwt.sign({ userId: 2, role: 'mentor', name: 'Mentor' }, JWT_SECRET, { expiresIn: '1h' });

function request(method, path, token, data = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: '127.0.0.1',
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
  console.log('🧪 CALENDAR EVENT FILTERING FIX - VERIFICATION TEST');
  console.log('='.repeat(70) + '\n');

  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Test 1: Admin creates for STUDENTS
    console.log('TEST 1: Admin creates event for STUDENTS ONLY\n');
    const res1 = await request('POST', '/api/calendar', adminToken, {
      title: 'Student Assembly',
      description: 'Weekly student meeting',
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
      publishFor: 'student'
    });
    console.log(`Status: ${res1.status}`);
    if (res1.status === 201 || res1.status === 200) {
      const event = Array.isArray(res1.data) ? res1.data[0] : res1.data;
      console.log(`✅ Created with publishFor: "${event.publishFor}"`);
    } else {
      console.log(`❌ Error:`, res1.data);
    }
    console.log('');

    // Test 2: Admin creates for MENTORS/FACULTY
    console.log('TEST 2: Admin creates event for MENTORS/FACULTY ONLY\n');
    const res2 = await request('POST', '/api/calendar', adminToken, {
      title: 'Faculty Meeting',
      description: 'Monthly faculty discussion',
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
      publishFor: 'faculty'
    });
    console.log(`Status: ${res2.status}`);
    if (res2.status === 201 || res2.status === 200) {
      const event = Array.isArray(res2.data) ? res2.data[0] : res2.data;
      console.log(`✅ Created with publishFor: "${event.publishFor}"`);
    } else {
      console.log(`❌ Error:`, res2.data);
    }
    console.log('');

    // Test 3: Admin creates for BOTH
    console.log('TEST 3: Admin creates event for BOTH\n');
    const res3 = await request('POST', '/api/calendar', adminToken, {
      title: 'School Holiday',
      description: 'Public holiday announcement',
      startDate: now.toISOString(),
      endDate: tomorrow.toISOString(),
      publishFor: 'both'
    });
    console.log(`Status: ${res3.status}`);
    if (res3.status === 201 || res3.status === 200) {
      const event = Array.isArray(res3.data) ? res3.data[0] : res3.data;
      console.log(`✅ Created with publishFor: "${event.publishFor}"`);
    } else {
      console.log(`❌ Error:`, res3.data);
    }
    console.log('');

    // Test 4: Student fetches
    console.log('TEST 4: Student fetches calendar events\n');
    const studentRes = await request('GET', '/api/calendar', studentToken);
    console.log(`Status: ${studentRes.status}`);
    console.log(`Count: ${studentRes.data.length}`);
    console.log('Events visible to student:');
    studentRes.data.forEach(e => {
      console.log(`  ✓ "${e.title}" (publishFor: ${e.publishFor})`);
    });
    console.log('');

    // Test 5: Mentor fetches
    console.log('TEST 5: Mentor fetches calendar events\n');
    const mentorRes = await request('GET', '/api/calendar', mentorToken);
    console.log(`Status: ${mentorRes.status}`);
    console.log(`Count: ${mentorRes.data.length}`);
    console.log('Events visible to mentor:');
    mentorRes.data.forEach(e => {
      console.log(`  ✓ "${e.title}" (publishFor: ${e.publishFor})`);
    });
    console.log('');

    // Test 6: Admin fetches
    console.log('TEST 6: Admin fetches calendar events\n');
    const adminRes = await request('GET', '/api/calendar', adminToken);
    console.log(`Status: ${adminRes.status}`);
    console.log(`Count: ${adminRes.data.length}`);
    console.log('Events visible to admin:');
    adminRes.data.forEach(e => {
      console.log(`  ✓ "${e.title}" (publishFor: ${e.publishFor})`);
    });
    console.log('');

    // Verification
    console.log('='.repeat(70));
    console.log('VERIFICATION RESULTS:\n');

    const studentHasStudentOnly = studentRes.data.some(e => e.title === 'Student Assembly');
    const studentHasBoth = studentRes.data.some(e => e.title === 'School Holiday');
    const studentNoFaculty = !studentRes.data.some(e => e.title === 'Faculty Meeting');

    const mentorHasFacultyOnly = mentorRes.data.some(e => e.title === 'Faculty Meeting');
    const mentorHasBoth = mentorRes.data.some(e => e.title === 'School Holiday');
    const mentorNoStudent = !mentorRes.data.some(e => e.title === 'Student Assembly');

    const adminHasAll = adminRes.data.length === 3;

    console.log('STUDENT PORTAL:');
    console.log(`  ${studentHasStudentOnly ? '✅' : '❌'} Sees "Student Assembly" (publishFor: students)`);
    console.log(`  ${studentHasBoth ? '✅' : '❌'} Sees "School Holiday" (publishFor: both)`);
    console.log(`  ${studentNoFaculty ? '✅' : '❌'} Does NOT see "Faculty Meeting"`);
    console.log(`  Result: ${studentHasStudentOnly && studentHasBoth && studentNoFaculty ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');

    console.log('MENTOR PORTAL:');
    console.log(`  ${mentorHasFacultyOnly ? '✅' : '❌'} Sees "Faculty Meeting" (publishFor: mentors)`);
    console.log(`  ${mentorHasBoth ? '✅' : '❌'} Sees "School Holiday" (publishFor: both)`);
    console.log(`  ${mentorNoStudent ? '✅' : '❌'} Does NOT see "Student Assembly"`);
    console.log(`  Result: ${mentorHasFacultyOnly && mentorHasBoth && mentorNoStudent ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');

    console.log('ADMIN PORTAL:');
    console.log(`  ${adminHasAll ? '✅' : '❌'} Sees all 3 events`);
    console.log(`  Result: ${adminHasAll ? '✅ PASS' : '❌ FAIL'}`);
    console.log('');

    const allPass = studentHasStudentOnly && studentHasBoth && studentNoFaculty && 
                    mentorHasFacultyOnly && mentorHasBoth && mentorNoStudent && 
                    adminHasAll;

    console.log('='.repeat(70));
    if (allPass) {
      console.log('✅ ALL TESTS PASSED - CALENDAR FILTERING IS WORKING CORRECTLY!');
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
