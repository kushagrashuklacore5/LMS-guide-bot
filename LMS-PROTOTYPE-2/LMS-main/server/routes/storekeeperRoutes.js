const express = require('express');
const router = express.Router();
const db = require('../config/sqlite-db');
const authMiddleware = require('../middleware/authMiddleware');
const { generateVendorPassword, hashPassword } = require('../utils/passwordUtils');

/**
 * GET /api/storekeeper/vendors
 * Get all vendors for the storekeeper's university
 */
router.get('/vendors', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;

    console.log('GET /vendors - Request received');
    console.log('User from auth middleware:', req.user);

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Storekeeper not authenticated' });
    }

    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        loadVendors(user.university_id);
      }
    );

    function loadVendors(universityId) {
      // Get vendors for this university
      db.all(
        'SELECT * FROM vendors WHERE university_id = ? ORDER BY name',
        [universityId],
        (err, vendors) => {
          if (err) {
            console.error('Get vendors error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch vendors' });
          }

          console.log('Vendors loaded:', vendors.length);
          res.status(200).json({ 
            success: true, 
            data: vendors || []
          });
        }
      );
    }
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/storekeeper/vendors
 * Add a new vendor
 */
router.post('/vendors', authMiddleware, (req, res) => {
  try {
    console.log('POST /vendors - Request received');
    console.log('Request body:', req.body);
    console.log('User from auth middleware:', req.user);
    
    const userId = req.user?.userId;
    const { name, email, phone, address, category } = req.body;

    console.log('Extracted data:', { userId, name, email, phone, address, category });

    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.log('❌ Validation failed: Vendor name is required');
      console.log('❌ Name check details:', {
        nameExists: !!name,
        nameValue: name,
        nameType: typeof name,
        nameLength: name ? name.length : 'N/A',
        nameTrimmed: name ? name.trim() : 'N/A',
        nameTrimmedLength: name ? name.trim().length : 'N/A',
        trimCheck: !name || typeof name !== 'string' || !name.trim()
      });
      return res.status(400).json({ success: false, message: 'Vendor name is required' });
    }

    if (!userId) {
      console.log('❌ Validation failed: Storekeeper not authenticated');
      return res.status(401).json({ success: false, message: 'Storekeeper not authenticated' });
    }

    console.log('✅ Basic validation passed');

    // Define the function outside the callback to fix scoping
    function proceedWithVendorCreation() {
      // Get user's university_id from database
      db.get(
        'SELECT university_id FROM users WHERE id = ?',
        [userId],
        (err, user) => {
          if (err) {
            console.error('Get user error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }

          console.log('User from database:', user);

          if (!user) {
            console.log('User not found');
            return res.status(404).json({ success: false, message: 'User not found' });
          }

          insertVendor(user.university_id);
        }
      );
    }

    function insertVendor(universityId) {
      // Generate a random password for the vendor
      const plainPassword = generateVendorPassword();
      const hashedPassword = hashPassword(plainPassword);
      
      console.log('Generated password for vendor:', plainPassword);

      // Find next available ID that's free in both tables
      findNextAvailableId((availableId) => {
        if (availableId === null) {
          console.error('Failed to find available ID');
          return res.status(500).json({ success: false, message: 'Failed to generate vendor ID' });
        }

        console.log('Using synchronized ID:', availableId);

        // Insert into vendors table with specific ID
        db.run(
          `INSERT INTO vendors (id, name, email, phone, address, category, rating, totalOrders, totalValue, university_id, password, createdAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [availableId, name, email || '', phone || '', address || '', category || '', 0, 0, 0, universityId, hashedPassword, new Date().toISOString()],
          function(err) {
            if (err) {
              console.error('Add vendor error:', err);
              return res.status(500).json({ success: false, message: 'Failed to add vendor' });
            }

            console.log('Vendor added successfully with synchronized ID:', availableId);
        
            // Create corresponding user account for vendor login with same ID
            const userEmail = email || `${name.toLowerCase().replace(/\s+/g, '_')}@vendor.com`;
            const userPassword = plainPassword;
            const hashedUserPassword = hashedPassword;
            
            db.run(
              `INSERT INTO users (id, name, email, password, role, isApproved, createdAt, updatedAt) 
               VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
              [availableId, name, userEmail, hashedUserPassword, 'vendor'],
              function(err) {
                if (err) {
                  console.error('Error creating vendor user account:', err);
                  // If user creation fails, we should roll back the vendor creation
                  db.run('DELETE FROM vendors WHERE id = ?', [availableId]);
                  return res.status(500).json({ success: false, message: 'Failed to create vendor user account' });
                }
                
                console.log('Vendor user account created with synchronized ID:', availableId);
                
                res.status(201).json({ 
                  success: true, 
                  message: 'Vendor added successfully',
                  data: { 
                    id: availableId, 
                    name, 
                    email: userEmail, 
                    phone, 
                    address, 
                    category,
                    generatedPassword: plainPassword // Return plain password for display
                  }
                });
              }
            );
          }
        );
      });
    }

    function findNextAvailableId(callback) {
      // Get the maximum ID from both tables
      db.all(`
        SELECT MAX(id) as max_vendor_id FROM vendors
        UNION ALL
        SELECT MAX(id) as max_vendor_id FROM users
      `, (err, results) => {
        if (err) {
          console.error('Error getting max IDs:', err);
          callback(null);
          return;
        }

        const maxVendorId = results[0]?.max_vendor_id || 0;
        const maxUserId = results[1]?.max_vendor_id || 0;
        const startId = Math.max(maxVendorId, maxUserId) + 1;

        console.log('Starting ID search from:', startId);

        // Find the first available ID in both tables
        checkIdAvailability(startId, callback);
      });
    }

    function checkIdAvailability(candidateId, callback) {
      // Check if ID exists in either table
      db.all(`
        SELECT id FROM vendors WHERE id = ?
        UNION ALL
        SELECT id FROM users WHERE id = ?
      `, [candidateId, candidateId], (err, results) => {
        if (err) {
          console.error('Error checking ID availability:', err);
          callback(null);
          return;
        }

        if (results.length === 0) {
          // ID is available in both tables
          callback(candidateId);
        } else {
          // ID is taken, try the next one
          console.log(`ID ${candidateId} is taken, trying next...`);
          checkIdAvailability(candidateId + 1, callback);
        }
      });
    }

    // Check email uniqueness if provided
    if (email && email.trim()) {
      console.log('🔍 Checking email uniqueness for:', email);
      
      db.get('SELECT id FROM vendors WHERE email = ?', [email], (err, existingVendor) => {
        if (err) {
          console.error('❌ Error checking email uniqueness:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        console.log('🔍 Email check result:', existingVendor);

        if (existingVendor) {
          console.log('❌ Validation failed: Email already exists');
          return res.status(400).json({ success: false, message: 'Email already exists. Please use a different email.' });
        }

        console.log('✅ Email uniqueness check passed');
        proceedWithVendorCreation();
      });
    } else {
      console.log('🔍 No email provided, proceeding with auto-generated email');
      proceedWithVendorCreation();
    }
  } catch (error) {
    console.error('Add vendor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/storekeeper/vendors/:id
 * Update an existing vendor
 */
router.put('/vendors/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, email, phone, address, category } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Vendor name is required' });
    }

    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update vendor
        db.run(
          `UPDATE vendors SET name = ?, email = ?, phone = ?, address = ?, category = ?
           WHERE id = ? AND university_id = ?`,
          [name, email || '', phone || '', address || '', category || '', id, user.university_id],
          function(err) {
            if (err) {
              console.error('Update vendor error:', err);
              return res.status(500).json({ success: false, message: 'Failed to update vendor' });
            }

            if (this.changes === 0) {
              return res.status(404).json({ success: false, message: 'Vendor not found' });
            }

            res.status(200).json({ 
              success: true, 
              message: 'Vendor updated successfully' 
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Update vendor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * DELETE /api/storekeeper/vendors/:id
 * Delete a vendor
 */
router.delete('/vendors/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    console.log('DELETE /vendors/:id - Request received');
    console.log('Request params:', { id });
    console.log('User from auth middleware:', req.user);

    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
          console.log('User not found');
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete vendor
        db.run(
          'DELETE FROM vendors WHERE id = ? AND university_id = ?',
          [parseInt(id), user.university_id],
          function(err) {
            if (err) {
              console.error('Delete vendor error:', err);
              return res.status(500).json({ success: false, message: 'Failed to delete vendor' });
            }

            if (this.changes === 0) {
              return res.status(404).json({ success: false, message: 'Vendor not found' });
            }

            console.log('Vendor deleted successfully with ID:', id);
            res.status(200).json({ 
              success: true, 
              message: 'Vendor deleted successfully'
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Delete vendor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/storekeeper/dashboard
 * Get storekeeper dashboard data for their university
 */
router.get('/dashboard', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    
    // TODO: Get user's university_id from users table
    // For demo purposes, we'll use mock data
    
    const mockData = {
      totalItems: 2450,
      lowStockItems: 45,
      totalVendors: 12,
      recentOrders: 28,
      universityName: 'Main University',
      universityId: 1,
      inventoryTrend: [
        { month: 'Jan', items: 1800 },
        { month: 'Feb', items: 1950 },
        { month: 'Mar', items: 2100 },
        { month: 'Apr', items: 2250 },
        { month: 'May', items: 2380 },
        { month: 'Jun', items: 2450 },
      ],
      stockByCategory: [
        { category: 'Books', stock: 450 },
        { category: 'Stationery', stock: 680 },
        { category: 'Equipment', stock: 520 },
        { category: 'Lab Supplies', stock: 380 },
        { category: 'Furniture', stock: 420 },
      ],
      vendorDistribution: [
        { name: 'Vendor A', value: 25, color: '#8b5cf6' },
        { name: 'Vendor B', value: 20, color: '#06b6d4' },
        { name: 'Vendor C', value: 22, color: '#f59e0b' },
        { name: 'Vendor D', value: 18, color: '#ef4444' },
        { name: 'Others', value: 15, color: '#6b7280' },
      ],
      orderStatus: [
        { name: 'Completed', value: 60, color: '#10b981' },
        { name: 'Pending', value: 28, color: '#f59e0b' },
        { name: 'Cancelled', value: 12, color: '#ef4444' },
      ],
    };

    res.status(200).json({ success: true, data: mockData });
  } catch (error) {
    console.error('Storekeeper dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data' });
  }
});

/**
 * GET /api/storekeeper/inventory
 * Get all inventory items for storekeeper's university
 */
router.get('/inventory', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    
    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Failed to get user info' });
        }
        
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get all inventory items for this university
        db.all(
          'SELECT * FROM inventory WHERE university_id = ? ORDER BY id DESC',
          [user.university_id],
          (err, items) => {
            if (err) {
              console.error('Get inventory error:', err);
              return res.status(500).json({ success: false, message: 'Failed to load inventory' });
            }

            res.status(200).json({ success: true, data: items });
          }
        );
      }
    );
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to load inventory' });
  }
});

/**
 * POST /api/storekeeper/inventory
 * Add new inventory item
 */
router.post('/inventory', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    const { name, category, stock, minStock, unitPrice, vendorName, description } = req.body;

    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Failed to get user info' });
        }
        
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Insert new inventory item
        db.run(
          `INSERT INTO inventory (name, category, stock, minStock, unitPrice, vendorName, description, purchaseDate, university_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [name, category, stock, minStock, unitPrice, vendorName, description, new Date().toISOString(), user.university_id],
          function(err) {
            if (err) {
              console.error('Add inventory error:', err);
              return res.status(500).json({ success: false, message: 'Failed to add inventory item' });
            }

            res.status(201).json({ 
              success: true, 
              message: 'Inventory item added successfully',
              data: { id: this.lastID, name, category, stock, minStock, unitPrice, vendorName, description }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Add inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to add inventory item' });
  }
});

/**
 * PUT /api/storekeeper/inventory/:id
 * Update inventory item
 */
router.put('/inventory/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, category, stock, minStock, unitPrice, vendorName, description } = req.body;

    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Failed to get user info' });
        }
        
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update inventory item
        db.run(
          `UPDATE inventory SET name = ?, category = ?, stock = ?, minStock = ?, unitPrice = ?, vendorName = ?, description = ?, purchaseDate = ?
           WHERE id = ? AND university_id = ?`,
          [name, category, stock, minStock, unitPrice, vendorName, description, new Date().toISOString(), id, user.university_id],
          function(err) {
            if (err) {
              console.error('Update inventory error:', err);
              return res.status(500).json({ success: false, message: 'Failed to update inventory item' });
            }

            if (this.changes === 0) {
              return res.status(404).json({ success: false, message: 'Inventory item not found' });
            }

            res.status(200).json({ 
              success: true, 
              message: 'Inventory item updated successfully' 
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to update inventory item' });
  }
});

/**
 * DELETE /api/storekeeper/inventory/:id
 * Delete inventory item
 */
router.delete('/inventory/:id', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Failed to get user info' });
        }
        
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete inventory item
        db.run(
          'DELETE FROM inventory WHERE id = ? AND university_id = ?',
          [id, user.university_id],
          function(err) {
            if (err) {
              console.error('Delete inventory error:', err);
              return res.status(500).json({ success: false, message: 'Failed to delete inventory item' });
            }

            if (this.changes === 0) {
              return res.status(404).json({ success: false, message: 'Inventory item not found' });
            }

            res.status(200).json({ 
              success: true, 
              message: 'Inventory item deleted successfully' 
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Delete inventory error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete inventory item' });
  }
});

/**
 * GET /api/storekeeper/orders
 * Get all orders for storekeeper's university
 */
router.get('/orders', authMiddleware, (req, res) => {
  try {
    // TODO: Get orders filtered by university_id
    const mockOrders = [
      { id: 1, vendor: 'Vendor A', item: 'Mathematics Textbook', qty: 100, status: 'Completed', date: '2026-01-10' },
      { id: 2, vendor: 'Vendor B', item: 'Stationery Supplies', qty: 500, status: 'Pending', date: '2026-01-15' },
      { id: 3, vendor: 'Vendor C', item: 'Lab Equipment', qty: 20, status: 'Completed', date: '2026-01-12' },
    ];

    res.status(200).json({ success: true, data: mockOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to load orders' });
  }
});

/**
 * GET /api/storekeeper/invoices
 * Get all invoices raised by vendors for the storekeeper's university
 */
router.get('/invoices', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;

    console.log('GET /invoices - Request received');
    console.log('User from auth middleware:', req.user);

    // For demo purposes, use default university_id = 1 if no user is authenticated
    if (userId) {
      // Get user's university_id
      db.get(
        'SELECT university_id FROM users WHERE id = ?',
        [userId],
        (err, user) => {
          if (err) {
            console.error('Get user error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }

          if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
          }

          loadInvoices(user.university_id);
        }
      );
    } else {
      // Use default university_id for demo
      console.log('No authenticated user, using default university_id = 1');
      loadInvoices(1);
    }

    function loadInvoices(universityId) {
      // Get invoices for this university, ordered by most recent
      db.all(
        'SELECT * FROM invoices WHERE university_id = ? ORDER BY issueDate DESC',
        [universityId],
        (err, invoices) => {
          if (err) {
            console.error('Get invoices error:', err);
            return res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
          }

          console.log('Invoices loaded:', invoices.length);
          
          // Parse items JSON for each invoice
          const processedInvoices = (invoices || []).map(invoice => ({
            ...invoice,
            items: invoice.items ? JSON.parse(invoice.items) : []
          }));

          res.status(200).json({ 
            success: true, 
            data: processedInvoices
          });
        }
      );
    }
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/storekeeper/vendor/:id/categories
 * Get categories for a specific vendor
 */
router.get('/vendor/:id/categories', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Storekeeper not authenticated' });
    }

    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        const universityId = user.university_id;

        // Get unique categories for this vendor
        db.all(
          'SELECT DISTINCT category FROM vendor_stock WHERE vendor_id = ? AND university_id = ? AND category IS NOT NULL ORDER BY category',
          [id, universityId],
          (err, categories) => {
            if (err) {
              console.error('Get vendor categories error:', err);
              return res.status(500).json({ success: false, message: 'Failed to fetch vendor categories' });
            }

            const categoryList = categories.map(row => row.category);
            res.status(200).json({
              success: true,
              data: categoryList
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Get vendor categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/storekeeper/vendor/:id/stock
 * Get specific vendor's stock for browsing
 */
router.get('/vendor/:id/stock', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Storekeeper not authenticated' });
    }

    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        const universityId = user.university_id;

        // Get vendor's stock items
        db.all(
          'SELECT * FROM vendor_stock WHERE vendor_id = ? AND university_id = ? ORDER BY name',
          [id, universityId],
          (err, stockItems) => {
            if (err) {
              console.error('Get vendor stock error:', err);
              return res.status(500).json({ success: false, message: 'Failed to fetch vendor stock' });
            }

            res.status(200).json({
              success: true,
              data: stockItems || []
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Vendor stock browsing error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/storekeeper/direct-stock-request
 * Create direct stock request from vendor stock browsing
 */
router.post('/direct-stock-request', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    const { vendorId, itemName, category, quantity, unitPrice, urgencyLevel, description } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Storekeeper not authenticated' });
    }

    if (!vendorId || !itemName || !category || !quantity || !unitPrice || !urgencyLevel) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        const universityId = user.university_id;

        // Create stock request from vendor stock browsing
        db.run(
          `INSERT INTO stock_requests (storekeeper_id, vendor_id, university_id, item_name, category, quantity_requested, unit_price, urgency_level, description, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
          [userId, vendorId, universityId, itemName, category, quantity, unitPrice, urgencyLevel, description || ''],
          function(err) {
            if (err) {
              console.error('Create direct stock request error:', err);
              return res.status(500).json({ success: false, message: 'Failed to create stock request' });
            }

            console.log('Direct stock request created successfully:', { itemName });
            res.status(201).json({
              success: true,
              message: 'Stock request sent successfully',
              data: { itemName, status: 'pending' }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Direct stock request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/storekeeper/stock-requests/status
 * Get status updates for stock requests created by this storekeeper
 */
router.get('/stock-requests/status', authMiddleware, (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Storekeeper not authenticated' });
    }

    // Get user's university_id
    db.get(
      'SELECT university_id FROM users WHERE id = ?',
      [userId],
      (err, user) => {
        if (err) {
          console.error('Get user error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get stock requests with their status and vendor info
        const query = `
          SELECT DISTINCT 
            sr.id,
            sr.title,
            sr.status,
            sr.created_at,
            v.name as vendor_name,
            COUNT(sri.id) as items_count
          FROM stock_requests sr
          LEFT JOIN stock_request_items sri ON sr.id = sri.request_id
          LEFT JOIN vendors v ON sri.vendor_id = v.id
          WHERE sr.storekeeper_id = ? AND sr.university_id = ?
          GROUP BY sr.id, sr.title, sr.status, sr.created_at, v.name
          ORDER BY sr.created_at DESC
          LIMIT 10
        `;

        db.all(query, [userId, user.university_id], (err, requests) => {
          if (err) {
            console.error('Get request status error:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }

          console.log('📊 Stock requests status for storekeeper:', requests.length);
          
          res.status(200).json({
            success: true,
            data: requests || []
          });
        });
      }
    );
  } catch (error) {
    console.error('Get request status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
