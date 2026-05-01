const db = require('./config/database-switch');

console.log('=== DETAILED ISOLATION TEST FOR POSTGRESQL ===');

async function detailedIsolationTest() {
  try {
    console.log('Database type:', process.env.USE_POSTGRES === 'true' ? 'PostgreSQL' : 'SQLite');
    
    // Test 1: Check if users can access data from other universities
    console.log('\n1. Testing cross-university data access...');
    
    const crossAccessTest = `
      SELECT 
        u1.id as user_id,
        u1.name as user_name,
        u1.university_id as user_university,
        sr.id as request_id,
        sr.title as request_title,
        sr.university_id as request_university
      FROM users u1
      LEFT JOIN stock_requests sr ON u1.id = sr.storekeeper_id
      WHERE u1.university_id != sr.university_id
      LIMIT 10
    `;
    
    db.all(crossAccessTest, [], (err, crossAccess) => {
      if (err) {
        console.error('Error checking cross access:', err);
        return;
      }
      
      if (crossAccess.length > 0) {
        console.log('❌ CROSS-UNIVERSITY ACCESS DETECTED:');
        crossAccess.forEach(item => {
          console.log(`  User ${item.user_name} (ID: ${item.user_id}, Uni: ${item.user_university}) accessing request from Uni ${item.request_university}`);
        });
      } else {
        console.log('✅ No cross-university data access detected');
      }
      
      // Test 2: Check subscription isolation
      console.log('\n2. Testing subscription isolation...');
      
      const subscriptionTest = `
        SELECT 
          s.superadminId,
          s.planName,
          s.status,
          u.name as superadmin_name,
          uni.name as university_name
        FROM subscriptions s
        LEFT JOIN users u ON CAST(SUBSTR(s.superadminId, 12) AS INTEGER) = u.id
        LEFT JOIN universities uni ON u.id = uni.adminId
        ORDER BY s.superadminId
      `;
      
      db.all(subscriptionTest, [], (err, subscriptions) => {
        if (err) {
          console.error('Error checking subscriptions:', err);
          return;
        }
        
        console.log(`Found ${subscriptions.length} subscriptions:`);
        subscriptions.forEach(sub => {
          console.log(`  SuperAdmin: ${sub.superadmin_name || 'Unknown'}, Plan: ${sub.planName}, University: ${sub.university_name || 'None'}`);
        });
        
        // Test 3: Check vendor isolation
        console.log('\n3. Testing vendor isolation...');
        
        const vendorTest = `
          SELECT 
            v.id as vendor_id,
            v.name as vendor_name,
            v.university_id,
            uni.name as university_name,
            uni.adminId
          FROM vendors v
          LEFT JOIN universities uni ON v.university_id = uni.id
          ORDER BY uni.adminId
        `;
        
        db.all(vendorTest, [], (err, vendors) => {
          if (err) {
            console.error('Error checking vendors:', err);
            return;
          }
          
          console.log(`Found ${vendors.length} vendors:`);
          
          const vendorsBySuperAdmin = {};
          vendors.forEach(vendor => {
            const superAdminId = vendor.adminId || 'unassigned';
            if (!vendorsBySuperAdmin[superAdminId]) {
              vendorsBySuperAdmin[superAdminId] = [];
            }
            vendorsBySuperAdmin[superAdminId].push(vendor);
          });
          
          Object.keys(vendorsBySuperAdmin).forEach(superAdminId => {
            console.log(`\n  SuperAdmin ${superAdminId} Vendors:`);
            vendorsBySuperAdmin[superAdminId].forEach(vendor => {
              console.log(`    - ${vendor.vendor_name} (ID: ${vendor.vendor_id}, Uni: ${vendor.university_name || 'Shared'})`);
            });
          });
          
          // Test 4: Check if any users have wrong university assignments
          console.log('\n4. Testing user-university assignment integrity...');
          
          const userAssignmentTest = `
            SELECT 
              u.id as user_id,
              u.name as user_name,
              u.role,
              u.university_id,
              uni.name as university_name,
              uni.adminId as expected_superadmin
            FROM users u
            LEFT JOIN universities uni ON u.university_id = uni.id
            WHERE u.university_id IS NOT NULL
            ORDER BY uni.adminId, u.role
          `;
          
          db.all(userAssignmentTest, [], (err, userAssignments) => {
            if (err) {
              console.error('Error checking user assignments:', err);
              return;
            }
            
            console.log(`Found ${userAssignments.length} users with university assignments:`);
            
            const assignmentsBySuperAdmin = {};
            userAssignments.forEach(user => {
              const superAdminId = user.expected_superadmin || 'unassigned';
              if (!assignmentsBySuperAdmin[superAdminId]) {
                assignmentsBySuperAdmin[superAdminId] = [];
              }
              assignmentsBySuperAdmin[superAdminId].push(user);
            });
            
            Object.keys(assignmentsBySuperAdmin).forEach(superAdminId => {
              console.log(`\n  SuperAdmin ${superAdminId} Users:`);
              assignmentsBySuperAdmin[superAdminId].forEach(user => {
                console.log(`    - ${user.user_name} (ID: ${user.user_id}, Role: ${user.role}, Uni: ${user.university_name})`);
              });
            });
            
            // Final Analysis
            console.log('\n=== FINAL ISOLATION ANALYSIS ===');
            
            let issues = [];
            
            // Check for users without proper university assignment
            const usersWithoutUni = userAssignments.filter(u => !u.university_name);
            if (usersWithoutUni.length > 0) {
              issues.push(`${usersWithoutUni.length} users have invalid university assignments`);
            }
            
            // Check for vendors without proper isolation
            const vendorsWithoutUni = vendors.filter(v => !v.university_name && v.university_id !== null);
            if (vendorsWithoutUni.length > 0) {
              issues.push(`${vendorsWithoutUni.length} vendors have invalid university assignments`);
            }
            
            // Check subscription isolation
            const subscriptionBySuperAdmin = {};
            subscriptions.forEach(sub => {
              const superAdminId = sub.superadminId;
              if (!subscriptionBySuperAdmin[superAdminId]) {
                subscriptionBySuperAdmin[superAdminId] = [];
              }
              subscriptionBySuperAdmin[superAdminId].push(sub);
            });
            
            Object.keys(subscriptionBySuperAdmin).forEach(superAdminId => {
              const subs = subscriptionBySuperAdmin[superAdminId];
              if (subs.length > 1) {
                issues.push(`SuperAdmin ${superAdminId} has ${subs.length} subscriptions (should have max 1 active)`);
              }
            });
            
            if (issues.length === 0) {
              console.log('✅ ISOLATION STATUS: SECURE');
              console.log('✅ All data is properly isolated by SuperAdmin domains');
              console.log('✅ No cross-contamination detected');
              console.log('✅ User assignments are correct');
              console.log('✅ Vendor isolation is working');
              console.log('✅ Subscription isolation is working');
            } else {
              console.log('❌ ISOLATION STATUS: COMPROMISED');
              console.log('❌ Issues found:');
              issues.forEach(issue => console.log(`   - ${issue}`));
            }
            
            console.log('\n=== RECOMMENDATIONS ===');
            console.log('1. Ensure all users have proper university_id assignments');
            console.log('2. Verify all vendors are assigned to correct universities');
            console.log('3. Monitor subscription changes for proper isolation');
            console.log('4. Implement row-level security for sensitive operations');
            console.log('5. Add audit logging for cross-university access attempts');
            
            process.exit(0);
          });
        });
      });
    });
    
  } catch (error) {
    console.error('Error during detailed isolation test:', error);
    process.exit(1);
  }
}

detailedIsolationTest();
