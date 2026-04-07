const db = require('./config/sqlite-db');

async function fixAndTestDemoAccounts() {
  console.log('=== FIXING AND TESTING DEMO ACCOUNTS ===');
  
  try {
    // 1. Move demo accounts to University 4 (Core5)
    console.log('\n1. MOVING DEMO ACCOUNTS TO UNIVERSITY 4:');
    
    const updateResult = await new Promise((resolve, reject) => {
      db.run('UPDATE users SET university_id = 4 WHERE email LIKE "%@demo.com"', function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    console.log(`✅ Moved ${updateResult.changes} demo accounts to University 4`);
    
    // 2. Verify the move
    console.log('\n2. VERIFYING DEMO ACCOUNTS IN UNIVERSITY 4:');
    const demoUsers = await new Promise((resolve, reject) => {
      db.all(`
        SELECT id, name, email, role, university_id 
        FROM users 
        WHERE email LIKE '%@demo.com' AND university_id = 4
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
    
    console.log(`Found ${demoUsers.length} demo accounts in University 4:`);
    demoUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.role}) - ${user.email}`);
    });
    
    // 3. Check University 4's subscription
    console.log('\n3. UNIVERSITY 4 SUBSCRIPTION STATUS:');
    const uniSubscription = await new Promise((resolve, reject) => {
      db.get(`
        SELECT s.planType, s.planName, s.status, s.expiryDate
        FROM subscriptions s
        WHERE s.superadminId = 'superadmin-4' OR s.superadminId = '4'
        ORDER BY s.createdAt DESC
        LIMIT 1
      `, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (uniSubscription) {
      const now = new Date();
      const expiry = new Date(uniSubscription.expiryDate);
      const isExpired = expiry < now;
      
      console.log(`University 4 Subscription: ${uniSubscription.planName} (${uniSubscription.planType})`);
      console.log(`Status: ${isExpired ? '❌ EXPIRED' : '✅ ACTIVE'}`);
      console.log(`Expires: ${uniSubscription.expiryDate}`);
    } else {
      console.log(`University 4 Subscription: ❌ None found`);
    }
    
    // 4. Test feature inheritance for demo accounts
    console.log('\n\n4. FEATURE LOCK/UNLOCK TEST FOR DEMO ACCOUNTS:');
    const planInheritance = require('./controllers/plan-inheritance-controller');
    
    for (const user of demoUsers) {
      console.log(`\n--- ${user.name} (${user.role}) ---`);
      
      try {
        const effectivePlan = await planInheritance.getEffectiveUserPlan(user.id);
        
        console.log(`📋 Inherited Plan: ${effectivePlan.planName} (${effectivePlan.planType})`);
        console.log(`🔒 Feature Status:`);
        
        // Test each feature
        const features = [
          { name: 'Calendar', key: 'canAccessCalendar', required: 'Standard+' },
          { name: 'Data Export', key: 'canExportData', required: 'Professional' },
          { name: 'Live Classes', key: 'features.liveClass', required: 'Professional' },
          { name: 'Assessments', key: 'features.assessments', required: 'Professional' }
        ];
        
        features.forEach(feature => {
          const value = feature.key.includes('.') ? 
            effectivePlan.features[feature.key.split('.')[1]] : 
            effectivePlan[feature.key];
          
          console.log(`  ${feature.name.padEnd(12)}: ${value ? '✅ UNLOCKED' : '🔒 LOCKED'} ${!value ? `(${feature.required})` : ''}`);
        });
        
        // Test limits
        console.log(`📊 Resource Limits:`);
        console.log(`  Announcements: ${effectivePlan.features.announcements.max} max`);
        console.log(`  Classrooms: ${effectivePlan.features.classrooms.max} max`);
        console.log(`  Students: ${effectivePlan.features.students.max} max`);
        console.log(`  Mentors: ${effectivePlan.features.mentors.max} max`);
        
        // Real-world simulation
        console.log(`\n🧪 Real-World Test Results:`);
        console.log(`  • Open Calendar: ${effectivePlan.canAccessCalendar ? '✅ SUCCESS' : '❌ BLOCKED'}`);
        console.log(`  • Export Database: ${effectivePlan.canExportData ? '✅ SUCCESS' : '❌ BLOCKED'}`);
        console.log(`  • Create Live Class: ${effectivePlan.features.liveClass ? '✅ SUCCESS' : '❌ BLOCKED'}`);
        console.log(`  • Create Assessment: ${effectivePlan.features.assessments ? '✅ SUCCESS' : '❌ BLOCKED'}`);
        console.log(`  • Create Announcement: ${effectivePlan.features.announcements.max > 0 ? '✅ SUCCESS' : '❌ BLOCKED'}`);
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n=== DEMO ACCOUNTS FEATURE LOCK/UNLOCK TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    process.exit(0);
  }
}

fixAndTestDemoAccounts();
