const { Client } = require('pg');

console.log('Testing PostgreSQL connection...');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres123',
  database: 'lms_database'
});

client.connect()
  .then(() => {
    console.log('PostgreSQL connection successful!');
    return client.query('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = $1 AND table_type = $2', ['public', 'BASE TABLE']);
  })
  .then(result => {
    console.log('Tables in PostgreSQL: ' + result.rows[0].count);
    return client.query('SELECT COUNT(*) as count FROM users');
  })
  .then(userResult => {
    console.log('Users in PostgreSQL: ' + userResult.rows[0].count);
    console.log('Migration successful!');
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
  })
  .finally(() => {
    client.end();
  });
