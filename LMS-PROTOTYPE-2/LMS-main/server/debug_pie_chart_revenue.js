const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./lms_database.db');

console.log('🔍 DEBUGGING PIE CHART REVENUE ISSUE');
console.log('====================================');

// Check if there are any payment records
db.all('SELECT * FROM payments', (err, payments) => {
  if (err) {
    console.error('Error fetching payments:', err);
    return;
  }
  
  console.log(`💰 Total payments in database: ${payments.length}`);
  
  if (payments.length > 0) {
    payments.forEach((payment, index) => {
      console.log(`   ${index + 1}. ID: ${payment.id}, Amount: ${payment.amount}, Status: ${payment.status}, Type: ${payment.type}, Date: ${payment.createdAt}`);
    });
    
    // Calculate total fees collected
    const totalFees = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    console.log(`\n💰 Total fees collected (success): ₹${totalFees.toLocaleString('en-IN')}`);
    console.log('📊 This should appear in:');
    console.log('   • Total Fees Collected card');
    console.log('   • Pie chart revenue slice');
    console.log('   • Dashboard financial summary');
    
  } else {
    console.log('ℹ️ No payments found in database');
    console.log('📊 Revenue will show ₹0 in all places');
    console.log('💡 To test: Add payment records to database');
  }
  
  // Test the fees-stats API query directly
  console.log('\n🔧 TESTING FEES-STATS QUERY...');
  
  db.all('SELECT SUM(amount) as totalFeesCollected FROM payments WHERE status = "success"', (err, result) => {
    if (err) {
      console.error('Error in fees query:', err);
    } else {
      const totalFees = result[0]?.totalFeesCollected || 0;
      console.log(`📊 API Query Result: ₹${totalFees.toLocaleString('en-IN')}`);
      console.log('🎯 This should be returned by /accountant/fees-stats API');
      console.log('💡 If this is > 0 but pie chart shows 0, frontend issue');
      console.log('💡 If this is 0, need to add payment records');
    }
    
    db.close();
  });
});
