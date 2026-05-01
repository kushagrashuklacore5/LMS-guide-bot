const db = require('./config/sqlite-db');

async function testAnnouncementDB() {
  console.log('🧪 Testing announcement database connection...\n');
  
  try {
    // Test basic database connection
    console.log('🔍 Testing basic query...');
    
    const result = await new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as count FROM announcements", [], (err, row) => {
        if (err) {
          console.error('❌ Database error:', err);
          reject(err);
        } else {
          console.log('✅ Database connection working');
          resolve(row);
        }
      });
    });
    
    console.log(`📊 Total announcements: ${result.count}`);
    
    // Test the exact query from the controller
    console.log('\n🔍 Testing controller query...');
    
    const query = `
      SELECT a.*, u.name as createdByUserName
      FROM announcements a
      LEFT JOIN users u ON a.createdByUser = u.id
      WHERE a.university_id = ?
      ORDER BY a.createdAt DESC
    `;
    
    const announcements = await new Promise((resolve, reject) => {
      db.all(query, [1], (err, rows) => {
        if (err) {
          console.error('❌ Query error:', err);
          reject(err);
        } else {
          console.log('✅ Query working');
          console.log(`📊 Found ${rows.length} announcements`);
          resolve(rows);
        }
      });
    });
    
    console.log('\n📋 Announcements:');
    announcements.forEach((ann, index) => {
      console.log(`${index + 1}. ${ann.title} - ${ann.publishFor} - Created by: ${ann.createdByUserName}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAnnouncementDB();
