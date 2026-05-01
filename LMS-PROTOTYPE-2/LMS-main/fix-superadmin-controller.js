const fs = require('fs');

console.log('🔧 Fixing superAdminController database calls...\n');

const filePath = './server/controllers/superAdminController.js';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace all db.get calls
  content = content.replace(/\bdb\.get\(/g, 'getDatabaseFromRequest(req).get(');
  
  // Replace all db.run calls
  content = content.replace(/\bdb\.run\(/g, 'getDatabaseFromRequest(req).run(');
  
  // Replace all db.all calls
  content = content.replace(/\bdb\.all\(/g, 'getDatabaseFromRequest(req).all(');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed superAdminController database calls');
  
} catch (error) {
  console.error('❌ Error fixing superAdminController:', error.message);
}

console.log('\n🎯 SuperAdminController database context fix completed!');
