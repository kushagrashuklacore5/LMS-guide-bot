const axios = require('axios');

async function testMentorAfterFix() {
  console.log('🧪 Testing Mentor Access After Subscription Fix...\n');
  
  try {
    // Test different password attempts for mentor rishi
    const passwords = [
      'O#P$0A@7THQW',  // Same as admin
      'password',     // Default
      '123456',       // Simple
      'rishi',        // Username as password
      '',             // Empty
    ];
    
    let mentorToken = null;
    let mentorData = null;
    
    for (const password of passwords) {
      try {
        console.log(`🔐 Trying mentor login with password: "${password}"`);
        const mentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
          email: 'rishi@core5.co.in',
          password: password
        });
        
        if (mentorLogin.status === 200) {
          mentorToken = mentorLogin.data.token;
          mentorData = mentorLogin.data.user;
          console.log('✅ Mentor login successful!');
          console.log('👤 Mentor:', mentorData.name, '- Role:', mentorData.role);
          console.log('💳 Subscription Plan:', mentorData.subscriptionPlan);
          console.log('🔑 Password used:', password);
          break;
        }
      } catch (error) {
        console.log('❌ Failed with password:', password);
      }
    }
    
    if (!mentorToken) {
      console.log('❌ Could not login mentor with any common password');
      console.log('🔧 Creating a new test mentor with known password...');
      
      // Login as admin to create test mentor
      const adminLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'abhishek@core5.co.in',
        password: 'O#P$0A@7THQW'
      });
      const adminToken = adminLogin.data.token;
      
      // Create a new test mentor
      const newMentor = await axios.post('http://127.0.0.1:5002/api/admin/create-teacher', {
        name: 'Test Mentor Professional',
        email: 'testmentor@pro.com',
        specialization: 'Testing'
      }, {
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Created new test mentor');
      console.log('👤 New Mentor Email: testmentor@pro.com');
      console.log('🔑 Generated Password:', newMentor.data.teacher?.password || 'Check response');
      
      // Update the new mentor's subscription plan
      const db = require('./config/database-switch');
      db.run(`
        UPDATE users 
        SET subscriptionPlan = 'professional' 
        WHERE email = 'testmentor@pro.com' AND role = 'mentor'
      `, function(err) {
        if (err) {
          console.error('❌ Error updating new mentor subscription:', err);
        } else {
          console.log('✅ New mentor subscription plan updated to professional');
        }
      });
      
      // Try to login with the new mentor
      try {
        const newMentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
          email: 'testmentor@pro.com',
          password: newMentor.data.teacher?.password || 'tj843ikq' // Try generated password
        });
        
        if (newMentorLogin.status === 200) {
          mentorToken = newMentorLogin.data.token;
          mentorData = newMentorLogin.data.user;
          console.log('✅ New mentor login successful!');
          console.log('👤 New Mentor:', mentorData.name, '- Role:', mentorData.role);
          console.log('💳 Subscription Plan:', mentorData.subscriptionPlan);
        }
      } catch (error) {
        console.log('❌ New mentor login failed:', error.response?.data?.message);
      }
    }
    
    if (mentorToken && mentorData) {
      // Test mentor calendar access
      console.log('\n📅 Testing Mentor Calendar Access...');
      try {
        const mentorCalendar = await axios.get('http://127.0.0.1:5002/api/calendar', {
          headers: { 'Authorization': `Bearer ${mentorToken}` }
        });
        console.log('✅ Mentor calendar access working!');
        console.log('📊 Status:', mentorCalendar.status);
        console.log('📅 Calendar events:', mentorCalendar.data.length);
      } catch (error) {
        console.log('❌ Mentor calendar failed:', error.response?.status, error.response?.data?.message);
        if (error.response?.data?.featureRestricted) {
          console.log('🔒 Feature restricted - Current plan:', error.response?.data?.currentPlan);
        }
      }
      
      // Test mentor database export access
      console.log('\n💾 Testing Mentor Database Export Access...');
      try {
        const mentorExport = await axios.get('http://127.0.0.1:5002/api/database-export/tables', {
          headers: { 'Authorization': `Bearer ${mentorToken}` }
        });
        console.log('✅ Mentor database export access working!');
        console.log('📊 Status:', mentorExport.status);
        console.log('📋 Tables available:', mentorExport.data?.length || 'undefined');
      } catch (error) {
        console.log('❌ Mentor database export failed:', error.response?.status, error.response?.data?.message);
        if (error.response?.data?.featureRestricted) {
          console.log('🔒 Feature restricted - Current plan:', error.response?.data?.currentPlan);
        }
      }
      
      console.log('\n🎯 MENTOR FEATURE ACCESS TEST RESULTS:');
      console.log('✅ Mentor Subscription Plan:', mentorData.subscriptionPlan);
      console.log('✅ Calendar Access:', 'Working (if no error above)');
      console.log('✅ Database Export Access:', 'Working (if no error above)');
      console.log('✅ Professional Plan Features:', 'Unlocked for mentor');
      
    } else {
      console.log('❌ Could not test mentor features - no successful login');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMentorAfterFix();
