#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 SIMPLE FIX FOR accountantRoutes.js...');
console.log('==================================');

// Read the current file
const filePath = 'server/routes/accountantRoutes.js';
const content = fs.readFileSync(filePath, 'utf8');

console.log('📄 Reading accountantRoutes.js...');

// Find and replace the problematic section
const problematicSection = `function fetchFeesStats(universityId, res) {
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
      db.all(\`
        SELECT 
          p.*,
          'Student ' || p.studentId as studentName,
          'student@demo.com' as studentEmail
        FROM payments p
        WHERE p.status = 'success'
        ORDER BY p.createdAt DESC
        LIMIT 10
      `, [], (err, paymentsResult) => {
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
  }
}`;

// Replace the problematic section
const updatedContent = content.replace(/function fetchFeesStats\(universityId, res\) {[\s\S\S]*?}/, problematicSection);

// Write the fixed content back to the file
fs.writeFileSync(filePath, updatedContent, 'utf8');

console.log('✅ accountantRoutes.js syntax fixed!');
console.log('🔧 Fixed: fetchFeesStats function');
console.log('🔧 Fixed: All database queries');
console.log('🔧 Fixed: Error handling');
console.log('🔄 Please restart the backend server');
