const db = require('config/database-switch');

console.log('🔍 Testing database query directly...');

const query = `
  SELECT id, email, role, created_at, expires_at, status
  FROM users 
  WHERE role = 'superadmin' 
  ORDER BY created_at DESC
`;

console.log('📝 Query:', query);

db.all(query, [], (err, rows) => {
  if (err) {
    console.error('❌ Database error:', err);
    return;
  }

  console.log(`📊 Found ${rows.length} superadmins:`);
  
  rows.forEach((row, index) => {
    console.log(`\n👤 Superadmin ${index + 1}:`);
    console.log(`   ID: ${row.id}`);
    console.log(`   Email: ${row.email}`);
    console.log(`   Role: ${row.role}`);
    console.log(`   Created: ${row.created_at}`);
    console.log(`   Expires: ${row.expires_at}`);
    console.log(`   Status: ${row.status || 'undefined'}`);
  });
  
  // Simulate the API response
  const superadmins = rows.map(row => ({
    ...row,
    plainPassword: "••••••••"
  }));
  
  console.log('\n📤 Simulated API Response:');
  console.log(JSON.stringify({ success: true, data: superadmins }, null, 2));
  
  process.exit(0);
});
