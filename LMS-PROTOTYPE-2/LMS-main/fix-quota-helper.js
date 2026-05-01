const fs = require('fs');

console.log('🔧 Fixing quotaHelper database calls...\n');

const filePath = './server/helpers/quotaHelper.js';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix all functions to accept req parameter
  content = content.replace(
    /const countUsersByRoleInUniversity = \(universityId, role\) => {/g,
    'const countUsersByRoleInUniversity = (universityId, role, req) => {'
  );
  
  content = content.replace(
    /const countTotalUsersInUniversity = \(universityId\) => {/g,
    'const countTotalUsersInUniversity = (universityId, req) => {'
  );
  
  content = content.replace(
    /const countUniversitiesForSuperadmin = \(\) => {/g,
    'const countUniversitiesForSuperadmin = (req) => {'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed quotaHelper function signatures');
  
} catch (error) {
  console.error('❌ Error fixing quotaHelper:', error.message);
}

console.log('\n🎯 QuotaHelper fix completed!');
