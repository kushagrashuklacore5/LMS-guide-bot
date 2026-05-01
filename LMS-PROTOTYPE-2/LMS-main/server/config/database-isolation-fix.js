const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// This script completely fixes database isolation to ensure
// each superadmin has their own completely separate database and users

const BASE_DIR = path.join(__dirname, '..');
const MAIN_DB_PATH = path.join(BASE_DIR, 'data', 'lms-main.sqlite');
const TENANT_DB_DIR = path.join(BASE_DIR, 'data', 'tenants');

// Ensure directories exist
if (!fs.existsSync(path.join(BASE_DIR, 'data'))) {
  fs.mkdirSync(path.join(BASE_DIR, 'data'), { recursive: true });
}
if (!fs.existsSync(TENANT_DB_DIR)) {
  fs.mkdirSync(TENANT_DB_DIR, { recursive: true });
}

console.log('🔧 IMPLEMENTING COMPLETE DATABASE ISOLATION FIX');
console.log('=============================================\n');

// Step 1: Clean up main database - only keep superadmins
function cleanupMainDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(MAIN_DB_PATH);
    
    console.log('📋 Step 1: Cleaning up main database...');
    
    // Drop and recreate main database with only superadmin table
    db.serialize(() => {
      // Drop all tables except users
      db.run('DROP TABLE IF EXISTS universities', (err) => {
        if (err) console.error('Error dropping universities:', err);
      });
      
      db.run('DROP TABLE IF EXISTS students', (err) => {
        if (err) console.error('Error dropping students:', err);
      });
      
      db.run('DROP TABLE IF EXISTS teachers', (err) => {
        if (err) console.error('Error dropping teachers:', err);
      });
      
      db.run('DROP TABLE IF EXISTS classrooms', (err) => {
        if (err) console.error('Error dropping classrooms:', err);
      });
      
      db.run('DROP TABLE IF EXISTS courses', (err) => {
        if (err) console.error('Error dropping courses:', err);
      });
      
      db.run('DROP TABLE IF EXISTS feeStructures', (err) => {
        if (err) console.error('Error dropping feeStructures:', err);
      });
      
      db.run('DROP TABLE IF EXISTS vendors', (err) => {
        if (err) console.error('Error dropping vendors:', err);
      });
      
      db.run('DROP TABLE IF EXISTS inventory', (err) => {
        if (err) console.error('Error dropping inventory:', err);
      });
      
      // Clean users table - only keep superadmins
      db.run('DELETE FROM users WHERE role != "superadmin"', (err) => {
        if (err) {
          console.error('Error cleaning users table:', err);
          reject(err);
        } else {
          console.log('✅ Main database cleaned - only superadmins remain');
          db.close((err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      });
    });
  });
}

// Step 2: Create isolated tenant databases for each superadmin
function createTenantDatabases() {
  return new Promise((resolve, reject) => {
    const mainDb = new sqlite3.Database(MAIN_DB_PATH);
    
    console.log('\n📋 Step 2: Creating isolated tenant databases...');
    
    // Get all superadmins
    mainDb.all('SELECT * FROM users WHERE role = "superadmin"', [], (err, superadmins) => {
      if (err) {
        console.error('Error getting superadmins:', err);
        reject(err);
        return;
      }
      
      console.log(`Found ${superadmins.length} superadmins to create databases for`);
      
      let completed = 0;
      let errors = [];
      
      superadmins.forEach(superadmin => {
        const tenantDbPath = path.join(TENANT_DB_DIR, `tenant_${superadmin.id}.sqlite`);
        
        // Remove existing database if it exists
        if (fs.existsSync(tenantDbPath)) {
          fs.unlinkSync(tenantDbPath);
        }
        
        const tenantDb = new sqlite3.Database(tenantDbPath);
        
        console.log(`\n🏗️ Creating database for SuperAdmin: ${superadmin.name} (${superadmin.email})`);
        
        tenantDb.serialize(() => {
          // Create universities table
          tenantDb.run(`
            CREATE TABLE universities (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT,
              phone TEXT,
              address TEXT,
              established_year INTEGER,
              type TEXT,
              status TEXT DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
          
          // Create users table (for regular users only - NO superadmins here)
          tenantDb.run(`
            CREATE TABLE users (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              role TEXT NOT NULL,
              university_id INTEGER DEFAULT 1,
              superadmin_id INTEGER NOT NULL,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              status TEXT DEFAULT 'active',
              FOREIGN KEY (university_id) REFERENCES universities(id)
            )
          `);
          
          // Create students table
          tenantDb.run(`
            CREATE TABLE students (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER UNIQUE NOT NULL,
              roll_number TEXT UNIQUE,
              enrollment_date DATE,
              semester INTEGER DEFAULT 1,
              section TEXT,
              batch TEXT,
              academic_year TEXT,
              status TEXT DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id)
            )
          `);
          
          // Create teachers table
          tenantDb.run(`
            CREATE TABLE teachers (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER UNIQUE NOT NULL,
              employee_id TEXT UNIQUE,
              department TEXT,
              designation TEXT,
              specialization TEXT,
              experience_years INTEGER DEFAULT 0,
              joining_date DATE,
              status TEXT DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id)
            )
          `);
          
          // Create classrooms table
          tenantDb.run(`
            CREATE TABLE classrooms (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              description TEXT,
              capacity INTEGER DEFAULT 30,
              building TEXT,
              floor TEXT,
              room_number TEXT,
              university_id INTEGER DEFAULT 1,
              status TEXT DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (university_id) REFERENCES universities(id)
            )
          `);
          
          // Create courses table
          tenantDb.run(`
            CREATE TABLE courses (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              code TEXT UNIQUE NOT NULL,
              description TEXT,
              credits INTEGER DEFAULT 3,
              duration_weeks INTEGER DEFAULT 16,
              university_id INTEGER DEFAULT 1,
              status TEXT DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (university_id) REFERENCES universities(id)
            )
          `);
          
          // Create feeStructures table
          tenantDb.run(`
            CREATE TABLE feeStructures (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              description TEXT,
              amount DECIMAL(10,2) NOT NULL,
              type TEXT NOT NULL,
              frequency TEXT DEFAULT 'monthly',
              university_id INTEGER DEFAULT 1,
              status TEXT DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (university_id) REFERENCES universities(id)
            )
          `);
          
          // Create vendors table
          tenantDb.run(`
            CREATE TABLE vendors (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              email TEXT,
              phone TEXT,
              address TEXT,
              category TEXT,
              rating REAL DEFAULT 0,
              status TEXT DEFAULT 'active',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `);
          
          // Create inventory table
          tenantDb.run(`
            CREATE TABLE inventory (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL,
              description TEXT,
              quantity INTEGER DEFAULT 0,
              unit TEXT,
              vendorId INTEGER,
              price DECIMAL(10,2),
              status TEXT DEFAULT 'active',
              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (vendorId) REFERENCES vendors(id)
            )
          `);
          
          // Insert default university
          tenantDb.run(`
            INSERT INTO universities (name, email, status)
            VALUES (?, ?, 'active')
          `, [`${superadmin.name}'s University`, superadmin.email]);
          
          console.log(`✅ Database created for SuperAdmin ${superadmin.id}`);
          
          completed++;
          if (completed === superadmins.length) {
            console.log('\n✅ All tenant databases created successfully!');
            tenantDb.close();
            mainDb.close();
            resolve();
          }
        });
      });
    });
  });
}

// Step 3: Update middleware to enforce strict isolation
function updateMiddleware() {
  console.log('\n📋 Step 3: Updating middleware for strict isolation...');
  
  const middlewarePath = path.join(BASE_DIR, 'middleware', 'tenant-db-isolated.js');
  const middlewareContent = `
const { getTenantDatabase, mainDb } = require('../config/multi-tenant-db-isolated');

// Middleware to attach appropriate database to request
function tenantDatabaseIsolation(req, res, next) {
  try {
    // Get user from authentication middleware
    const user = req.user;
    
    console.log(\`\n=== STRICT Tenant Database Isolation ===\`);
    console.log(\`Request: \${req.method} \${req.originalUrl}\`);
    console.log(\`User from req.user:\`, user);
    console.log(\`User exists:\`, !!user);
    console.log(\`User role:\`, user?.role);
    console.log(\`User email:\`, user?.email);
    
    if (!user) {
      console.error('No user found in request');
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    console.log(\`User: \${user.email} (\${user.role})\`);
    console.log(\`Request: \${req.method} \${req.originalUrl}\`);

    // CRITICAL: Internal admin portal routes use MAIN database ONLY
    if (req.originalUrl.includes('/internal/')) {
      console.log('🔒 Using MAIN database for internal admin portal');
      req.db = mainDb;
      req.isMainDb = true;
      req.tenantId = null;
      next();
      return;
    }

    // CRITICAL: Superadmin users get their OWN tenant database
    if (user.role === 'superadmin') {
      const superadminId = user.userId || user.id;
      const tenantDb = getTenantDatabase(superadminId);
      console.log(\`🔒 Using TENANT database for superadmin: \${superadminId}\`);
      req.db = tenantDb;
      req.tenantId = superadminId;
      req.isMainDb = false;
      req.superadminId = superadminId;
      next();
      return;
    }

    // CRITICAL: All other users MUST have superadminId and use that tenant database
    if (user.superadminId) {
      const tenantDb = getTenantDatabase(user.superadminId);
      console.log(\`🔒 Using TENANT database for user \${user.userId} (superadmin: \${user.superadminId})\`);
      req.db = tenantDb;
      req.tenantId = user.superadminId;
      req.isMainDb = false;
      req.superadminId = user.superadminId;
      next();
      return;
    }

    // CRITICAL: No fallback - this prevents any database sharing
    console.error('🚨 DATABASE ISOLATION BREACH: User without proper superadmin assignment:', user);
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied: User database assignment error' 
    });
    
  } catch (error) {
    console.error('🚨 Tenant database isolation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Database connection error' 
    });
  }
}

module.exports = tenantDatabaseIsolation;
`;

  fs.writeFileSync(middlewarePath, middlewareContent);
  console.log('✅ Middleware updated for strict isolation');
}

// Step 4: Update multi-tenant-db-isolated.js to remove shared users
function updateMultiTenantConfig() {
  console.log('\n📋 Step 4: Updating multi-tenant configuration...');
  
  const configPath = path.join(BASE_DIR, 'config', 'multi-tenant-db-isolated.js');
  const configContent = `
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Base directory for tenant databases
const TENANT_DB_DIR = path.join(__dirname, '..', 'data', 'tenants');

// Ensure tenant directory exists
if (!fs.existsSync(TENANT_DB_DIR)) {
  fs.mkdirSync(TENANT_DB_DIR, { recursive: true });
}

// Main database for superadmin management ONLY
const MAIN_DB_PATH = path.join(__dirname, '..', 'data', 'lms-main.sqlite');
const mainDb = new sqlite3.Database(MAIN_DB_PATH);

// Cache for tenant database connections
const tenantDbCache = new Map();

// Initialize main database (ONLY for superadmins)
function initializeMainDatabase() {
  console.log('=== Initializing Main Database (SuperAdmins Only) ===');
  
  mainDb.serialize(() => {
    // Users table - ONLY for superadmins
    mainDb.run(\`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME,
        status TEXT DEFAULT 'active',
        database_id TEXT UNIQUE
      )
    \`, (err) => {
      if (err) {
        console.error('Error creating main users table:', err);
      } else {
        console.log('Main users table created (superadmins only)');
      }
    });
  });
}

// Get tenant database connection
function getTenantDatabase(superadminId) {
  // Check cache first
  if (tenantDbCache.has(superadminId)) {
    return tenantDbCache.get(superadminId);
  }

  // Create tenant database path
  const tenantDbPath = path.join(TENANT_DB_DIR, \`tenant_\${superadminId}.sqlite\`);
  
  console.log(\`\\n=== Loading Tenant Database for Superadmin \${superadminId} ===\`);
  console.log(\`Database path: \${tenantDbPath}\`);
  
  // Create tenant database connection
  const tenantDb = new sqlite3.Database(tenantDbPath, (err) => {
    if (err) {
      console.error(\`Error connecting to tenant database \${superadminId}:\`, err);
      return;
    }
    console.log(\`Tenant database connected for superadmin \${superadminId}\`);
  });

  // Cache the connection
  tenantDbCache.set(superadminId, tenantDb);

  return tenantDb;
}

// Delete tenant database
function deleteTenantDatabase(superadminId) {
  const tenantDbPath = path.join(TENANT_DB_DIR, \`tenant_\${superadminId}.sqlite\`);
  
  try {
    // Close database connection if cached
    if (tenantDbCache.has(superadminId)) {
      const db = tenantDbCache.get(superadminId);
      db.close((err) => {
        if (err) {
          console.error(\`Error closing tenant database \${superadminId}:\`, err);
        } else {
          console.log(\`Tenant database \${superadminId} closed\`);
        }
      });
      tenantDbCache.delete(superadminId);
    }

    // Delete database file
    if (fs.existsSync(tenantDbPath)) {
      fs.unlinkSync(tenantDbPath);
      console.log(\`Tenant database \${superadminId} deleted successfully\`);
      return true;
    } else {
      console.log(\`Tenant database \${superadminId} file not found\`);
      return false;
    }
  } catch (error) {
    console.error(\`Error deleting tenant database \${superadminId}:\`, error);
    return false;
  }
}

// Initialize main database on startup
initializeMainDatabase();

module.exports = {
  mainDb,
  getTenantDatabase,
  deleteTenantDatabase,
  TENANT_DB_DIR
};
`;

  fs.writeFileSync(configPath, configContent);
  console.log('✅ Multi-tenant configuration updated');
}

// Execute all steps
async function fixDatabaseIsolation() {
  try {
    await cleanupMainDatabase();
    await createTenantDatabases();
    updateMiddleware();
    updateMultiTenantConfig();
    
    console.log('\n🎉 DATABASE ISOLATION FIX COMPLETED!');
    console.log('====================================');
    console.log('✅ Each superadmin now has their own completely separate database');
    console.log('✅ No users are shared between databases');
    console.log('✅ Main database only contains superadmins');
    console.log('✅ Tenant databases only contain regular users');
    console.log('✅ Middleware enforces strict separation');
    console.log('\n📋 SUMMARY OF CHANGES:');
    console.log('1. Main database cleaned - only superadmins remain');
    console.log('2. Separate tenant databases created for each superadmin');
    console.log('3. Users table in tenant databases includes superadmin_id');
    console.log('4. Middleware updated for strict isolation');
    console.log('5. Multi-tenant config updated to prevent sharing');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during database isolation fix:', error);
    process.exit(1);
  }
}

fixDatabaseIsolation();
