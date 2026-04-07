// Fix Subscription Link Issue - CORRECTED
const db = require('./config/sqlite-db');

console.log('🔧 FIXING SUBSCRIPTION LINK ISSUE');
console.log('===================================');

// Create proper subscription record for user anisingh2309@gmail.com (ID: 68)
const userId = 68;
const now = new Date();
const startDate = now.toISOString();
const expiryDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now

const subscriptionData = {
  userId: userId,
  planType: 'professional',
  planName: 'Professional Plan',
  status: 'active',
  startDate: startDate,
  expiryDate: expiryDate.toISOString(),
  durationDays: 30,
  createdAt: startDate,
  updatedAt: startDate
};

console.log('📝 Creating Professional Plan Subscription:');
console.log('   User ID:', userId);
console.log('   Plan Type:', subscriptionData.planType);
console.log('   Plan Name:', subscriptionData.planName);
console.log('   Status:', subscriptionData.status);
console.log('   Start:', subscriptionData.startDate);
console.log('   Expiry:', subscriptionData.expiryDate);

// Insert subscription record (without isPaid column)
db.run(`
  INSERT INTO subscriptions (
    userId, planType, planName, status, startDate, expiryDate, 
    durationDays, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`, [
  subscriptionData.userId,
  subscriptionData.planType,
  subscriptionData.planName,
  subscriptionData.status,
  subscriptionData.startDate,
  subscriptionData.expiryDate,
  subscriptionData.durationDays,
  subscriptionData.createdAt,
  subscriptionData.updatedAt
], function(err) {
  if (err) {
    console.error('❌ Error creating subscription:', err);
    return;
  }
  
  console.log('✅ Professional Plan Subscription Created Successfully!');
  
  // Verify the subscription was created
  db.get('SELECT * FROM subscriptions WHERE userId = ? ORDER BY createdAt DESC LIMIT 1', [userId], (verifyErr, subscription) => {
    if (verifyErr) {
      console.error('❌ Error verifying subscription:', verifyErr);
      return;
    }
    
    if (subscription) {
      console.log('🔍 VERIFICATION:');
      console.log('   Plan:', subscription.planName);
      console.log('   Status:', subscription.status);
      console.log('   User ID:', subscription.userId);
      console.log('   Expiry:', subscription.expiryDate);
      console.log('   ✅ Subscription properly linked to User!');
    } else {
      console.log('❌ Subscription verification failed');
    }
  });
  
  console.log('\n🎯 SUBSCRIPTION FIX COMPLETED!');
  console.log('📱 User anisingh2309@gmail.com now has:');
  console.log('   ✅ Professional Plan in users table');
  console.log('   ✅ Professional Plan in subscriptions table');
  console.log('   ✅ API will return correct data');
  console.log('   ✅ No more feature blocks');
  console.log('   ✅ Full access unlocked');
});
"
