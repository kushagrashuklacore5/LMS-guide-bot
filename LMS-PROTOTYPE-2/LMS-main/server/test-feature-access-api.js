const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/lms-database.sqlite');

console.log('🧪 Testing Feature Access API Response\n');
console.log('=' .repeat(60));

// Simulate the checkFeatureAccess function logic for each user
async function simulateFeatureAccess(userId) {
  return new Promise((resolve, reject) => {
    // Get user's university and SuperAdmin
    db.get(`
      SELECT u.university_id, uni.adminId as superadmin_id
      FROM users u
      LEFT JOIN universities uni ON u.university_id = uni.id
      WHERE u.id = ?
    `, [userId], (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (!result || !result.superadmin_id) {
        resolve({
          success: true,
          currentPlan: 'free',
          canAccessCalendar: false,
          canExportData: false,
          message: 'Limited features on free tier'
        });
        return;
      }
      
      // Get SuperAdmin's subscription
      db.get(`
        SELECT planType, planName, status, expiryDate, isFreeTrial
        FROM subscriptions
        WHERE superadminId = ?
        ORDER BY createdAt DESC
        LIMIT 1
      `, [result.superadmin_id], (err, subscription) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (!subscription) {
          resolve({
            success: true,
            currentPlan: 'free',
            canAccessCalendar: false,
            canExportData: false,
            message: 'Limited features on free tier'
          });
          return;
        }
        
        // Check if subscription is expired
        const now = new Date();
        const expiryDate = new Date(subscription.expiryDate);
        const isExpired = now > expiryDate;
        
        const effectivePlan = isExpired ? 'free' : subscription.planType;
        const planName = isExpired ? 'Free' : subscription.planName;
        const status = isExpired ? 'expired' : subscription.status;
        
        const canAccessCalendar = effectivePlan === 'standard' || effectivePlan === 'professional';
        const canExportData = effectivePlan === 'standard' || effectivePlan === 'professional';
        
        resolve({
          success: true,
          currentPlan: effectivePlan,
          canAccessCalendar,
          canExportData,
          isExpired,
          expiryDate: subscription.expiryDate,
          message: effectivePlan === 'free' ? 'Limited features on free tier' : `Full features on ${effectivePlan} tier`
        });
      });
    });
  });
}

// Test for all users
db.all('SELECT id, name, role, university_id FROM users ORDER BY id', async (err, users) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('🔍 Testing Feature Access for All Users:\n');
  
  for (const user of users) {
    try {
      const accessResult = await simulateFeatureAccess(user.id);
      
      console.log(`👤 ${user.name} (${user.role}) - ID: ${user.id}`);
      console.log(`   📋 Current Plan: ${accessResult.currentPlan}`);
      console.log(`   📅 Calendar Access: ${accessResult.canAccessCalendar ? '✅ UNLOCKED' : '🔒 LOCKED'}`);
      console.log(`   💬 Message: ${accessResult.message}`);
      console.log(`   ⚠️ Expired: ${accessResult.isExpired ? 'YES' : 'NO'}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error testing user ${user.id}:`, error);
    }
  }
  
  db.close();
});
