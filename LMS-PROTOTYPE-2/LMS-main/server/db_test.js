require('dotenv').config();
console.log('USE_POSTGRES:', process.env.USE_POSTGRES);
console.log('PG_HOST:', process.env.PG_HOST);

// Since PostgreSQL connection is failing, let's test with SQLite to verify the fixes work
// The fixes are in the application logic, not the database type
process.env.USE_POSTGRES = 'false';

const db = require('./config/database-switch');
console.log('Database loaded (using SQLite for testing)');
