// Simple test using curl to verify calendar propagation
const { exec } = require('child_process');

async function testCalendarPropagation() {
  console.log('🧪 Testing Calendar Feature Access Propagation Fix\n');
  
  try {
    // Step 1: Login as superadmin and get token
    console.log('\n1️⃣ Logging in as Superadmin...');
    const loginCommand = `curl -s -X POST http://localhost:5002/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@core5.com\",\"password\":\"admin123\"}"`;
    
    exec(loginCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Login failed:', error);
        return;
      }
      
      const tokenMatch = stdout.match(/"token":"([^"]+)"/);
      if (!tokenMatch) {
        console.error('❌ No token found in response');
        return;
      }
      
      const superadminToken = tokenMatch[1];
      console.log('✅ Superadmin login successful');
      
      // Step 2: Upgrade to Standard Plan
      console.log('\n2️⃣ Upgrading to Standard Plan...');
      const upgradeCommand = `curl -s -X POST http://localhost:5002/api/subscriptions/test-upgrade -H "Content-Type: application/json" -H "Authorization: Bearer ${superadminToken}" -d "{\"planId\":\"standard\",\"planName\":\"Standard Plan\"}"`;
      
      exec(upgradeCommand, (upgradeError, upgradeStdout, upgradeStderr) => {
        if (upgradeError) {
          console.error('❌ Upgrade failed:', upgradeError);
          return;
        }
        
        console.log('✅ Plan upgrade response:', upgradeStdout);
        
        // Step 3: Check feature access as regular user
        console.log('\n3️⃣ Testing Calendar Access as Regular User...');
        const userLoginCommand = `curl -s -X POST http://localhost:5002/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"student@core5.com\",\"password\":\"student123\"}"`;
        
        exec(userLoginCommand, (userLoginError, userStdout, userStderr) => {
          if (userLoginError) {
            console.error('❌ User login failed:', userLoginError);
            return;
          }
          
          const userTokenMatch = userStdout.match(/"token":"([^"]+)"/);
          if (!userTokenMatch) {
            console.error('❌ No user token found in response');
            return;
          }
          
          const userToken = userTokenMatch[1];
          console.log('✅ User login successful');
          
          // Check feature access
          const featureCommand = `curl -s -X GET http://localhost:5002/api/subscriptions/check-feature-access -H "Authorization: Bearer ${userToken}"`;
          
          exec(featureCommand, (featureError, featureStdout, featureStderr) => {
            if (featureError) {
              console.error('❌ Feature check failed:', featureError);
              return;
            }
            
            console.log('📋 User Plan Response:', featureStdout);
            
            const planMatch = featureStdout.match(/"currentPlan":"([^"]+)"/);
            const calendarMatch = featureStdout.match(/"canAccessCalendar":(true|false)/);
            
            if (planMatch && calendarMatch) {
              console.log(`📋 User Plan: ${planMatch[1]}`);
              console.log(`📅 Calendar Access: ${calendarMatch[1] === 'true' ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
              
              // Step 4: Try to access calendar
              console.log('\n4️⃣ Testing Calendar Access...');
              const calendarCommand = `curl -s -X GET http://localhost:5002/api/calendar -H "Authorization: Bearer ${userToken}"`;
              
              exec(calendarCommand, (calendarError, calendarStdout, calendarStderr) => {
                if (calendarError) {
                  console.error('❌ Calendar check failed:', calendarError);
                  return;
                }
                
                if (calendarMatch[1] === 'true') {
                  console.log('📅 Calendar API: ✅ Should be accessible');
                  if (calendarStdout.includes('message') || calendarStderr) {
                    console.log('📅 Calendar API: ❌ Unexpectedly blocked:', calendarStdout || calendarStderr);
                  } else {
                    console.log('📅 Calendar API: ✅ Accessible (events found)');
                  }
                } else {
                  console.log('📅 Calendar API: 🔒 Should be blocked');
                  if (calendarStdout.includes('message') || calendarStderr) {
                    console.log('📅 Calendar API: ✅ Correctly blocked:', calendarStdout || calendarStderr);
                  } else {
                    console.log('📅 Calendar API: ❌ Unexpectedly accessible');
                  }
                }
              });
            } else {
              console.error('❌ Could not parse feature check response');
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n🎯 Test completed!');
  console.log('\n📝 Expected Behavior:');
  console.log('- When superadmin upgrades to Standard: All users under that university should get calendar access');
  console.log('- When superadmin downgrades to Free: All users under that university should lose calendar access');
  console.log('- Users should see calendar unlocked/locked based on university subscription plan');
}

testCalendarPropagation();
