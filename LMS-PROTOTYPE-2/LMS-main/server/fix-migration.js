const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');

console.log('==========================================');
console.log('    FIXING MIGRATION ISSUES');
console.log('==========================================');

const sqlitePath = path.join(__dirname, 'data', 'lms-database.sqlite');
const pgConfig = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres123',
  database: 'lms_database'
};

async function fixMigration() {
  let sqliteDb;
  let pgClient;
  
  try {
    // Connect to databases
    sqliteDb = new sqlite3.Database(sqlitePath);
    pgClient = new Client(pgConfig);
    await pgClient.connect();
    
    console.log('Connected to both databases');
    
    // Fix users table
    console.log('\nFixing users table...');
    
    // Drop existing users table if it exists
    try {
      await pgClient.query('DROP TABLE IF EXISTS users');
      console.log('Dropped existing users table');
    } catch (err) {
      // Table might not exist
    }
    
    // Create users table with correct schema
    const createUsersSQL = `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        university_id INTEGER DEFAULT 1,
        isApproved BOOLEAN DEFAULT false,
        classroom_id INTEGER,
        subscriptionPlan TEXT DEFAULT 'free',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pgClient.query(createUsersSQL);
    console.log('Created users table with correct schema');
    
    // Get users data from SQLite
    const usersData = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log(`Found ${usersData.length} users in SQLite`);
    
    // Insert users into PostgreSQL
    if (usersData.length > 0) {
      const insertSQL = `
        INSERT INTO users (name, email, password, role, university_id, isApproved, classroom_id, subscriptionPlan, createdAt, updatedAt)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      let insertedCount = 0;
      for (const user of usersData) {
        try {
          await pgClient.query(insertSQL, [
            user.name,
            user.email,
            user.password,
            user.role,
            user.university_id,
            user.isApproved === 1 || user.isApproved === true,
            user.classroom_id,
            user.subscriptionPlan,
            user.createdAt,
            user.updatedAt
          ]);
          insertedCount++;
        } catch (err) {
          console.log('Error inserting user:', err.message);
        }
      }
      
      console.log(`Inserted ${insertedCount} users into PostgreSQL`);
    }
    
    // Check other important tables
    const tables = ['universities', 'courses', 'classrooms'];
    
    for (const tableName of tables) {
      console.log(`\nChecking ${tableName} table...`);
      
      try {
        const result = await pgClient.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`${tableName}: ${result.rows[0].count} records`);
      } catch (err) {
        console.log(`${tableName}: Table not found`);
      }
    }
    
    console.log('\n==========================================');
    console.log('           FIX COMPLETED!');
    console.log('==========================================');
    
  } catch (error) {
    console.error('Fix failed:', error.message);
  } finally {
    if (sqliteDb) db.close();
    if (pgClient) await pgClient.end();
  }
}

fixMigration();
