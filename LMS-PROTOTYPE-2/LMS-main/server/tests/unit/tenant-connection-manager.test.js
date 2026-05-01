const assert = require('assert');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const TenantConnectionManager = require('../../config/tenant-connection-manager');

describe('TenantConnectionManager', () => {
  let tenantManager;
  let testDir;
  let masterDbPath;
  let tenantDbBasePath;

  before(async () => {
    // Setup test directories
    testDir = path.join(__dirname, '../temp-test-data');
    masterDbPath = path.join(testDir, 'test-master.sqlite');
    tenantDbBasePath = path.join(testDir, 'tenants');

    // Ensure test directory exists
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Override config for testing
    process.env.MASTER_DB_PATH = masterDbPath;
    process.env.TENANT_DB_BASE_PATH = tenantDbBasePath;
    process.env.TENANT_DB_POOL_MAX = '5';
    process.env.TENANT_DB_POOL_IDLE_TIMEOUT = '1000';

    tenantManager = new TenantConnectionManager();
    await tenantManager.initializeMasterDb();
  });

  after(async () => {
    // Cleanup
    await tenantManager.closeAll();
    
    // Remove test files
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    // Clear any existing connections
    for (const [superadminId, connection] of tenantManager.connections) {
      connection.db.close();
    }
    tenantManager.connections.clear();

    // Clear master database
    await new Promise((resolve) => {
      tenantManager.masterDb.run('DELETE FROM superadmin_registry', resolve);
    });
  });

  describe('Master Database Operations', () => {
    it('should initialize master database with correct tables', async () => {
      const tables = await new Promise((resolve, reject) => {
        tenantManager.masterDb.all(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
          [],
          (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row.name));
          }
        );
      });

      assert(tables.includes('superadmin_registry'), 'superadmin_registry table should exist');
    });

    it('should create tenant database registration', async () => {
      const tenantData = {
        superadminId: 'test-superadmin-1',
        name: 'Test Superadmin',
        email: 'test@example.com',
        password: 'hashed_password'
      };

      const result = await tenantManager.createTenantDatabase(
        tenantData.superadminId,
        tenantData.name,
        tenantData.email,
        tenantData.password
      );

      assert.strictEqual(result.id, tenantData.superadminId);
      assert.strictEqual(result.name, tenantData.name);
      assert.strictEqual(result.email, tenantData.email);
      assert(result.databaseName.startsWith('sa_'));
      assert(result.databaseName.endsWith('_db'));
      assert(fs.existsSync(result.databasePath));

      // Verify it's stored in master database
      const stored = await new Promise((resolve, reject) => {
        tenantManager.masterDb.get(
          'SELECT * FROM superadmin_registry WHERE id = ?',
          [tenantData.superadminId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      assert(stored, 'Tenant should be stored in master database');
      assert.strictEqual(stored.id, tenantData.superadminId);
      assert.strictEqual(stored.email, tenantData.email);
    });

    it('should prevent duplicate tenant creation', async () => {
      const tenantData = {
        superadminId: 'test-superadmin-2',
        name: 'Test Superadmin 2',
        email: 'test2@example.com',
        password: 'hashed_password'
      };

      // Create first tenant
      await tenantManager.createTenantDatabase(
        tenantData.superadminId,
        tenantData.name,
        tenantData.email,
        tenantData.password
      );

      // Try to create duplicate
      try {
        await tenantManager.createTenantDatabase(
          tenantData.superadminId,
          'Another Name',
          'another@example.com',
          'password'
        );
        assert.fail('Should have thrown error for duplicate tenant');
      } catch (error) {
        assert(error.message.includes('already exists'));
      }
    });
  });

  describe('Tenant Connection Management', () => {
    let tenantInfo;

    beforeEach(async () => {
      // Create a test tenant
      tenantInfo = await tenantManager.createTenantDatabase(
        'test-tenant-1',
        'Test Tenant',
        'tenant@test.com',
        'password'
      );
    });

    it('should create and cache tenant connections', async () => {
      const connection1 = await tenantManager.getTenantConnection('test-tenant-1');
      const connection2 = await tenantManager.getTenantConnection('test-tenant-1');

      // Should return the same connection (cached)
      assert.strictEqual(connection1, connection2);
      assert(tenantManager.connections.has('test-tenant-1'));
    });

    it('should throw error for non-existent tenant', async () => {
      try {
        await tenantManager.getTenantConnection('non-existent-tenant');
        assert.fail('Should have thrown error for non-existent tenant');
      } catch (error) {
        assert(error.message.includes('Tenant not found'));
      }
    });

    it('should update last used timestamp on access', async () => {
      const initialTime = Date.now();
      await tenantManager.getTenantConnection('test-tenant-1');
      
      const connection = tenantManager.connections.get('test-tenant-1');
      assert(connection.lastUsed >= initialTime);
    });

    it('should handle connection cleanup', async () => {
      // Create connection
      await tenantManager.getTenantConnection('test-tenant-1');
      assert(tenantManager.connections.has('test-tenant-1'));

      // Wait for idle timeout (configured to 1 second in test)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Trigger cleanup manually (normally runs on interval)
      const now = Date.now();
      const toDelete = [];
      tenantManager.connections.forEach((connection, superadminId) => {
        if (now - connection.lastUsed > tenantManager.config.idleTimeout) {
          toDelete.push(superadminId);
        }
      });

      toDelete.forEach(superadminId => {
        const connection = tenantManager.connections.get(superadminId);
        connection.db.close();
        tenantManager.connections.delete(superadminId);
      });

      assert(!tenantManager.connections.has('test-tenant-1'));
    });
  });

  describe('Database Isolation', () => {
    let tenant1Info, tenant2Info;

    beforeEach(async () => {
      // Create two test tenants
      tenant1Info = await tenantManager.createTenantDatabase(
        'test-tenant-1',
        'Tenant 1',
        'tenant1@test.com',
        'password'
      );

      tenant2Info = await tenantManager.createTenantDatabase(
        'test-tenant-2',
        'Tenant 2',
        'tenant2@test.com',
        'password'
      );
    });

    it('should maintain separate databases for different tenants', async () => {
      const db1 = await tenantManager.getTenantConnection('test-tenant-1');
      const db2 = await tenantManager.getTenantConnection('test-tenant-2');

      // They should be different database connections
      assert.notStrictEqual(db1, db2);

      // Insert data into first tenant
      await new Promise((resolve) => {
        db1.run(
          'INSERT INTO users (name, email, password, role, isApproved) VALUES (?, ?, ?, ?, ?)',
          ['User 1', 'user1@tenant1.com', 'pass', 'student', 1],
          resolve
        );
      });

      // Check that data doesn't appear in second tenant
      const rows = await new Promise((resolve, reject) => {
        db2.all('SELECT * FROM users', [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      assert.strictEqual(rows.length, 0, 'Second tenant should not have data from first tenant');
    });

    it('should allow independent operations in each tenant', async () => {
      const db1 = await tenantManager.getTenantConnection('test-tenant-1');
      const db2 = await tenantManager.getTenantConnection('test-tenant-2');

      // Insert different data into each tenant
      await new Promise((resolve) => {
        db1.run(
          'INSERT INTO users (name, email, password, role, isApproved) VALUES (?, ?, ?, ?, ?)',
          ['User 1', 'user1@tenant1.com', 'pass', 'student', 1],
          resolve
        );
      });

      await new Promise((resolve) => {
        db2.run(
          'INSERT INTO users (name, email, password, role, isApproved) VALUES (?, ?, ?, ?, ?)',
          ['User 2', 'user2@tenant2.com', 'pass', 'student', 1],
          resolve
        );
      });

      // Verify data isolation
      const rows1 = await new Promise((resolve) => {
        db1.all('SELECT * FROM users', [], (err, rows) => resolve(rows));
      });

      const rows2 = await new Promise((resolve) => {
        db2.all('SELECT * FROM users', [], (err, rows) => resolve(rows));
      });

      assert.strictEqual(rows1.length, 1);
      assert.strictEqual(rows1[0].email, 'user1@tenant1.com');
      assert.strictEqual(rows2.length, 1);
      assert.strictEqual(rows2[0].email, 'user2@tenant2.com');
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should return correct connection statistics', () => {
      const stats = tenantManager.getStats();

      assert(typeof stats.activeConnections === 'number');
      assert(typeof stats.maxConnections === 'number');
      assert.strictEqual(stats.masterDbPath, masterDbPath);
      assert.strictEqual(stats.tenantDbBasePath, tenantDbBasePath);
      assert(Array.isArray(stats.tenants));
    });

    it('should track active connections correctly', async () => {
      // Create some tenants
      await tenantManager.createTenantDatabase('stats-1', 'Stats 1', 'stats1@test.com', 'pass');
      await tenantManager.createTenantDatabase('stats-2', 'Stats 2', 'stats2@test.com', 'pass');
      await tenantManager.createTenantDatabase('stats-3', 'Stats 3', 'stats3@test.com', 'pass');

      // Get connections for some tenants
      await tenantManager.getTenantConnection('stats-1');
      await tenantManager.getTenantConnection('stats-2');

      const stats = tenantManager.getStats();
      assert.strictEqual(stats.activeConnections, 2);
      assert.strictEqual(stats.tenants.length, 2);
    });
  });

  describe('Error Handling', () => {
    it('should handle database file creation errors', async () => {
      // Try to create tenant with invalid path
      const invalidPath = '/invalid/path/that/does/not/exist/database.sqlite';
      
      try {
        await tenantManager.createTenantDatabase(
          'invalid-tenant',
          'Invalid Tenant',
          'invalid@test.com',
          'password'
        );
        assert.fail('Should have thrown error for invalid path');
      } catch (error) {
        assert(error.message.includes('Tenant database file not found'));
      }
    });

    it('should handle connection errors gracefully', async () => {
      // Create a tenant
      const tenantInfo = await tenantManager.createTenantDatabase(
        'error-tenant',
        'Error Tenant',
        'error@test.com',
        'password'
      );

      // Get connection
      const db = await tenantManager.getTenantConnection('error-tenant');

      // Close the database manually to simulate error
      await new Promise((resolve) => db.close(resolve));

      // Try to use the closed connection
      try {
        await new Promise((resolve, reject) => {
          db.get('SELECT 1', [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        assert.fail('Should have thrown error for closed database');
      } catch (error) {
        assert(error.message.includes('database is closed'));
      }
    });
  });
});
