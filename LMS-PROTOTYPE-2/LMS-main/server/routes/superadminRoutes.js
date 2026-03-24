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

const router = express.Router();

// Superadmin login
router.post("/login", (req, res) => {
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

module.exports = router;
