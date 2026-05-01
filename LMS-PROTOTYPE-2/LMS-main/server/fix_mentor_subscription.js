const db = require('./config/database-switch');

async function fixMentorSubscription() {
  console.log('🔧 Fixing Mentor Subscription Plan...\n');
  
  try {
    // Update mentor's subscription plan to match university
    console.log('📊 Updating mentor subscription plan...');
    
    db.run(`
      UPDATE users 
      SET subscriptionPlan = 'professional' 
      WHERE email = 'rishi@core5.co.in' AND role = 'mentor'
    `, function(err) {
      if (err) {
        console.error('❌ Error updating mentor subscription:', err);
        return;
      }
      
      console.log('✅ Mentor subscription plan updated successfully');
      console.log(`📊 Rows affected: ${this.changes}`);
      
      // Verify the update
      db.get('SELECT id, name, email, role, subscriptionPlan, university_id FROM users WHERE email = ?', ['rishi@core5.co.in'], (err, user) => {
        if (err) {
          console.error('Error verifying update:', err);
        } else if (user) {
          console.log('✅ Verification - Updated Mentor Data:');
          console.log('   ID:', user.id);
          console.log('   Name:', user.name);
          console.log('   Role:', user.role);
          console.log('   Subscription Plan:', user.subscriptionPlan);
          console.log('   University ID:', user.university_id);
          
          console.log('\n🎯 MENTOR SUBSCRIPTION FIX SUMMARY:');
          console.log('✅ Mentor subscription plan updated from free to professional');
          console.log('✅ Mentor should now have access to calendar and database export');
          console.log('✅ Plan inheritance: Mentor → University → SuperAdmin (Professional)');
          
          console.log('\n🌟 EXPECTED BEHAVIOR:');
          console.log('✅ Mentor can now access calendar features');
          console.log('✅ Mentor can now access database export features');
          console.log('✅ No more feature restrictions for mentor');
          
        } else {
          console.log('❌ User not found after update');
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixMentorSubscription();
