const http = require('http');

console.log('🔍 Debugging Real Calendar Issue...\n');

async function debugRealCalendarIssue() {
  try {
    // Step 1: Test the exact API call the calendar component makes
    console.log('1️⃣ Testing exact API call from calendar component:');
    
    const apiTest = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5002,
        path: '/api/subscriptions/check-feature-access',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token-for-aniket2',
          'Content-Type': 'application/json'
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Headers:`, res.headers);
          
          try {
            const response = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
            resolve({ status: res.statusCode, response, headers: res.headers });
          } catch (parseError) {
            console.log(`   Raw Response: ${data}`);
            console.log(`   Parse Error: ${parseError.message}`);
            resolve({ status: res.statusCode, response: null, error: parseError.message, raw: data });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Request Error: ${err.message}`);
        resolve({ status: 0, response: null, error: err.message });
      });
      
      req.setTimeout(10000, () => {
        console.log('   Request Timeout');
        req.destroy();
        resolve({ status: 0, response: null, error: 'timeout' });
      });
      
      req.end();
    });
    
    // Step 2: Test calendar API endpoint
    console.log('\n2️⃣ Testing calendar API endpoint:');
    
    const calendarTest = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 5002,
        path: '/api/calendar',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token-for-aniket2',
          'Content-Type': 'application/json'
        }
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Headers:`, res.headers);
          
          try {
            const response = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(response, null, 2)}`);
            resolve({ status: res.statusCode, response, headers: res.headers });
          } catch (parseError) {
            console.log(`   Raw Response: ${data}`);
            console.log(`   Parse Error: ${parseError.message}`);
            resolve({ status: res.statusCode, response: null, error: parseError.message, raw: data });
          }
        });
      });
      
      req.on('error', (err) => {
        console.log(`   Request Error: ${err.message}`);
        resolve({ status: 0, response: null, error: err.message });
      });
      
      req.setTimeout(10000, () => {
        console.log('   Request Timeout');
        req.destroy();
        resolve({ status: 0, response: null, error: 'timeout' });
      });
      
      req.end();
    });
    
    // Step 3: Analysis
    console.log('\n🎯 ANALYSIS:');
    
    console.log('\n📊 Feature Access API:');
    console.log(`   Status: ${apiTest.status}`);
    if (apiTest.response) {
      console.log(`   Success: ${apiTest.response.success}`);
      console.log(`   Current Plan: ${apiTest.response.currentPlan}`);
      console.log(`   Can Access Calendar: ${apiTest.response.canAccessCalendar}`);
      console.log(`   Message: ${apiTest.response.message}`);
    } else {
      console.log(`   Error: ${apiTest.error}`);
      console.log(`   Raw: ${apiTest.raw}`);
    }
    
    console.log('\n📊 Calendar API:');
    console.log(`   Status: ${calendarTest.status}`);
    if (calendarTest.response) {
      console.log(`   Events Count: ${calendarTest.response.length || 0}`);
      console.log(`   Success: ${calendarTest.response.success !== false}`);
    } else {
      console.log(`   Error: ${calendarTest.error}`);
      console.log(`   Raw: ${calendarTest.raw}`);
    }
    
    // Step 4: Diagnosis
    console.log('\n🔍 DIAGNOSIS:');
    
    if (apiTest.status === 200 && apiTest.response?.canAccessCalendar === false) {
      console.log('✅ Feature Access API is working correctly');
      console.log('   - Returns canAccessCalendar: false (correct for Free plan)');
      console.log('   - Returns proper error message');
      
      if (calendarTest.status === 402) {
        console.log('✅ Calendar API is working correctly');
        console.log('   - Returns 402 status (blocked access)');
        console.log('   - Backend is blocking calendar access');
        
        console.log('\n🎯 BACKEND IS WORKING PERFECTLY!');
        console.log('   - Feature Access API: ✅ Working');
        console.log('   - Calendar API: ✅ Working');
        console.log('   - Both APIs correctly block calendar access for Free plan');
        
        console.log('\n❌ ISSUE IS 100% CLIENT-SIDE!');
        console.log('   - Browser cache showing old state');
        console.log('   - Client-side JavaScript not handling API response');
        console.log('   - Calendar component not showing quota modal');
        console.log('   - Socket.IO not updating client');
        
        console.log('\n🔧 CLIENT-SIDE SOLUTIONS:');
        console.log('   1. Force refresh: Ctrl+Shift+R');
        console.log('   2. Clear all browser data');
        console.log('   3. Try different browser');
        console.log('   4. Open incognito mode');
        console.log('   5. Check browser console for errors');
        console.log('   6. Check if calendar component is mounting');
        
      } else if (calendarTest.status === 200) {
        console.log('❌ Calendar API is NOT blocking access');
        console.log('   - Should return 402 for Free plan');
        console.log('   - Backend middleware issue');
        console.log('   - Need to fix backend middleware');
        
      } else {
        console.log('❌ Calendar API has connection issues');
        console.log('   - Server might not be running');
        console.log('   - Network connectivity issues');
      }
      
    } else if (apiTest.status === 200 && apiTest.response?.canAccessCalendar === true) {
      console.log('⚠️ Feature Access API says calendar is allowed');
      console.log('   - SuperAdmin might have paid plan');
      console.log('   - Calendar should be accessible');
      
      if (calendarTest.status === 200) {
        console.log('✅ Calendar API is allowing access');
        console.log('   - Backend is correctly allowing calendar access');
        
        console.log('\n🎯 BACKEND IS WORKING CORRECTLY!');
        console.log('   - SuperAdmin has paid plan');
        console.log('   - Calendar access is allowed');
        console.log('   - Client should show calendar (not free popup)');
        
        console.log('\n❌ ISSUE IS 100% CLIENT-SIDE!');
        console.log('   - Browser cache showing old "free" state');
        console.log('   - Client-side JavaScript not updating UI');
        console.log('   - Calendar component showing free popup despite API allowing access');
        
        console.log('\n🔧 CLIENT-SIDE SOLUTIONS:');
        console.log('   1. Force refresh: Ctrl+Shift+R');
        console.log('   2. Clear all browser data');
        console.log('   3. Try different browser');
        console.log('   4. Open incognito mode');
        console.log('   5. Check browser console for errors');
        
      } else {
        console.log('❌ Feature Access API has issues');
        console.log('   - Status: ' + apiTest.status);
        console.log('   - Response: ' + JSON.stringify(apiTest.response));
        console.log('   - Backend API endpoint not working');
      }
    } else {
      console.log('❌ Feature Access API has connection issues');
      console.log('   - Status: ' + apiTest.status);
      console.log('   - Error: ' + apiTest.error);
      console.log('   - Server might not be running');
      console.log('   - Need to check server status');
    }
    
    console.log('\n📝 FINAL VERDICT:');
    console.log('1. If both APIs are working: Issue is client-side cache');
    console.log('2. If APIs are failing: Issue is server-side');
    console.log('3. If APIs are inconsistent: Issue is in backend logic');
    
    console.log('\n🚀 IMMEDIATE ACTIONS:');
    console.log('1. Check if server is running on port 5002');
    console.log('2. Test API endpoints directly in browser');
    console.log('3. Check browser console for JavaScript errors');
    console.log('4. Clear browser cache completely');
    console.log('5. Try incognito mode');

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
  
  setTimeout(() => process.exit(0), 2000);
}

debugRealCalendarIssue();
