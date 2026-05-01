const axios = require('axios');

async function debugLoginUserData() {
  console.log('🔍 Debugging Login User Data...\n');
  
  try {
    // Check the actual user data in database
    console.log('💾 Checking user data in database...');
    const db = require('./config/database-switch');
    
    db.get('SELECT * FROM users WHERE email = ?', ['debugmentor@pro.com'], (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
      } else if (user) {
        console.log('👤 User data from database:');
        console.log('   ID:', user.id);
        console.log('   Name:', user.name);
        console.log('   Email:', user.email);
        console.log('   Role:', user.role);
        console.log('   University ID:', user.university_id);
        console.log('   Subscription Plan:', user.subscriptionPlan);
        console.log('   Is Approved:', user.isApproved);
        console.log('   All fields:', Object.keys(user));
        
        console.log('\n🔐 Testing login with this user...');
        
        // Now test the actual login
        axios.post('http://127.0.0.1:5002/api/auth/login', {
          email: 'debugmentor@pro.com',
          password: 'jp08qyud'
        }).then(mentorLogin => {
          if (mentorLogin.status === 200) {
            const mentorToken = mentorLogin.data.token;
            const mentorData = mentorLogin.data.user;
            
            console.log('✅ Mentor login successful!');
            console.log('👤 Mentor data from login response:');
            console.log('   ID:', mentorData.id);
            console.log('   Name:', mentorData.name);
            console.log('   Email:', mentorData.email);
            console.log('   Role:', mentorData.role);
            console.log('   University ID:', mentorData.universityId);
            console.log('   Subscription Plan:', mentorData.subscriptionPlan);
            console.log('   Is Approved:', mentorData.isApproved);
            console.log('   All fields:', Object.keys(mentorData));
            
            // Decode JWT token
            const jwt = require('jsonwebtoken');
            const decodedToken = jwt.decode(mentorToken);
            console.log('🔑 Decoded JWT token:');
            console.log('   All fields:', Object.keys(decodedToken));
            console.log('   Subscription Plan:', decodedToken.subscriptionPlan);
            
            console.log('\n🔍 COMPARISON:');
            console.log('Database subscriptionPlan:', user.subscriptionPlan);
            console.log('Login response subscriptionPlan:', mentorData.subscriptionPlan);
            console.log('JWT token subscriptionPlan:', decodedToken.subscriptionPlan);
            
            console.log('\n🎯 ISSUE ANALYSIS:');
            if (!user.subscriptionPlan) {
              console.log('❌ Database subscriptionPlan is null/undefined');
            }
            if (!mentorData.subscriptionPlan) {
              console.log('❌ Login response subscriptionPlan is null/undefined');
            }
            if (!decodedToken.subscriptionPlan) {
              console.log('❌ JWT token subscriptionPlan is null/undefined');
            }
            
            if (user.subscriptionPlan && mentorData.subscriptionPlan && decodedToken.subscriptionPlan) {
              console.log('✅ All subscription plans are present and matching');
            }
            
          } else {
            console.log('❌ Mentor login failed:', mentorLogin.status);
          }
        }).catch(error => {
          console.log('❌ Mentor login error:', error.response?.status, error.response?.data?.message);
        });
        
      } else {
        console.log('❌ User not found in database');
      }
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugLoginUserData();
