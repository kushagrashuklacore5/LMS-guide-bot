const db = require('./config/database-switch');

console.log('🧪 Testing User Creation Flow');
console.log('==============================');

// Test creating a university first
const universityData = {
  name: 'Test University',
  area: 'Test Area'
};

console.log('🏛️ Creating university...');
db.run(`
  INSERT INTO universities (name, area, createdAt, updatedAt)
  VALUES (?, ?, datetime('now'), datetime('now'))
`, [universityData.name, universityData.area], function(err) {
  if (err) {
    console.error('❌ Error creating university:', err.message);
    return;
  }
  
  const universityId = this.lastID;
  console.log(`✅ University created with ID: ${universityId}`);
  
  // Test creating a user
  const userData = {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'TestPassword123',
    role: 'admin',
    university_id: universityId
  };
  
  console.log('👤 Creating user...');
  
  // Hash password
  const bcrypt = require('bcryptjs');
  
  bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
    if (err) {
      console.error('❌ Error hashing password:', err.message);
      return;
    }
    
    db.run(`
      INSERT INTO users (name, email, password, role, university_id, is_approved, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `, [userData.name, userData.email, hashedPassword, userData.role, userData.university_id], function(err) {
      if (err) {
        console.error('❌ Error creating user:', err.message);
        return;
      }
      
      const userId = this.lastID;
      console.log(`✅ User created with ID: ${userId}`);
      
      // Test retrieving the user
      console.log('🔍 Retrieving user...');
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
          console.error('❌ Error retrieving user:', err.message);
          return;
        }
        
        if (user) {
          console.log('✅ User retrieved successfully:');
          console.log(`   ID: ${user.id}`);
          console.log(`   Name: ${user.name}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   University ID: ${user.university_id}`);
          console.log(`   Is Approved: ${user.is_approved}`);
          console.log(`   Created At: ${user.created_at}`);
          
          console.log('\n🎉 User creation flow test completed successfully!');
          console.log('📊 Users are now permanently saved in the database!');
        } else {
          console.error('❌ User not found after creation');
        }
        
        process.exit(0);
      });
    });
  });
});
