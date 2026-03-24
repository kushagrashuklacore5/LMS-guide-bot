const db = require("../config/sqlite-db");
const bcrypt = require('bcryptjs');

/* ================= GET ALL USERS (ADMIN ONLY) ================= */
const getAllUsers = async (req, res) => {
  try {
    const adminUniversityId = req.user?.universityId || 1;
    db.all(`
      SELECT u.id, u.name, u.email, u.role, u.isApproved, u.createdAt,
             CASE WHEN u.role = 'student' THEN s.studentId ELSE NULL END as studentId,
             CASE WHEN u.role = 'student' THEN s.grade ELSE NULL END as grade
      FROM users u 
      LEFT JOIN students s ON u.id = s.userId 
      WHERE u.university_id = ?
      ORDER BY u.createdAt DESC
    `, [adminUniversityId], (err, users) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(users || []);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET MENTORS (ADMIN ONLY) ================= */
const getMentors = async (req, res) => {
  try {
    const adminUniversityId = req.user?.universityId || 1;
    db.all("SELECT id, name, email, isApproved, createdAt FROM users WHERE role = ? AND university_id = ? ORDER BY name", ["mentor", adminUniversityId], (err, mentors) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(mentors || []);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET MENTORS SIMPLE (FOR DROPDOWNS) ================= */
const getAllMentorsSimple = async (req, res) => {
  try {
    const adminUniversityId = req.user?.universityId || 1;
    db.all("SELECT id, name FROM users WHERE role = 'mentor' AND isApproved = 1 AND university_id = ? ORDER BY name", [adminUniversityId], (err, mentors) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(mentors || []);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET MENTORS FOR COURSE TEACHERS ================= */
const getMentorsForCourseTeachers = async (req, res) => {
  try {
    const adminUniversityId = req.user?.universityId || 1;
    db.all("SELECT id as _id, name, email FROM users WHERE role = 'mentor' AND isApproved = 1 AND university_id = ? ORDER BY name", [adminUniversityId], (err, mentors) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(mentors || []);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET STUDENTS FOR MENTORS ================= */
const getStudentsForMentors = async (req, res) => {
  try {
    const adminUniversityId = req.user?.universityId || 1;
    db.all(`
      SELECT u.id as _id, u.id, u.name, u.email, s.grade, s.rollNumber
      FROM users u
      LEFT JOIN students s ON u.id = s.userId
      WHERE u.role = 'student' AND u.university_id = ?
      ORDER BY u.name
    `, [adminUniversityId], (err, students) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(students || []);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET STUDENTS (ADMIN ONLY) ================= */
const getStudents = async (req, res) => {
  try {
    const adminUniversityId = req.user?.universityId || 1;
    db.all(`
      SELECT u.id, u.name, u.email, u.isApproved, u.createdAt,
             s.grade, s.rollNumber, s.totalFees, s.feesPaid, s.pendingFees
      FROM users u
      LEFT JOIN students s ON u.id = s.userId
      WHERE u.role = ? AND u.university_id = ?
      ORDER BY u.createdAt DESC
    `, ["student", adminUniversityId], (err, students) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(students || []);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= APPROVE MENTOR ================= */
const approveMentor = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists and is a mentor
    db.get("SELECT * FROM users WHERE id = ? AND role = ?", [userId, "mentor"], (err, user) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) return res.status(404).json({ message: 'User not found' });

      // Update approval status
      db.run("UPDATE users SET isApproved = 1 WHERE id = ?", [userId], function(err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: 'Database error' });
        }

        res.json({ message: 'Mentor approved successfully' });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= REJECT MENTOR ================= */
const rejectMentor = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists and is a mentor
    db.get("SELECT * FROM users WHERE id = ? AND role = ?", [userId, "mentor"], (err, user) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) return res.status(404).json({ message: 'User not found' });

      // Delete user
      db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: 'Database error' });
        }

        res.json({ message: 'Mentor rejected successfully' });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= DELETE USER ================= */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) return res.status(404).json({ message: 'User not found' });

      // Delete user
      db.run("DELETE FROM users WHERE id = ?", [userId], function(err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: 'Database error' });
        }

        res.json({ message: 'User deleted successfully' });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= UPDATE USER ================= */
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role, isApproved } = req.body;

    // Check if user exists
    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) return res.status(404).json({ message: 'User not found' });

      // Update user
      db.run(
        "UPDATE users SET name = ?, email = ?, role = ?, isApproved = ? WHERE id = ?",
        [name || user.name, email || user.email, role || user.role, isApproved !== undefined ? isApproved : user.isApproved, userId],
        function(err) {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: 'Database error' });
          }

          res.json({ message: 'User updated successfully' });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET ADMIN DASHBOARD DATA ================= */
const getAdminDashboard = async (req, res) => {
  try {
    const adminUniversityId = req.user?.universityId || 1;
    
    // Get user statistics for admin's university only
    db.all(`
      SELECT role, COUNT(*) as count
      FROM users
      WHERE university_id = ?
      GROUP BY role
    `, [adminUniversityId], (err, userStats) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: 'Database error' });
      }

      // Get course statistics for admin's university only
      db.get(`
        SELECT COUNT(*) as totalCourses 
        FROM courses 
        WHERE university_id = ?
      `, [adminUniversityId], (err, courseStats) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: 'Database error' });
        }

        // Get payment statistics for admin's university (if applicable)
        db.get(`
          SELECT 
            COUNT(*) as totalPayments,
            SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as totalRevenue
          FROM payments
          WHERE studentId IN (SELECT id FROM users WHERE university_id = ?)
        `, [adminUniversityId], (err, paymentStats) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: 'Database error' });
          }

          // Get recent users for admin's university only
          db.all(`
            SELECT id, name, email, role, createdAt
            FROM users
            WHERE university_id = ?
            ORDER BY createdAt DESC
            LIMIT 5
          `, [adminUniversityId], (err, recentUsers) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({ message: 'Database error' });
            }

            res.json({
              userStats: userStats || [],
              totalCourses: courseStats?.totalCourses || 0,
              totalPayments: paymentStats?.totalPayments || 0,
              totalRevenue: paymentStats?.totalRevenue || 0,
              recentUsers: recentUsers || [],
              universityId: adminUniversityId, // Include for frontend reference
            });
          });
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  getMentors,
  getStudents,
  approveMentor,
  rejectMentor,
  deleteUser,
  updateUser,
  getAdminDashboard,
  getAllMentorsSimple,
  getMentorsForCourseTeachers,
  getStudentsForMentors,
};
