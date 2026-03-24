#!/usr/bin/env node
/**
 * Test script: Complete Announcement System
 * Tests creating announcements for different audiences and verifying they appear in correct portals
 * 
 * Run: node test-complete-announcements.js
 */

const http = require('http');
const jwt = require('jsonwebtoken');

const API_URL = 'http://localhost:5002';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Create tokens for different roles
const adminToken = jwt.sign({ userId: 1, role: 'admin', name: 'Admin' }, JWT_SECRET, { expiresIn: '1h' });
const studentToken = jwt.sign({ userId: 3, role: 'student', name: 'Student' }, JWT_SECRET, { expiresIn: '1h' });
const mentorToken = jwt.sign({ userId: 2, role: 'mentor', name: 'Mentor' }, JWT_SECRET, { expiresIn: '1h' });

function makeRequest(method, path, token, data = null) {
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

    if (payload) {
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
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

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('🧪 ANNOUNCEMENT SYSTEM - COMPLETE TEST');
  console.log('='.repeat(70) + '\n');

  try {
    // Test 1: Create announcement for students only
    console.log('📌 TEST 1: Create announcement for STUDENTS ONLY\n');
    const ann1 = await makeRequest('POST', '/api/announcements', adminToken, {
      title: 'Student Update',
      message: 'This announcement is only for students',
      publishFor: 'students'
    });
    console.log(`Status: ${ann1.status}`);
    console.log(`Response:`, JSON.stringify(ann1.data, null, 2));
    console.log('');

    // Test 2: Create announcement for mentors only
    console.log('📌 TEST 2: Create announcement for MENTORS/FACULTY ONLY\n');
    const ann2 = await makeRequest('POST', '/api/announcements', adminToken, {
      title: 'Faculty Notice',
      message: 'This announcement is only for faculty',
      publishFor: 'mentors'
    });
    console.log(`Status: ${ann2.status}`);
    console.log(`Response:`, JSON.stringify(ann2.data, null, 2));
    console.log('');

    // Test 3: Create announcement for both
    console.log('📌 TEST 3: Create announcement for BOTH (students AND faculty)\n');
    const ann3 = await makeRequest('POST', '/api/announcements', adminToken, {
      title: 'General Announcement',
      message: 'This announcement is for everyone',
      publishFor: 'both'
    });
    console.log(`Status: ${ann3.status}`);
    console.log(`Response:`, JSON.stringify(ann3.data, null, 2));
    console.log('');

    // Test 4: Student fetches announcements (should see ann1 and ann3)
    console.log('📌 TEST 4: Student fetches announcements\n');
    const studentAnn = await makeRequest('GET', '/api/announcements', studentToken);
    console.log(`Status: ${studentAnn.status}`);
    console.log(`Count: ${studentAnn.data.length}`);
    console.log(`Announcements for student:`);
    studentAnn.data.forEach(ann => {
      console.log(`  - "${ann.title}" (publishFor: ${ann.publishFor})`);
    });
    console.log('');

    // Test 5: Mentor fetches announcements (should see ann2 and ann3)
    console.log('📌 TEST 5: Mentor fetches announcements\n');
    const mentorAnn = await makeRequest('GET', '/api/announcements', mentorToken);
    console.log(`Status: ${mentorAnn.status}`);
    console.log(`Count: ${mentorAnn.data.length}`);
    console.log(`Announcements for mentor:`);
    mentorAnn.data.forEach(ann => {
      console.log(`  - "${ann.title}" (publishFor: ${ann.publishFor})`);
    });
    console.log('');

    // Test 6: Admin fetches announcements (should see all)
    console.log('📌 TEST 6: Admin fetches announcements\n');
    const adminAnn = await makeRequest('GET', '/api/announcements', adminToken);
    console.log(`Status: ${adminAnn.status}`);
    console.log(`Count: ${adminAnn.data.length}`);
    console.log(`Announcements for admin:`);
    adminAnn.data.forEach(ann => {
      console.log(`  - "${ann.title}" (publishFor: ${ann.publishFor})`);
    });
    console.log('');

    // Test 7: Mark announcement as read
    if (ann1.data.announcement) {
      console.log('📌 TEST 7: Student marks announcement as read\n');
      const markRead = await makeRequest('PUT', `/api/announcements/${ann1.data.announcement.id}/read`, studentToken);
      console.log(`Status: ${markRead.status}`);
      console.log(`Response:`, JSON.stringify(markRead.data, null, 2));
      console.log('');

      // Verify read status
      const afterRead = await makeRequest('GET', '/api/announcements', studentToken);
      console.log('After marking as read:');
      afterRead.data.forEach(ann => {
        let readBy = [];
        try { readBy = JSON.parse(ann.readBy || '[]'); } catch (e) { readBy = []; }
        console.log(`  - "${ann.title}": readBy=[${readBy.join(', ')}]`);
      });
      console.log('');
    }

    // Test 8: Verify filtering
    console.log('📌 TEST 8: VERIFICATION - Filtering Logic\n');
    console.log('Student should see:');
    console.log('  ✓ "Student Update" (publishFor: students)');
    console.log('  ✓ "General Announcement" (publishFor: both)');
    console.log(`  Actual: ${studentAnn.data.length} announcement(s)\n`);

    console.log('Mentor should see:');
    console.log('  ✓ "Faculty Notice" (publishFor: mentors)');
    console.log('  ✓ "General Announcement" (publishFor: both)');
    console.log(`  Actual: ${mentorAnn.data.length} announcement(s)\n`);

    console.log('Admin should see:');
    console.log('  ✓ All 3 announcements');
    console.log(`  Actual: ${adminAnn.data.length} announcement(s)\n`);

    // Validation
    const studentValid = studentAnn.data.length === 2 && studentAnn.data.some(a => a.title === 'Student Update') && studentAnn.data.some(a => a.title === 'General Announcement');
    const mentorValid = mentorAnn.data.length === 2 && mentorAnn.data.some(a => a.title === 'Faculty Notice') && mentorAnn.data.some(a => a.title === 'General Announcement');
    const adminValid = adminAnn.data.length === 3;

    console.log(studentValid ? '✅ Student filtering: PASS' : '❌ Student filtering: FAIL');
    console.log(mentorValid ? '✅ Mentor filtering: PASS' : '❌ Mentor filtering: FAIL');
    console.log(adminValid ? '✅ Admin filtering: PASS' : '❌ Admin filtering: FAIL');

    if (studentValid && mentorValid && adminValid) {
      console.log('\n' + '='.repeat(70));
      console.log('✅ ALL TESTS PASSED - ANNOUNCEMENT SYSTEM IS WORKING CORRECTLY');
      console.log('='.repeat(70) + '\n');
    } else {
      console.log('\n' + '='.repeat(70));
      console.log('⚠️ SOME TESTS FAILED - CHECK THE FILTERING LOGIC');
      console.log('='.repeat(70) + '\n');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

runTests().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
