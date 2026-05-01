const assert = require('assert');
const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const TenantConnectionManager = require('../../config/tenant-connection-manager');
const { tenantResolver, flexibleTenantResolver } = require('../../middleware/tenant-resolver');

describe('Tenant Isolation Integration Tests', () => {
  let app;
  let tenantManager;
  let testDir;
  let masterDbPath;
  let tenantDbBasePath;
  let server;

  // Test data
  let tenant1Token, tenant2Token;
  let tenant1Id = 'integration-tenant-1';
  let tenant2Id = 'integration-tenant-2';

  before(async () => {
    // Setup test environment
    testDir = path.join(__dirname, '../temp-integration-test');
    masterDbPath = path.join(testDir, 'test-master.sqlite');
    tenantDbBasePath = path.join(testDir, 'tenants');

    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Override environment for testing
    process.env.MASTER_DB_PATH = masterDbPath;
    process.env.TENANT_DB_BASE_PATH = tenantDbBasePath;
    process.env.TENANT_DB_POOL_MAX = '10';
    process.env.JWT_SECRET = 'test-jwt-secret';

    // Initialize tenant manager
    tenantManager = new TenantConnectionManager();
    await tenantManager.initializeMasterDb();

    // Create test tenants
    await tenantManager.createTenantDatabase(tenant1Id, 'Tenant 1', 'tenant1@test.com', 'password');
    await tenantManager.createTenantDatabase(tenant2Id, 'Tenant 2', 'tenant2@test.com', 'password');

    // Generate JWT tokens for testing
    tenant1Token = jwt.sign(
      { id: tenant1Id, role: 'superadmin', email: 'tenant1@test.com' },
      process.env.JWT_SECRET
    );

    tenant2Token = jwt.sign(
      { id: tenant2Id, role: 'superadmin', email: 'tenant2@test.com' },
      process.env.JWT_SECRET
    );

    // Setup test app
    setupTestApp();
  });

  after(async () => {
    if (server) {
      server.close();
    }
    
    await tenantManager.closeAll();
    
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  function setupTestApp() {
    app = express();
    app.use(express.json());

    // Apply tenant resolver middleware
    app.use(tenantResolver);

    // Test routes
    app.get('/api/test/current-tenant', (req, res) => {
      res.json({
        success: true,
        tenant: {
          superadminId: req.tenant?.superadminId,
          isMaster: req.tenant?.isMaster
        }
      });
    });

    app.post('/api/test/create-user', async (req, res) => {
      try {
        const db = req.tenant.database;
        const { name, email, role } = req.body;

        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO users (name, email, password, role, isApproved) VALUES (?, ?, ?, ?, ?)',
            [name, email, 'password', role, 1],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });

        res.json({ success: true, message: 'User created' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.get('/api/test/users', async (req, res) => {
      try {
        const db = req.tenant.database;
        const users = await new Promise((resolve, reject) => {
          db.all('SELECT id, name, email, role FROM users', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });

        res.json({ success: true, users });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post('/api/test/create-course', async (req, res) => {
      try {
        const db = req.tenant.database;
        const { title, description, mentorId } = req.body;

        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO courses (title, description, mentorId, university_id) VALUES (?, ?, ?, ?)',
            [title, description, mentorId, 1],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });

        res.json({ success: true, message: 'Course created' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.get('/api/test/courses', async (req, res) => {
      try {
        const db = req.tenant.database;
        const courses = await new Promise((resolve, reject) => {
          db.all('SELECT * FROM courses', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });

        res.json({ success: true, courses });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Health check endpoint (no tenant required)
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    server = app.listen(0); // Use random port
  }

  describe('Tenant Context Resolution', () => {
    it('should resolve tenant context from JWT token', async () => {
      const response = await request(app)
        .get('/api/test/current-tenant')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .expect(200);

      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.tenant.superadminId, tenant1Id);
      assert.strictEqual(response.body.tenant.isMaster, false);
    });

    it('should resolve different contexts for different tenants', async () => {
      const response1 = await request(app)
        .get('/api/test/current-tenant')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .expect(200);

      const response2 = await request(app)
        .get('/api/test/current-tenant')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(200);

      assert.strictEqual(response1.body.tenant.superadminId, tenant1Id);
      assert.strictEqual(response2.body.tenant.superadminId, tenant2Id);
    });

    it('should handle requests without authentication', async () => {
      const response = await request(app)
        .get('/api/test/current-tenant')
        .expect(401);

      assert.strictEqual(response.body.success, false);
      assert(response.body.message.includes('Authentication required'));
    });

    it('should allow health checks without tenant context', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      assert.strictEqual(response.body.status, 'healthy');
    });
  });

  describe('Data Isolation', () => {
    it('should maintain complete data isolation between tenants', async () => {
      // Create user in tenant 1
      await request(app)
        .post('/api/test/create-user')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          name: 'Tenant 1 User',
          email: 'user1@tenant1.com',
          role: 'student'
        })
        .expect(200);

      // Create user in tenant 2
      await request(app)
        .post('/api/test/create-user')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .send({
          name: 'Tenant 2 User',
          email: 'user2@tenant2.com',
          role: 'student'
        })
        .expect(200);

      // Get users from tenant 1
      const users1Response = await request(app)
        .get('/api/test/users')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .expect(200);

      // Get users from tenant 2
      const users2Response = await request(app)
        .get('/api/test/users')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(200);

      // Verify isolation
      assert.strictEqual(users1Response.body.users.length, 1);
      assert.strictEqual(users1Response.body.users[0].email, 'user1@tenant1.com');

      assert.strictEqual(users2Response.body.users.length, 1);
      assert.strictEqual(users2Response.body.users[0].email, 'user2@tenant2.com');
    });

    it('should prevent cross-tenant data access', async () => {
      // Create course in tenant 1
      await request(app)
        .post('/api/test/create-course')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          title: 'Tenant 1 Course',
          description: 'Course for tenant 1',
          mentorId: tenant1Id
        })
        .expect(200);

      // Try to access course from tenant 2
      const courses2Response = await request(app)
        .get('/api/test/courses')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(200);

      // Tenant 2 should not see tenant 1's course
      assert.strictEqual(courses2Response.body.courses.length, 0);

      // But tenant 1 should see their course
      const courses1Response = await request(app)
        .get('/api/test/courses')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .expect(200);

      assert.strictEqual(courses1Response.body.courses.length, 1);
      assert.strictEqual(courses1Response.body.courses[0].title, 'Tenant 1 Course');
    });

    it('should handle concurrent operations across tenants', async () => {
      // Simulate concurrent operations
      const promises = [];

      // Create multiple users in tenant 1
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/test/create-user')
            .set('Authorization', `Bearer ${tenant1Token}`)
            .send({
              name: `Tenant 1 User ${i}`,
              email: `user${i}@tenant1.com`,
              role: 'student'
            })
        );
      }

      // Create multiple users in tenant 2
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/test/create-user')
            .set('Authorization', `Bearer ${tenant2Token}`)
            .send({
              name: `Tenant 2 User ${i}`,
              email: `user${i}@tenant2.com`,
              role: 'student'
            })
        );
      }

      // Wait for all operations to complete
      const results = await Promise.all(promises);

      // All operations should succeed
      results.forEach(response => {
        assert.strictEqual(response.status, 200);
      });

      // Verify each tenant has correct number of users
      const users1Response = await request(app)
        .get('/api/test/users')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .expect(200);

      const users2Response = await request(app)
        .get('/api/test/users')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(200);

      assert.strictEqual(users1Response.body.users.length, 5);
      assert.strictEqual(users2Response.body.users.length, 5);
    });
  });

  describe('Error Handling and Security', () => {
    it('should handle invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/test/current-tenant')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      assert(response.body.message.includes('Authentication required'));
    });

    it('should handle missing JWT tokens', async () => {
      const response = await request(app)
        .get('/api/test/current-tenant')
        .expect(401);

      assert(response.body.message.includes('Authentication required'));
    });

    it('should handle database connection errors gracefully', async () => {
      // Create a new tenant and then manually close its database
      const tempTenantId = 'temp-error-tenant';
      await tenantManager.createTenantDatabase(tempTenantId, 'Temp Tenant', 'temp@test.com', 'password');
      
      const tempToken = jwt.sign(
        { id: tempTenantId, role: 'superadmin', email: 'temp@test.com' },
        process.env.JWT_SECRET
      );

      // Get connection and close it manually
      const tempDb = await tenantManager.getTenantConnection(tempTenantId);
      await new Promise((resolve) => tempDb.close(resolve));

      // Try to make a request with the closed connection
      const response = await request(app)
        .post('/api/test/create-user')
        .set('Authorization', `Bearer ${tempToken}`)
        .send({
          name: 'Test User',
          email: 'test@temp.com',
          role: 'student'
        });

      // Should handle the error gracefully
      assert(response.status >= 500);
    });

    it('should prevent SQL injection attempts', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/test/create-user')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send({
          name: maliciousInput,
          email: 'malicious@test.com',
          role: 'student'
        });

      // Request should either succeed (input sanitized) or fail gracefully
      // But should not crash the application
      assert([200, 500].includes(response.status));

      // Verify table still exists
      const usersResponse = await request(app)
        .get('/api/test/users')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .expect(200);

      // If request succeeded, check that malicious input was handled
      if (response.status === 200) {
        assert(Array.isArray(usersResponse.body.users));
      }
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple simultaneous tenant connections', async () => {
      const promises = [];
      const tenantCount = 10;

      // Create multiple tenants
      for (let i = 0; i < tenantCount; i++) {
        const tenantId = `perf-tenant-${i}`;
        await tenantManager.createTenantDatabase(tenantId, `Perf Tenant ${i}`, `perf${i}@test.com`, 'password');
        
        const token = jwt.sign(
          { id: tenantId, role: 'superadmin', email: `perf${i}@test.com` },
          process.env.JWT_SECRET
        );

        promises.push(
          request(app)
            .get('/api/test/current-tenant')
            .set('Authorization', `Bearer ${token}`)
        );
      }

      // Execute all requests simultaneously
      const results = await Promise.all(promises);

      // All requests should succeed
      results.forEach((response, index) => {
        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.tenant.superadminId, `perf-tenant-${index}`);
      });

      // Verify connection pool statistics
      const stats = tenantManager.getStats();
      assert(stats.activeConnections >= tenantCount);
      assert(stats.activeConnections <= tenantManager.config.maxConnections);
    });

    it('should reuse connections efficiently', async () => {
      // Make multiple requests to same tenant
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .get('/api/test/current-tenant')
            .set('Authorization', `Bearer ${tenant1Token}`)
        );
      }

      await Promise.all(promises);

      // Should only have one connection in pool (reused)
      const stats = tenantManager.getStats();
      const tenant1Connections = stats.tenants.filter(t => t.superadminId === tenant1Id);
      assert.strictEqual(tenant1Connections.length, 1);
    });
  });
});
