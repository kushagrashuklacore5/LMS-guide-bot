const db = require('config/database-switch');

async function testSubscriptionSystem() {
  console.log('=== TESTING SUBSCRIPTION SYSTEM ===');
  
  try {
    // 1. Test current subscription data
    console.log('\n1. CURRENT SUBSCRIPTION STATUS:');
    const subscriptions = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM subscriptions WHERE status = "active" ORDER BY createdAt DESC', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    subscriptions.forEach(sub => {
      const now = new Date();
      const expiry = new Date(sub.expiryDate);
      const isExpired = expiry < now;
      const remainingTime = Math.max(0, Math.floor((expiry - now) / 1000));
      
      console.log(`\nSuperAdmin: ${sub.superadminId}`);
      console.log(`Plan: ${sub.planName} (${sub.planType})`);
      console.log(`Status: ${sub.status}`);
      console.log(`Expires: ${expiry.toISOString()}`);
      console.log(`Current Time: ${now.toISOString()}`);
      console.log(`Is Expired: ${isExpired}`);
      console.log(`Remaining Seconds: ${remainingTime}`);
    });
    
    // 2. Test user plan inheritance
    console.log('\n\n2. TESTING PLAN INHERITANCE:');
    const planInheritance = require('./controllers/plan-inheritance-controller');
    
    // Test for different user types
    const testUsers = [
      { id: 1, name: 'Superadmin' },
      { id: 2, name: 'Admin' },
      { id: 3, name: 'Mentor' },
      { id: 4, name: 'Student' }
    ];
    
    for (const user of testUsers) {
      try {
        const plan = await planInheritance.getEffectiveUserPlan(user.id);
        console.log(`\nUser ${user.name} (ID: ${user.id}):`);
        console.log(`  Effective Plan: ${plan.planName} (${plan.planType})`);
        console.log(`  Can Access Calendar: ${plan.canAccessCalendar}`);
        console.log(`  Can Export Data: ${plan.canExportData}`);
        console.log(`  Is Expired: ${plan.isExpired}`);
        console.log(`  Features: ${JSON.stringify(plan.features, null, 2)}`);
      } catch (error) {
        console.log(`  Error for user ${user.name}: ${error.message}`);
      }
    }
    
    // 3. Test expired subscription handling
    console.log('\n\n3. TESTING EXPIRED SUBSCRIPTION HANDLING:');
    const expiredResult = await planInheritance.checkExpiredSubscriptions();
    console.log('Expired subscription check result:', expiredResult);
    
    // 4. Test feature access endpoint simulation
    console.log('\n\n4. TESTING FEATURE ACCESS LOGIC:');
    const testPlans = ['free', 'standard', 'professional'];
    
    for (const planType of testPlans) {
      const features = getPlanFeatures(planType);
      console.log(`\n${planType.toUpperCase()} Plan Features:`);
      console.log(`  Calendar Access: ${features.calendar}`);
      console.log(`  Data Export: ${features.exportData}`);
      console.log(`  Max Classrooms: ${features.classrooms.max}`);
      console.log(`  Max Students: ${features.students.max}`);
      console.log(`  Max Announcements: ${features.announcements.max}`);
      console.log(`  Live Classes: ${features.liveClass}`);
      console.log(`  Assessments: ${features.assessments}`);
    }
    
    console.log('\n=== SUBSCRIPTION SYSTEM TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    process.exit(0);
  }
}

// Copy the getPlanFeatures function here for testing
function getPlanFeatures(planType) {
  const features = {
    free: {
      calendar: false,
      exportData: false,
      classrooms: { max: 2 },
      students: { max: 10 },
      teachers: { max: 5 },
      mentors: { max: 5 },
      announcements: { max: 2 },
      schools: { max: 1 },
      courses: { max: 2 },
      liveClass: false,
      assessments: false,
      weeksPerCourse: 2,
      materialsPerCourse: 2,
      mentorCoursesPerClass: 2
    },
    standard: {
      calendar: true,
      exportData: false,
      classrooms: { max: 10 },
      students: { max: 200 },
      teachers: { max: 5 },
      mentors: { max: 10 },
      announcements: { max: 20 },
      schools: { max: 2 },
      courses: { max: 8 },
      liveClass: false,
      assessments: false,
      weeksPerCourse: Infinity,
      materialsPerCourse: Infinity,
      mentorCoursesPerClass: 2
    },
    professional: {
      calendar: true,
      exportData: true,
      classrooms: { max: Infinity },
      students: { max: Infinity },
      teachers: { max: Infinity },
      mentors: { max: Infinity },
      announcements: { max: Infinity },
      schools: { max: Infinity },
      courses: { max: Infinity },
      liveClass: true,
      assessments: true,
      weeksPerCourse: Infinity,
      materialsPerCourse: Infinity,
      mentorCoursesPerClass: Infinity
    }
  };
  
  return features[planType] || features.free;
}

testSubscriptionSystem();
