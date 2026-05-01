const db = require('./config/database-switch');

console.log('=== GETTING TEST ACCOUNTS FOR ISOLATION ===');

// Get users from different universities
db.all(`
  SELECT u.id, u.name, u.email, u.role, u.university_id, uni.name as university_name
  FROM users u
  LEFT JOIN universities uni ON u.university_id = uni.id
  WHERE u.university_id IN (4, 5) AND u.role IN ('admin', 'superadmin')
  ORDER BY u.university_id, u.role
`, [], (err, users) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('Users from different universities:');
  users.forEach(user => {
    console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}, University: ${user.university_name || 'Unknown'} (ID: ${user.university_id})`);
  });
  
  // Group by university
  const usersByUni = {};
  users.forEach(user => {
    if (!usersByUni[user.university_id]) {
      usersByUni[user.university_id] = [];
    }
    usersByUni[user.university_id].push(user);
  });
  
  console.log('\n=== ISOLATION TEST ACCOUNTS ===');
  
  Object.keys(usersByUni).forEach(uniId => {
    const uniUsers = usersByUni[uniId];
    console.log(`\nUniversity ${uniId} (${uniUsers[0]?.university_name || 'Unknown'}):`);
    
    // Find admin or superadmin for this university
    const adminUser = uniUsers.find(u => u.role === 'admin' || u.role === 'superadmin');
    if (adminUser) {
      console.log(`  Primary Account:`);
      console.log(`    Email: ${adminUser.email}`);
      console.log(`    Password: password123`);
      console.log(`    Role: ${adminUser.role}`);
      console.log(`    University: ${adminUser.university_name || 'Unknown'}`);
    }
    
    // Find other users for testing
    const otherUsers = uniUsers.filter(u => u.id !== adminUser?.id);
    if (otherUsers.length > 0) {
      console.log(`  Additional Users:`);
      otherUsers.forEach(user => {
        console.log(`    Email: ${user.email} (Password: password123, Role: ${user.role})`);
      });
    }
  });
  
  console.log('\n=== ISOLATION TESTING INSTRUCTIONS ===');
  console.log('1. Login with University 4 account');
  console.log('2. Create stock requests, vendors, etc.');
  console.log('3. Logout and login with University 5 account');
  console.log('4. Verify you cannot see University 4 data');
  console.log('5. Test cross-university access attempts');
  
  process.exit(0);
});
