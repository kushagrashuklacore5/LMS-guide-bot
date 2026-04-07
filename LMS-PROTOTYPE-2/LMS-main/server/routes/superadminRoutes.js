const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/sqlite-db");
const { 
  createUniversityWithAdmin,
  createUser,
  getAllUniversities,
  getAllUsers,
  deleteUniversity
} = require("../controllers/superAdminController");
const authMiddleware = require("../middleware/authMiddleware");
const { checkSchoolsQuota } = require("../middleware/quotaMiddleware");
const { rateLimiters } = require("../middleware/rateLimiter");

const router = express.Router();

// Superadmin login with rate limiting (50 requests per minute)
router.post("/login", rateLimiters.login, (req, res) => {
  try {
    const { email, password } = req.body;

    // For demo, check against hardcoded superadmin credentials
    // In production, you'd have a superadmins table
    if (email === "superadmin@lms.com" && password === "admin123") {
      const token = jwt.sign(
        { 
          userId: "superadmin-1", 
          role: "superadmin", 
          email: email 
        },
        process.env.JWT_SECRET || "default_jwt_secret_key",
        { expiresIn: "24h" }
      );

      return res.json({
        success: true,
        token,
        superadmin: {
          id: "superadmin-1",
          email: email,
          name: "Super Admin"
        }
      });
    }

    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    console.error("Superadmin login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all clients (superadmin credentials)
router.get("/clients", authMiddleware, (req, res) => {
  try {
    // Only allow superadmin role
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // For demo, return hardcoded clients
    // In production, you'd query a superadmin_clients table
    const clients = [
      {
        id: 1,
        name: "Demo University",
        email: "admin@demo.com",
        password: "demo123",
        created_at: new Date().toISOString()
      }
    ];

    res.json({ success: true, clients });
  } catch (error) {
    console.error("Get clients error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create new client credentials
router.post("/create-client", authMiddleware, (req, res) => {
  try {
    // Only allow superadmin role
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { name, email, password } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // For demo, just return success
    // In production, you'd save to database
    console.log("Creating client:", { name, email, password });

    res.json({
      success: true,
      message: "Client credentials created successfully",
      client: {
        id: Date.now(),
        name,
        email,
        password,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Create client error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create university with admin
router.post(
  "/create-university",
  authMiddleware,
  checkSchoolsQuota,
  createUniversityWithAdmin
);

// Create any user (admin, teacher, accountant, storekeeper, etc.)
router.post(
  "/create-user",
  authMiddleware,
  createUser
);

// Get all universities
router.get(
  "/universities",
  authMiddleware,
  getAllUniversities
);

// Get all users
router.get(
  "/users",
  authMiddleware,
  getAllUsers
);

// Delete university
router.delete(
  "/universities/:id",
  authMiddleware,
  deleteUniversity
);

// ===== INTERNAL ADMIN PORTAL ROUTES =====

// Test endpoint
router.get("/internal/test", (req, res) => {
  console.log("🧪 Test endpoint called");
  res.json({ success: true, message: "Internal portal API is working!" });
});

// Get all superadmins for internal portal
router.get("/internal/superadmins", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 Internal superadmin API called");
    console.log("👤 User from auth middleware:", req.user);
    
    // Only allow portal@core5.co.in (with role portal_admin or superadmin)
    if (!req.user || req.user.email !== "portal@core5.co.in") {
      console.log("❌ Access denied for user:", req.user?.email);
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    console.log("✅ Access granted to portal@core5.co.in");

    const query = `
      SELECT id, email, role, created_at, expires_at, status
      FROM users 
      WHERE role = 'superadmin' 
      ORDER BY created_at DESC
    `;
    
    console.log("📝 Executing query:", query);
    
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("❌ Error fetching superadmins:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }
      
      console.log(`📊 Found ${rows.length} superadmins in database`);
      
      // Add plain password for display (in production, you might not want to show this)
      const superadmins = rows.map(row => ({
        ...row,
        plainPassword: "••••••••", // Hidden for security
        serverTime: new Date().toISOString() // Add server timestamp
      }));
      
      console.log("📤 Sending response:", { success: true, data: superadmins });
      res.json({ success: true, data: superadmins });
    });
  } catch (error) {
    console.error("❌ Internal server error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create new superadmin with auto-generated password
router.post("/internal/create-superadmin", authMiddleware, async (req, res) => {
  try {
    // Only allow portal@core5.co.in (with role portal_admin or superadmin)
    if (!req.user || req.user.email !== "portal@core5.co.in") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { email, subscriptionDuration, durationType } = req.body;

    // Validate inputs
    if (!email || !subscriptionDuration || !durationType) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if email already exists
    const checkQuery = "SELECT id FROM users WHERE email = ?";
    db.get(checkQuery, [email], async (err, existingUser) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }

      // Generate secure random password
      const generatedPassword = generateSecurePassword();
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      // Calculate expiry date
      const now = new Date();
      const expiresAt = new Date(now);
      
      if (durationType === 'months') {
        expiresAt.setMonth(expiresAt.getMonth() + subscriptionDuration);
      } else {
        expiresAt.setDate(expiresAt.getDate() + subscriptionDuration);
      }

      // Insert new superadmin
      const insertQuery = `
        INSERT INTO users (email, password, role, created_at, expires_at, status)
        VALUES (?, ?, 'superadmin', ?, ?, 'active')
      `;
      
      const values = [
        email,
        hashedPassword,
        now.toISOString(),
        expiresAt.toISOString()
      ];

      db.run(insertQuery, values, function(err) {
        if (err) {
          console.error("Error creating superadmin:", err);
          return res.status(500).json({ success: false, message: "Database error" });
        }

        const newSuperadmin = {
          id: this.lastID,
          email,
          role: 'superadmin',
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          status: 'active',
          generatedPassword
        };

        res.json({
          success: true,
          message: "Superadmin created successfully",
          data: newSuperadmin
        });
      });
    });
  } catch (error) {
    console.error("Create superadmin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Reset superadmin password
router.post("/internal/reset-password", authMiddleware, async (req, res) => {
  try {
    // Only allow portal@core5.co.in (with role portal_admin or superadmin)
    if (!req.user || req.user.email !== "portal@core5.co.in") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { superadminId } = req.body;

    if (!superadminId) {
      return res.status(400).json({ success: false, message: "Superadmin ID is required" });
    }

    // Generate new password
    const newPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updateQuery = "UPDATE users SET password = ? WHERE id = ? AND role = 'superadmin'";
    
    db.run(updateQuery, [hashedPassword, superadminId], function(err) {
      if (err) {
        console.error("Error resetting password:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: "Superadmin not found" });
      }

      res.json({
        success: true,
        message: "Password reset successfully",
        newPassword
      });
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Disable superadmin user
router.post("/internal/disable-user", authMiddleware, async (req, res) => {
  try {
    // Only allow portal@core5.co.in (with role portal_admin or superadmin)
    if (!req.user || req.user.email !== "portal@core5.co.in") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { superadminId } = req.body;

    if (!superadminId) {
      return res.status(400).json({ success: false, message: "Superadmin ID is required" });
    }

    // Update user status to disabled
    const updateQuery = "UPDATE users SET status = 'disabled' WHERE id = ? AND role = 'superadmin'";
    
    db.run(updateQuery, [superadminId], function(err) {
      if (err) {
        console.error("Error disabling user:", err);
        return res.status(500).json({ success: false, message: "Database error" });
      }

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: "Superadmin not found" });
      }

      res.json({
        success: true,
        message: "User disabled successfully"
      });
    });
  } catch (error) {
    console.error("Disable user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Helper function to generate secure password
function generateSecurePassword() {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

module.exports = router;
