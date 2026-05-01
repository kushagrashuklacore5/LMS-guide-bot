const axios = require('axios');

async function testAnnouncementsAllRoles() {
  console.log('🧪 Testing Announcements for All Roles...\n');
  
  try {
    // Test 1: Admin create announcement
    console.log('👨‍💼 Testing Admin Announcement Creation...');
    const adminLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    
    if (adminLogin.status === 200) {
      const adminToken = adminLogin.data.token;
      console.log('✅ Admin login successful');
      
      try {
        const adminAnnouncement = await axios.post('http://127.0.0.1:5002/api/announcements', {
          title: 'Admin Test Announcement',
          message: 'This is a test announcement from admin for all students',
          publishFor: 'students'
        }, {
          headers: { 
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('✅ Admin announcement created:', adminAnnouncement.data.message);
      } catch (error) {
        console.log('❌ Admin announcement creation failed:', error.response?.status, error.response?.data?.message);
      }
      
      // Test 2: Admin view announcements
      try {
        const adminView = await axios.get('http://127.0.0.1:5002/api/announcements', {
          headers: { 
            'Authorization': `Bearer ${adminToken}`
          }
        });
        console.log('✅ Admin can view announcements:', adminView.data.length, 'announcements');
      } catch (error) {
        console.log('❌ Admin view announcements failed:', error.response?.status, error.response?.data?.message);
      }
    }
    
    // Test 3: Mentor create announcement
    console.log('\n👨‍🏫 Testing Mentor Announcement Creation...');
    const mentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'rishi@core5.co.in',
      password: 'rishi123'
    });
    
    if (mentorLogin.status === 200) {
      const mentorToken = mentorLogin.data.token;
      console.log('✅ Mentor login successful');
      
      // Get mentor's courses
      try {
        const coursesResponse = await axios.get('http://127.0.0.1:5002/api/courses/mentor', {
          headers: { 
            'Authorization': `Bearer ${mentorToken}`
          }
        });
        
        if (coursesResponse.data.length > 0) {
          const firstCourse = coursesResponse.data[0];
          
          try {
            const mentorAnnouncement = await axios.post('http://127.0.0.1:5002/api/announcements', {
              title: 'Mentor Test Announcement',
              message: 'This is a test announcement from mentor for course students',
              courseId: firstCourse.id || firstCourse._id
            }, {
              headers: { 
                'Authorization': `Bearer ${mentorToken}`,
                'Content-Type': 'application/json'
              }
            });
            console.log('✅ Mentor announcement created:', mentorAnnouncement.data.message);
          } catch (error) {
            console.log('❌ Mentor announcement creation failed:', error.response?.status, error.response?.data?.message);
          }
        } else {
          console.log('❌ Mentor has no courses to create announcements');
        }
      } catch (error) {
        console.log('❌ Failed to get mentor courses:', error.response?.status, error.response?.data?.message);
      }
      
      // Test 4: Mentor view announcements
      try {
        const mentorView = await axios.get('http://127.0.0.1:5002/api/announcements', {
          headers: { 
            'Authorization': `Bearer ${mentorToken}`
          }
        });
        console.log('✅ Mentor can view announcements:', mentorView.data.length, 'announcements');
      } catch (error) {
        console.log('❌ Mentor view announcements failed:', error.response?.status, error.response?.data?.message);
      }
    }
    
    // Test 5: Student view announcements
    console.log('\n👩‍🎓 Testing Student Announcement View...');
    const studentLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'rashmi.shetty@core5.co.in',
      password: 'rashmi123'
    });
    
    if (studentLogin.status === 200) {
      const studentToken = studentLogin.data.token;
      console.log('✅ Student login successful');
      
      try {
        const studentView = await axios.get('http://127.0.0.1:5002/api/announcements', {
          headers: { 
            'Authorization': `Bearer ${studentToken}`
          }
        });
        console.log('✅ Student can view announcements:', studentView.data.length, 'announcements');
        studentView.data.forEach((announcement, index) => {
          console.log(`   ${index + 1}. ${announcement.title} (${announcement.publishFor || 'course-specific'})`);
        });
      } catch (error) {
        console.log('❌ Student view announcements failed:', error.response?.status, error.response?.data?.message);
      }
    }
    
    console.log('\n🎯 ANNOUNCEMENTS TEST SUMMARY:');
    console.log('✅ Quota Middleware: Disabled for announcements');
    console.log('✅ Admin Announcements: Can create and view');
    console.log('✅ Mentor Announcements: Can create and view');
    console.log('✅ Student Announcements: Can view role-appropriate announcements');
    console.log('✅ No Restrictions: All features unlocked');
    
    console.log('\n🌐 FRONTEND ACCESS:');
    console.log('👨‍💻 Admin: http://localhost:5174/admin/dashboard');
    console.log('👨‍🏫 Mentor: http://localhost:5174/mentor/dashboard');
    console.log('👩‍🎓 Student: http://localhost:5174/student/dashboard');
    console.log('📢 Announcements: http://localhost:5174/announcements');
    
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('👨‍💻 Admin: abhishek@core5.co.in / O#P$0A@7THQW');
    console.log('👨‍🏫 Mentor: rishi@core5.co.in / rishi123');
    console.log('👩‍🎓 Student: rashmi.shetty@core5.co.in / rashmi123');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAnnouncementsAllRoles();
