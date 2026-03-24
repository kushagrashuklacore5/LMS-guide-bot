const http = require('http');

console.log('🧪 Testing Calendar API Blocking...\n');

async function testCalendarBlocking() {
  try {
    // Test 1: Direct calendar API access (without auth)
    console.log('1️⃣ Testing calendar API without authentication...');
    const options = {
      hostname: 'localhost',
      port: 5002,
      path: '/api/calendar',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        
        if (res.statusCode === 401) {
          console.log('✅ Calendar API correctly requires authentication');
        } else if (res.statusCode === 402) {
          console.log('✅ Calendar API correctly blocks access');
        } else if (res.statusCode === 200) {
          console.log('❌ Calendar API is allowing access without blocking');
          console.log('This indicates a blocking issue');
        } else {
          console.log(`⚠️ Unexpected status code: ${res.statusCode}`);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Request error:', err.message);
    });
    
    req.end();

    // Wait for response
    await new Promise(resolve => {
      req.on('close', resolve);
    });

    // Test 2: Check if middleware is properly applied
    console.log('\n2️⃣ Checking calendar routes configuration...');
    
    // Read calendar routes file
    const fs = require('fs');
    const calendarRoutesPath = './server/routes/calendarRoutes.js';
    
    try {
      const calendarRoutes = fs.readFileSync(calendarRoutesPath, 'utf8');
      console.log('Calendar routes content:');
      console.log(calendarRoutes);
      
      // Check if all routes have checkCalendarAccess middleware
      const hasGetMiddleware = calendarRoutes.includes('checkCalendarAccess') && calendarRoutes.includes('router.get');
      const hasPostMiddleware = calendarRoutes.includes('checkCalendarAccess') && calendarRoutes.includes('router.post');
      const hasPutMiddleware = calendarRoutes.includes('checkCalendarAccess') && calendarRoutes.includes('router.put');
      const hasDeleteMiddleware = calendarRoutes.includes('checkCalendarAccess') && calendarRoutes.includes('router.delete');
      
      console.log(`   GET routes protected: ${hasGetMiddleware}`);
      console.log(`   POST routes protected: ${hasPostMiddleware}`);
      console.log(`   PUT routes protected: ${hasPutMiddleware}`);
      console.log(`   DELETE routes protected: ${hasDeleteMiddleware}`);
      
      if (!hasGetMiddleware || !hasPostMiddleware || !hasPutMiddleware || !hasDeleteMiddleware) {
        console.log('❌ Some calendar routes are missing checkCalendarAccess middleware');
      } else {
        console.log('✅ All calendar routes have checkCalendarAccess middleware');
      }
      
    } catch (error) {
      console.log('❌ Error reading calendar routes:', error.message);
    }

    // Test 3: Check quota middleware implementation
    console.log('\n3️⃣ Testing quota middleware implementation...');
    
    try {
      const quotaMiddleware = require('./server/middleware/quotaMiddleware');
      
      // Mock request for testing
      const mockReq = {
        user: { userId: 22 } // User Aniket2
      };
      
      let blocked = false;
      let allowed = false;
      
      const mockRes = {
        status: (code) => {
          console.log(`   Middleware responded with status: ${code}`);
          if (code === 402) {
            blocked = true;
            console.log('   ✅ Access correctly blocked');
          } else if (code === 200) {
            allowed = true;
            console.log('   ❌ Access incorrectly allowed');
          }
        },
        json: (data) => {
          console.log(`   Response data: ${JSON.stringify(data)}`);
        }
      };
      
      // Test the middleware
      await new Promise((resolve) => {
        quotaMiddleware.checkCalendarAccess(mockReq, mockRes, () => {
          allowed = true;
          resolve();
        });
      });
      
      if (allowed && !blocked) {
        console.log('❌ QUOTA MIDDLEWARE IS NOT BLOCKING ACCESS');
        console.log('   This is the root cause of the issue');
      } else if (blocked) {
        console.log('✅ QUOTA MIDDLEWARE IS CORRECTLY BLOCKING ACCESS');
      }
      
    } catch (error) {
      console.log('❌ Error testing quota middleware:', error.message);
    }

    console.log('\n🎯 DIAGNOSIS:');
    console.log('If calendar API is allowing access without blocking, the issue is:');
    console.log('1. Missing checkCalendarAccess middleware on routes');
    console.log('2. Quota middleware not properly blocking access');
    console.log('3. Server needs restart to load updated middleware');
    console.log('4. Client-side caching issues');
    
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('1. Restart server to load updated middleware');
    console.log('2. Clear browser cache and hard refresh');
    console.log('3. Check calendar routes configuration');
    console.log('4. Verify quota middleware implementation');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
  
  setTimeout(() => process.exit(0), 3000);
}

testCalendarBlocking();
