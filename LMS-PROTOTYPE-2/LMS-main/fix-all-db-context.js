const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing all database context issues...\n');

// Files that need to be updated to use tenant database context
const filesToFix = [
  'server/controllers/subscription-controller.js',
  'server/controllers/passwordResetController.js',
  'server/helpers/quotaHelper.js',
  'server/routes/requestTemplatesRoutes.js',
  'server/routes/superadminRoutes.js',
  'server/routes/transaction-routes.js',
  'server/routes/storekeeperRoutes.js',
  'server/routes/dataExportRoutes.js',
  'server/routes/accountantRoutes.js',
  'server/routes/accountantExportRoutes.js',
  'server/services/otpService.js'
];

let fixedCount = 0;

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      // Remove the old db import
      if (content.includes("const db = require('../config/database-switch');")) {
        content = content.replace(/const db = require\(['"]\.\.\/config\/database-switch['"]\);\s*\n/g, '');
        modified = true;
      }
      
      // Add helper function to get database from request or fallback to master
      if (!content.includes('function getDatabaseFromRequest')) {
        const helperFunction = `
// Helper function to get database from request context or fallback to master
function getDatabaseFromRequest(req) {
  return req.tenant?.database || require('../config/database-switch');
}

`;
        
        // Insert after imports but before any other code
        const lines = content.split('\n');
        let insertIndex = 0;
        
        // Find the end of imports/requires
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].trim().startsWith('const ') || lines[i].trim().startsWith('require(') || lines[i].trim() === '') {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
        
        lines.splice(insertIndex, 0, helperFunction);
        content = lines.join('\n');
        modified = true;
      }
      
      // Replace direct db calls with getDatabaseFromRequest(req) in route handlers
      content = content.replace(/\bdb\.(get|all|run|prepare)/g, 'getDatabaseFromRequest(req).$1');
      
      // Replace direct db calls in functions that have req parameter
      content = content.replace(/function\s+(\w+)\s*\([^)]*req[^)]*\)\s*{[\s\S]*?}/g, (match) => {
        return match.replace(/\bdb\.(get|all|run|prepare)/g, 'getDatabaseFromRequest(req).$1');
      });
      
      // Handle arrow functions with req parameter
      content = content.replace(/(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*req[^)]*\)\s*=>[\s\S]*?}/g, (match) => {
        return match.replace(/\bdb\.(get|all|run|prepare)/g, 'getDatabaseFromRequest(req).$1');
      });
      
      // Handle async functions with req parameter
      content = content.replace(/async\s+function\s+(\w+)\s*\([^)]*req[^)]*\)\s*{[\s\S]*?}/g, (match) => {
        return match.replace(/\bdb\.(get|all|run|prepare)/g, 'getDatabaseFromRequest(req).$1');
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        fixedCount++;
      }
      
    } catch (error) {
      console.log(`❌ Error fixing ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log(`\n🎯 Fixed ${fixedCount} files with database context issues!`);
console.log('All database calls now use tenant context or fallback to master database.');
