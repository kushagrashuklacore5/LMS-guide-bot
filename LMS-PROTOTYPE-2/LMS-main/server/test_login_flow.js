const db = require('./config/database-switch');
const bcrypt = require('bcryptjs');

console.log('🔐 Testing Login Flow');
console.log('=====================');

const testUser = {
  email: 'testuser@example.com',
  password: 'TestPassword123'
};

console.log(`👤 Testing login for: ${testUser.email}`);

// Test login flow
db.get('SELECT * FROM users WHERE email = ?', [testUser.email], async (err, user) => {
  if (err) {
    console.error('❌ Database error:', err.message);
    return;
  }
  
  if (!user) {
    console.error('❌ User not found');
    return;
  }
  
  console.log('✅ User found in database:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Name: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   University ID: ${user.university_id}`);
  console.log(`   Is Approved: ${user.is_approved}`);
  
  // Test password verification
  console.log('\n🔐 Testing password verification...');
  
  try {
    const passwordMatch = await bcrypt.compare(testUser.password, user.password);
    
    if (passwordMatch) {
      console.log('✅ Password verification successful!');
      console.log('🎉 Login flow test completed successfully!');
      console.log('📊 Users can now login with their permanent database credentials!');
      
      // Test wrong password
      console.log('\n🚫 Testing wrong password...');
      const wrongPasswordMatch = await bcrypt.compare('WrongPassword', user.password);
      
      if (!wrongPasswordMatch) {
        console.log('✅ Wrong password correctly rejected!');
        console.log('🔐 Security is working properly!');
      } else {
        console.log('❌ Wrong password was accepted - security issue!');
      }
      
    } else {
      console.log('❌ Password verification failed');
    }
  } catch (error) {
    console.error('❌ Error during password verification:', error.message);
  }
  
  process.exit(0);
});
