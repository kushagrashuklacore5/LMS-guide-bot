const db = require('./config/database-switch');

async function fixUserSubscription() {
  console.log('🔧 Fixing user subscription plan...\n');
  
  try {
    // Get user and university info
    const user = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.id, u.name, u.email, u.role, u.subscriptionPlan, u.university_id
        FROM users u 
        WHERE u.email = ?
      `, ['abhishek@core5.co.in'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('👤 Current user subscription:', user.subscriptionPlan);
    
    const university = await new Promise((resolve, reject) => {
      db.get(`
        SELECT u.id, u.name, u.subscriptionPlan, u.adminId
        FROM universities u 
        WHERE u.id = ?
      `, [user.university_id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!university) {
      console.log('❌ University not found');
      return;
    }
    
    console.log('🏫 University subscription:', university.subscriptionPlan);
    
    // Get subscription from subscriptions table
    const subscription = await new Promise((resolve, reject) => {
      db.get(`
        SELECT s.planType, s.planName, s.status
        FROM subscriptions s 
        WHERE s.superadminId = ?
      `, ['superadmin-1'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!subscription) {
      console.log('❌ Subscription not found');
      return;
    }
    
    console.log('💳 Subscription from table:', subscription.planType);
    
    // Update user's subscription plan to match university/subscription
    console.log('\n🔧 Updating user subscription plan...');
    
    const updateResult = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE users 
        SET subscriptionPlan = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [subscription.planType, user.id], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
    
    console.log('✅ User subscription updated:', updateResult.changes, 'rows affected');
    
    // Verify the update
    const updatedUser = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, name, email, subscriptionPlan
        FROM users 
        WHERE id = ?
      `, [user.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    console.log('✅ Updated user subscription:', updatedUser.subscriptionPlan);
    
    // Now test feature access
    console.log('\n🔍 Testing feature access...');
    
    try {
      const axios = require('axios');
      
      // Login first
      const loginRes = await axios.post('http://127.0.0.1:5002/api/auth/login', {
        email: 'abhishek@core5.co.in',
        password: 'O#P$0A@7THQW'
      });
      
      const token = loginRes.data.token;
      
      // Test feature access
      const featureAccessRes = await axios.get('http://127.0.0.1:5002/api/subscription/check-feature-access', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Feature access endpoint working!');
      console.log('📊 Response:', featureAccessRes.data);
      
    } catch (error) {
      console.log('❌ Feature access test failed:', error.response?.status, error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixUserSubscription();
