const axios = require('axios');

async function testMentorFeatureAccess() {
  console.log('🔍 Testing Mentor Feature Access Issue...\n');
  
  try {
    // Test 1: Check superadmin subscription
    console.log('👑 Test 1: Check SuperAdmin Subscription');
    const adminLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
      email: 'abhishek@core5.co.in',
      password: 'O#P$0A@7THQW'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');
    console.log('👤 Admin:', adminLogin.data.user.name, '- Role:', adminLogin.data.user.role);
    console.log('📊 Admin University ID:', adminLogin.data.user.universityId);
    
    // Test 2: Check admin's feature access
    console.log('\n📅 Test 2: Admin Calendar Access');
    try {
      const adminCalendar = await axios.get('http://127.0.0.1:5002/api/calendar', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      console.log('✅ Admin calendar access working');
    } catch (error) {
      console.log('❌ Admin calendar failed:', error.response?.status, error.response?.data?.message);
      if (error.response?.data?.featureRestricted) {
        console.log('🔒 Feature restricted - Current plan:', error.response?.data?.currentPlan);
      }
    }
    
    console.log('\n💾 Test 3: Admin Database Export Access');
    try {
      const adminExport = await axios.get('http://127.0.0.1:5002/api/database-export/tables', {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      console.log('✅ Admin database export access working');
    } catch (error) {
      console.log('❌ Admin database export failed:', error.response?.status, error.response?.data?.message);
      if (error.response?.data?.featureRestricted) {
        console.log('🔒 Feature restricted - Current plan:', error.response?.data?.currentPlan);
      }
    }
    
    // Test 3: Check mentor subscription and access
    console.log('\n👨‍🏫 Test 4: Check Mentor Subscription');
    try {
      // Try to login as mentor rishi
      const mentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'rishi@core5.co.in',
        password: 'O#P$0A@7THQW'
      });
      
      if (mentorLogin.status === 200) {
        const mentorToken = mentorLogin.data.token;
        console.log('✅ Mentor login successful');
        console.log('👤 Mentor:', mentorLogin.data.user.name, '- Role:', mentorLogin.data.user.role);
        console.log('📊 Mentor University ID:', mentorLogin.data.user.universityId);
        console.log('💳 Mentor Subscription Plan:', mentorLogin.data.user.subscriptionPlan);
        
        // Test mentor calendar access
        console.log('\n📅 Test 5: Mentor Calendar Access');
        try {
          const mentorCalendar = await axios.get('http://127.0.0.1:5002/api/calendar', {
            headers: { 'Authorization': `Bearer ${mentorToken}` }
          });
          console.log('✅ Mentor calendar access working');
        } catch (error) {
          console.log('❌ Mentor calendar failed:', error.response?.status, error.response?.data?.message);
          if (error.response?.data?.featureRestricted) {
            console.log('🔒 Feature restricted - Current plan:', error.response?.data?.currentPlan);
          }
        }
        
        // Test mentor database export access
        console.log('\n💾 Test 6: Mentor Database Export Access');
        try {
          const mentorExport = await axios.get('http://127.0.0.1:5002/api/database-export/tables', {
            headers: { 'Authorization': `Bearer ${mentorToken}` }
          });
          console.log('✅ Mentor database export access working');
        } catch (error) {
          console.log('❌ Mentor database export failed:', error.response?.status, error.response?.data?.message);
          if (error.response?.data?.featureRestricted) {
            console.log('🔒 Feature restricted - Current plan:', error.response?.data?.currentPlan);
          }
        }
        
      } else {
        console.log('❌ Mentor login failed');
      }
    } catch (error) {
      console.log('❌ Mentor login error:', error.response?.status, error.response?.data?.message);
    }
    
    // Test 4: Check database subscription info
    console.log('\n💾 Test 7: Check Database Subscription Info');
    const db = require('./config/database-switch');
    
    // Check user subscription
    db.get('SELECT id, name, email, role, subscriptionPlan, university_id FROM users WHERE email = ?', ['rishi@core5.co.in'], (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
      } else if (user) {
        console.log('👤 Mentor User Data:');
        console.log('   ID:', user.id);
        console.log('   Name:', user.name);
        console.log('   Role:', user.role);
        console.log('   Subscription Plan:', user.subscriptionPlan);
        console.log('   University ID:', user.university_id);
        
        // Check university subscription
        db.get('SELECT id, name, subscriptionPlan, adminId FROM universities WHERE id = ?', [user.university_id], (err, university) => {
          if (err) {
            console.error('Error fetching university:', err);
          } else if (university) {
            console.log('🏫 University Data:');
            console.log('   ID:', university.id);
            console.log('   Name:', university.name);
            console.log('   Subscription Plan:', university.subscriptionPlan);
            console.log('   Admin ID:', university.adminId);
            
            // Check superadmin subscription
            db.get('SELECT planType, planName, status FROM subscriptions WHERE superadminId = ?', [`superadmin-${university.adminId}`], (err, subscription) => {
              if (err) {
                console.error('Error fetching subscription:', err);
              } else if (subscription) {
                console.log('💎 SuperAdmin Subscription:');
                console.log('   Plan Type:', subscription.planType);
                console.log('   Plan Name:', subscription.planName);
                console.log('   Status:', subscription.status);
              } else {
                console.log('❌ No SuperAdmin subscription found');
              }
            });
          } else {
            console.log('❌ University not found');
          }
        });
      } else {
        console.log('❌ User not found');
      }
    });
    
    console.log('\n🎯 FEATURE ACCESS ISSUE ANALYSIS:');
    console.log('✅ Admin Features: Should work (professional plan)');
    console.log('❌ Mentor Features: Currently locked despite professional plan');
    console.log('🔍 Issue: Mentor subscription plan inheritance not working properly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMentorFeatureAccess();
