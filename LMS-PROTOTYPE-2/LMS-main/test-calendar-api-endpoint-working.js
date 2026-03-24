const http = require('http');

console.log('🧪 Testing Calendar API Endpoint Working...\n');

async function testCalendarAPIEndpointWorking() {
  try {
    // Step 1: Test the check-feature-access endpoint
    console.log('1️⃣ Testing /api/subscriptions/check-feature-access endpoint:');
    
    const featureAccessTest = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5002,
        path: '/api/subscriptions/check-feature-access',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token-for-aniket2'
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
            resolve({ status: res.statusCode, response });
          } catch (parseError) {
            console.log(`   Parse Error: ${data}`);
            resolve({ status: res.statusCode, response: null, error: parseError.message });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Request Error: ${err.message}`);
        resolve({ status: 0, response: null, error: err.message });
      });
      
      req.setTimeout(() => {
        console.log('   Request Timeout');
        resolve({ status: 0, response: null, error: 'timeout' });
      }, 5000);
      
      req.end();
    });
    
    // Step 2: Test the calendar API endpoint
    console.log('\n2️⃣ Testing /api/calendar endpoint:');
    
    const calendarAPITest = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5002,
        path: '/api/calendar',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token-for-aniket2'
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log(`   Status: ${res.statusCode}`);
            console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
            resolve({ status: res.statusCode, response });
          } catch (parseError) {
            console.log(`   Parse Error: ${data}`);
            resolve({ status: res.statusCode, response: null, error: parseError.message });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Request Error: ${err.message}`);
        resolve({ status: 0, response: null, error: err.message });
      });
      
      req.setTimeout(() => {
        console.log('   Request Timeout');
        resolve({ status: 0, response: null, error: 'timeout' });
      }, 5000);
      
      req.end();
    });
    
    // Step 3: Analysis
    console.log('\n🎯 API Endpoint Analysis:');
    
    console.log('\n📊 Feature Access API:');
    console.log(`   Status: ${featureAccessTest.status}`);
    if (featureAccessTest.response) {
      console.log(`   Success: ${featureAccessTest.response.success}`);
      console.log(`   Current Plan: ${featureAccessTest.response.currentPlan}`);
      console.log(`   Can Access Calendar: ${featureAccessTest.response.canAccessCalendar}`);
      console.log(`   Message: ${featureAccessTest.response.message}`);
    }
    
    console.log('\n📊 Calendar API:');
    console.log(`   Status: ${calendarAPITest.status}`);
    if (calendarAPITest.response) {
      console.log(`   Events Count: ${calendarAPITest.response.length || 0}`);
      console.log(`   Success: ${calendarAPITest.response.success !== false}`);
    }
    
    // Step 4: Diagnosis
    console.log('\n🔍 Diagnosis:');
    
    if (featureAccessTest.status === 200 && featureAccessTest.response?.canAccessCalendar === false) {
      console.log('✅ Feature Access API is working correctly');
      console.log('   - Returns canAccessCalendar: false (correct for Free plan)');
      console.log('   - Returns proper error message');
      
      if (calendarAPITest.status === 402) {
        console.log('✅ Calendar API is working correctly');
        console.log('   - Returns 402 status (blocked access)');
        console.log('   - Backend is blocking calendar access');
        
        console.log('\n🎯 BACKEND IS WORKING PERFECTLY!');
        console.log('   - Feature Access API: ✅ Working');
        console.log('   - Calendar API: ✅ Working');
        console.log('   - Both APIs correctly block calendar access for Free plan');
        
        console.log('\n❌ ISSUE IS CLIENT-SIDE:');
        console.log('   - Browser cache showing old state');
        console.log('   - Client-side JavaScript not handling API response correctly');
        console.log('   - Calendar component not showing quota modal');
        console.log('   - Socket.IO not updating client in real-time');
        
        console.log('\n💡 CLIENT-SIDE FIXES:');
        console.log('   1. Clear browser cache: Ctrl+F5');
        console.log('   2. Open browser dev tools (F12)');
        console.log('   3. Check console for JavaScript errors');
        console.log('   4. Check network tab for API calls');
        console.log('   5. Verify calendar component is calling checkFeatureAccess()');
        console.log('   6. Check if showQuotaModal state is being set correctly');
        
      } else if (calendarAPITest.status === 200) {
        console.log('❌ Calendar API is NOT blocking access');
        console.log('   - Should return 402 for Free plan');
        console.log('   - Backend middleware issue');
      } else {
        console.log('❌ Calendar API has connection issues');
        console.log('   - Server might not be running');
        console.log('   - Network connectivity issues');
      }
      
    } else if (featureAccessTest.status === 200 && featureAccessTest.response?.canAccessCalendar === true) {
      console.log('⚠️ Feature Access API says calendar is allowed');
      console.log('   - This suggests SuperAdmin has paid plan');
      console.log('   - Calendar should be accessible');
      
      if (calendarAPITest.status === 200) {
        console.log('✅ Calendar API is allowing access');
        console.log('   - Backend is correctly allowing calendar access');
        
        console.log('\n🎯 BACKEND IS WORKING CORRECTLY!');
        console.log('   - SuperAdmin has paid plan');
        console.log('   - Calendar access is allowed');
        console.log('   - Client should show calendar (not free popup)');
        
        console.log('\n❌ ISSUE IS CLIENT-SIDE:');
        console.log('   - Browser cache showing old "free" state');
        console.log('   - Client-side JavaScript not updating UI');
        console.log('   - Calendar component showing free popup despite API allowing access');
        
        console.log('\n💡 CLIENT-SIDE FIXES:');
        console.log('   1. Clear browser cache: Ctrl+F5');
        console.log('   2. Open browser dev tools (F12)');
        console.log('   3. Check console for JavaScript errors');
        console.log('   4. Check network tab for API responses');
        console.log('   5. Verify calendar component logic');
      }
      
    } else {
      console.log('❌ Feature Access API has issues');
      console.log('   - Status: ' + featureAccessTest.status);
      console.log('   - Response: ' + JSON.stringify(featureAccessTest.response));
      console.log('   - Backend API endpoint not working');
    }
    
    console.log('\n📝 NEXT STEPS:');
    console.log('1. Test calendar access in browser with Aniket2');
    console.log('2. Check browser console for JavaScript errors');
    console.log('3. Check network tab for API calls to /api/subscriptions/check-feature-access');
    console.log('4. Check if QuotaLimitModal is showing');
    console.log('5. Verify calendar component rendering logic');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

testCalendarAPIEndpointWorking();
