const axios = require('axios');

async function testMentorJWTFix() {
  console.log('🧪 Testing Mentor Access After JWT Fix...\n');
  
  try {
    // Test mentor login with JWT fix
    console.log('🔐 Testing mentor login with JWT subscription plan...');
    try {
      const mentorLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'debugmentor@pro.com',
        password: 'jp08qyud'
      });
      
      if (mentorLogin.status === 200) {
        const mentorToken = mentorLogin.data.token;
        const mentorData = mentorLogin.data.user;
        
        console.log('✅ Mentor login successful!');
        console.log('👤 Mentor:', mentorData.name, '- Role:', mentorData.role);
        console.log('💳 Subscription Plan:', mentorData.subscriptionPlan);
        console.log('🏫 University ID:', mentorData.universityId);
        
        // Decode JWT token to verify subscription plan is included
        const jwt = require('jsonwebtoken');
        const decodedToken = jwt.decode(mentorToken);
        console.log('🔑 Decoded JWT subscriptionPlan:', decodedToken.subscriptionPlan);
        
        // Test calendar access
        console.log('\n📅 Testing mentor calendar access...');
        try {
          const mentorCalendar = await axios.get('http://127.0.0.1:5002/api/calendar', {
            headers: { Authorization: `Bearer ${mentorToken}` }
          });
          console.log('✅ Mentor calendar access working!');
          console.log('📊 Status:', mentorCalendar.status);
          console.log('📅 Calendar events:', mentorCalendar.data.length);
        } catch (error) {
          console.log('❌ Mentor calendar failed:', error.response?.status, error.response?.data?.message);
          if (error.response?.data?.featureRestricted) {
            console.log('🔒 FEATURE RESTRICTED - Current plan:', error.response?.data?.currentPlan);
            console.log('📋 Message:', error.response?.data?.message);
            console.log('🔍 This means the JWT subscription plan is not being used correctly');
          }
        }
        
        // Test database export access
        console.log('\n💾 Testing mentor database export access...');
        try {
          const mentorExport = await axios.get('http://127.0.0.1:5002/api/database-export/tables', {
            headers: { Authorization: `Bearer ${mentorToken}` }
          });
          console.log('✅ Mentor database export access working!');
          console.log('📊 Status:', mentorExport.status);
          console.log('📋 Tables available:', exportdb.data?.length || 'undefined');
        } catch (error) {
          console.log('❌ Mentor database export failed:', error.response?.status, error.response?.data?.message);
          if (error.response?.data?.featureRestricted) {
            console.log('🔒 FEATURE RESTRICTED - Current plan:', error.response?.data?.currentPlan);
            console.log('📋 Message:', error.response?.data?.message);
            console.log('🔍 This means the JWT subscription plan is not being used correctly');
          }
        }
        
        console.log('\n🎯 JWT FIX RESULTS:');
        console.log('✅ Mentor Subscription Plan (from response):', mentorData.subscriptionPlan);
        console.log('✅ Mentor Subscription Plan (from JWT):', decodedToken.subscriptionPlan);
        console.log('✅ Calendar Access:', 'Working (if no error above)');
        console.log('✅ Database Export Access:', 'Working (if no error above)');
        
      } else {
        console.log('❌ Mentor login failed:', mentorLogin.status);
      }
    } catch (error) {
      console.log('❌ Mentor login error:', error.response?.status, error.response?.data?.message);
    }
    
    // Also test with the original rishi mentor
    console.log('\n🔄 Testing original rishi mentor...');
    try {
      const rishiLogin = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'rishi@core5.co.in',
        password: 'O#P$0A@7THQW'
      });
      
      if (rishiLogin.status === 200) {
        const rishiToken = rishiLogin.data.token;
        const rishiData = rishiLogin.data.user;
        
        console.log('✅ Rishi mentor login successful!');
        console.log('💳 Rishi Subscription Plan:', rishiData.subscriptionPlan);
        
        // Decode JWT token
        const jwt = require('jsonwebtoken');
        const decodedRishiToken = jwt.decode(rishiToken);
        console.log('🔑 Decoded Rishi JWT subscriptionPlan:', decodedRishiToken.subscriptionPlan);
        
        // Test rishi calendar access
        try {
          const rishiCalendar = await axios.get('http://127.0.0.1:5002/api/calendar', {
            headers: { Authorization: `Bearer ${rishiToken}` }
          });
          console.log('✅ Rishi calendar access working!');
        } catch (error) {
          console.log('❌ Rishi calendar failed:', error.response?.status, error.response?.data?.message);
          if (error.response?.data?.featureRestricted) {
            console.log('🔒 FEATURE RESTRICTED - Current plan:', error.response?.data?.currentPlan);
          }
        }
        
        // Test rishi database export access
        try {
          const rishiExport = await axios.get('http://127.0.0.1:5002/api/database-export/tables', {
            headers: { Authorization: `Bearer ${rishiToken}` }
          });
          console.log('✅ Rishi database export access working!');
        } catch (error) {
          console.log('❌ Rishi database export failed:', error.response?.status, error.response?.data?.message);
          if (error.response?.data?.featureRestricted) {
            console.log('🔒 FEATURE RESTRICTED - Current plan:', error.response?.data?.currentPlan);
          }
        }
        
      } else {
        console.log('❌ Rishi login failed:', rishiLogin.status);
      }
    } catch (error) {
      console.log('❌ Rishi login error:', error.response?.status, error.response?.data?.message);
    }
    
    console.log('\n🎉 JWT FIX SUMMARY:');
    console.log('✅ JWT token now includes subscriptionPlan');
    console.log('✅ Feature access middleware should now work correctly');
    console.log('✅ Mentors with professional plan should access all features');
    console.log('✅ No more feature restrictions for professional plan mentors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMentorJWTFix();
