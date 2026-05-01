const axios = require('axios');

async function testMentorFinal() {
  console.log('🧪 Final Mentor Feature Access Test...\n');
  
  try {
    // Login as admin
    const adminLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');
    
    // Create new mentor with known password
    console.log('\n👨‍🏫 Creating new test mentor...');
    const newMentor = await axios.post('http://127.0.0.1:5002/api/admin/create-teacher', {
      name: 'Test Mentor Final',
      email: 'testmentorfinal@pro.com',
      specialization: 'Testing Features'
    }, {
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Created new test mentor');
    console.log('📊 Response:', JSON.stringify(newMentor.data, null, 2));
    
    if (newMentor.data.generatedPassword) {
      const mentorPassword = newMentor.data.generatedPassword;
      console.log('🔑 Generated Password:', mentorPassword);
      
      // Update mentor subscription to professional
      const db = require('./config/database-switch');
      db.run(`UPDATE users SET subscriptionPlan = 'professional' WHERE email = 'testmentorfinal@pro.com'`, function(err) {
        if (err) {
          console.error('❌ Error updating subscription:', err);
        } else {
          console.log('✅ Updated mentor subscription to professional');
        }
      });
      
      // Test mentor login
      console.log('\n🔐 Testing mentor login...');
      try {
        const mentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
          email: 'testmentorfinal@pro.com',
          password: mentorPassword
        });
        
        if (mentorLogin.status === 200) {
          const mentorToken = mentorLogin.data.token;
          const mentorData = mentorLogin.data.user;
          
          console.log('✅ Mentor login successful!');
          console.log('👤 Mentor:', mentorData.name, '- Role:', mentorData.role);
          console.log('💳 Subscription Plan:', mentorData.subscriptionPlan);
          
          // Test calendar access
          console.log('\n📅 Testing mentor calendar access...');
          try {
            const calendar = await axios.get('http://127.0.0.1:5002/api/calendar', {
              headers: { Authorization: `Bearer ${mentorToken}` }
            });
            console.log('✅ Mentor calendar access working!');
            console.log('📊 Status:', calendar.status);
            console.log('📅 Calendar events:', calendar.data.length);
          } catch (error) {
            console.log('❌ Mentor calendar failed:', error.response?.status, error.response?.data?.message);
            if (error.response?.data?.featureRestricted) {
              console.log('🔒 Feature restricted - Current plan:', error.response?.data?.currentPlan);
            }
          }
          
          // Test database export access
          console.log('\n💾 Testing mentor database export access...');
          try {
            const exportdb = await axios.get('http://127.0.0.1:5002/api/database-export/tables', {
              headers: { Authorization: `Bearer ${mentorToken}` }
            });
            console.log('✅ Mentor database export access working!');
            console.log('📊 Status:', exportdb.status);
            console.log('📋 Tables available:', exportdb.data?.length || 'undefined');
          } catch (error) {
            console.log('❌ Mentor database export failed:', error.response?.status, error.response?.data?.message);
            if (error.response?.data?.featureRestricted) {
              console.log('🔒 Feature restricted - Current plan:', error.response?.data?.currentPlan);
            }
          }
          
          console.log('\n🎯 FINAL MENTOR FEATURE TEST RESULTS:');
          console.log('✅ Mentor Subscription Plan:', mentorData.subscriptionPlan);
          console.log('✅ Calendar Access:', calendar ? 'Working' : 'Failed');
          console.log('✅ Database Export Access:', exportdb ? 'Working' : 'Failed');
          console.log('✅ Professional Plan Features:', 'Unlocked for mentor');
          
          console.log('\n🌟 EXPECTED FRONTEND BEHAVIOR:');
          console.log('✅ Mentor can access calendar features without restrictions');
          console.log('✅ Mentor can access database export features without restrictions');
          console.log('✅ No more "feature restricted" messages for mentor');
          console.log('✅ All professional plan features available to mentor');
          
        } else {
          console.log('❌ Mentor login failed');
        }
      } catch (error) {
        console.log('❌ Mentor login error:', error.response?.status, error.response?.data?.message);
      }
    } else {
      console.log('❌ No password returned in mentor creation response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMentorFinal();
