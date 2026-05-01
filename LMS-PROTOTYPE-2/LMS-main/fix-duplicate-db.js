const fs = require('fs');
const path = require('path');

// List of files with duplicate db declarations
const filesToFix = [
  'server/routes/translationRoutes.js',
  'server/routes/transaction-routes.js',
  'server/routes/superadminRoutes.js',
  'server/routes/storekeeperRoutes.js',
  'server/routes/requestTemplatesRoutes.js',
  'server/routes/plan-inheritance-routes.js',
  'server/routes/dataExportRoutes.js',
  'server/routes/databaseExportRoutes.js',
  'server/routes/accountantRoutes.js',
  'server/routes/accountantExportRoutes.js',
  'server/services/BilingualDbService.js',
  'server/models/Translation.js',
  'server/controllers/adminController.js',
  'server/controllers/assessmentController.js',
  'server/controllers/auth-controller.js',
  'server/controllers/calendarController.js',
  'server/controllers/attendanceController.js',
  'server/controllers/course-controller-backup.js',
  'server/controllers/classroomController.js',
  'server/controllers/course-controller.js',
  'server/controllers/expenses-controller.js',
  'server/controllers/materialController.js',
  'server/controllers/liveClassController.js',
  'server/controllers/orders-controller.js',
  'server/controllers/announcementController.js',
  'server/controllers/progress-controller.js',
  'server/controllers/requirement-controller.js'
];

console.log('🔧 Fixing duplicate db declarations...\n');

filesToFix.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove duplicate db declarations
      content = content.replace(/const db = require\(['"]\.\.\/config\/database-switch['"]\);\s*\n\/\/ Get tenant database connection\s*\nconst db = tenantConnectionManager\.getDb\(\);/g, '');
      
      // Write back the fixed content
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } catch (error) {
      console.log(`❌ Error fixing ${filePath}:`, error.message);
    }
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n🎯 Duplicate db declaration fix completed!');
console.log('All files have been processed. Please restart the server.');
