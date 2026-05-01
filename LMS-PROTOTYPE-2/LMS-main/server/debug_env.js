require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log('🔍 Environment Variables Debug:');
console.log('==============================');
console.log('USE_POSTGRES:', process.env.USE_POSTGRES);
console.log('PG_HOST:', process.env.PG_HOST);
console.log('PG_PORT:', process.env.PG_PORT);
console.log('PG_USER:', process.env.PG_USER);
console.log('PG_PASSWORD:', process.env.PG_PASSWORD);
console.log('PG_DATABASE:', process.env.PG_DATABASE);

console.log('\n📊 USE_POSTGRES type:', typeof process.env.USE_POSTGRES);
console.log('📊 USE_POSTGRES === "true":', process.env.USE_POSTGRES === 'true');
console.log('📊 USE_POSTGRES === true:', process.env.USE_POSTGRES === true);

// Test database-switch
const db = require('./config/database-switch');
console.log('\n✅ Database module loaded successfully');
