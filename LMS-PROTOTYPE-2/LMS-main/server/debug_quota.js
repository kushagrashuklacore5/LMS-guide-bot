const { getSuperadminSubscription, countUsersByRoleInUniversity } = require('./helpers/quotaHelper');

// Create a mock request object
const mockReq = {
  tenant: {
    database: require('./config/database-switch')
  }
};

console.log('Testing quota functions...');

// Test getSuperadminSubscription
getSuperadminSubscription(mockReq, "superadmin-1")
  .then(subscription => {
    console.log('✅ getSuperadminSubscription result:', subscription);
    
    // Test countUsersByRoleInUniversity
    return countUsersByRoleInUniversity(mockReq, 1, 'student');
  })
  .then(count => {
    console.log('✅ countUsersByRoleInUniversity result:', count);
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
