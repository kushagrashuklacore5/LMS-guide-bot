const db = require('./config/database-switch');

console.log('🔍 Testing PostgreSQL database connection...');

// Test basic connection
db.get('SELECT NOW() as current_time', [], (err, result) => {
  if (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    return;
  }
  
  console.log('✅ PostgreSQL connected successfully!');
  console.log('📅 Current time:', result.current_time);
  
  // Test users table
  console.log('\n👥 Testing users table...');
  db.all('SELECT COUNT(*) as count FROM users', [], (err, result) => {
    if (err) {
      console.error('❌ Error accessing users table:', err.message);
      return;
    }
    
    console.log(`📊 Total users in database: ${result[0].count}`);
    
    // Test universities table
    console.log('\n🏛️ Testing universities table...');
    db.all('SELECT COUNT(*) as count FROM universities', [], (err, result) => {
      if (err) {
        console.error('❌ Error accessing universities table:', err.message);
        return;
      }
      
      console.log(`📊 Total universities in database: ${result[0].count}`);
      console.log('\n✅ All database tests completed successfully!');
      process.exit(0);
    });
  });
});
