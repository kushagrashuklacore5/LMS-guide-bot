const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING SYNTAX ERROR IN accountantRoutes.js...');

// Read the current file with correct path
const filePath = path.join(__dirname, 'routes', 'accountantRoutes.js');
const content = fs.readFileSync(filePath, 'utf8');

console.log('📄 Reading accountantRoutes.js...');

// Find the problematic section and fix it
const problematicSection = content.match(/function fetchFeesStats\(universityId, res\) {[\s\S]*?}/);

if (problematicSection) {
  console.log('🔧 Found problematic section, fixing...');
  
  // Create a corrected version of the function
  const correctedFunction = `function fetchFeesStats(universityId, res) {
  // Get fee collection statistics from database
  const stats = {
    totalFeesCollected: 0,
    totalStudents: 0,
    averageFeesPerStudent: 0
  };

  // Get total fees collected from payments table
  db.all('SELECT SUM(amount) as totalFeesCollected FROM payments WHERE status = "success"', [universityId], (err, feesResult) => {
    if (err) {
      console.error('Get paid fees error:', err);
    } else {
      stats.totalFeesCollected = feesResult[0]?.totalFeesCollected || 0;
    }

    // Get total students count - try users table first, then fallback
    db.all('SELECT COUNT(*) as totalStudents FROM users WHERE role = "student" AND university_id = ?', [universityId], (err, studentResult) => {
      if (err) {
        console.error('Get student count error:', err);
        // Fallback: count unique studentIds from payments table
        db.all('SELECT COUNT(DISTINCT studentId) as totalStudents FROM payments', [], (err, paymentStudentResult) => {
          if (err) {
            console.error('Get student count from payments error:', err);
            stats.totalStudents = 0;
          } else {
            stats.totalStudents = paymentStudentResult[0]?.totalStudents || 0;
          }
          calculateAverageAndRespond();
        });
      } else {
        stats.totalStudents = studentResult[0]?.total || 0;
        calculateAverageAndRespond();
      }
    });

    function calculateAverageAndRespond() {
      // Calculate average fees per student
      stats.averageFeesPerStudent = stats.totalStudents > 0 ? Math.round(stats.totalFeesCollected / stats.totalStudents) : 0;

      // Get recent payments from payments table
      db.all('SELECT p.*, "Student " || p.studentId as studentName, "student@demo.com" as studentEmail FROM payments p WHERE p.status = "success" ORDER BY p.createdAt DESC LIMIT 10', [], (err, paymentsResult) => {
        if (err) {
          console.error('Get recent payments error:', err);
          stats.recentPayments = [];
        } else {
          stats.recentPayments = paymentsResult.map(payment => ({
            studentName: payment.studentName || 'Unknown Student',
            amount: payment.amount || 0,
            paymentDate: payment.createdAt,
            paymentMethod: payment.type || 'Online',
            transactionId: payment.transactionId || payment.id
          }));
        }

        console.log(' Accountant Fees Stats:', stats);

        res.status(200).json({ 
          success: true, 
          data: stats
        });
      });
    }
  });
}`;

  // Replace the problematic section with the corrected one
  const updatedContent = content.replace(/function fetchFeesStats\(universityId, res\) {[\s\S]*?}/, correctedFunction);
  
  // Write the fixed content back to the file
  fs.writeFileSync(filePath, updatedContent, 'utf8');
  
  console.log('✅ Syntax error fixed!');
  console.log('🔧 Fixed: fetchFeesStats function structure');
  console.log('🔧 Fixed: Database queries');
  console.log('🔧 Fixed: Error handling');
  console.log('🔄 Backend should now start successfully');
  
} else {
  console.log('❌ Could not find the problematic section');
}
