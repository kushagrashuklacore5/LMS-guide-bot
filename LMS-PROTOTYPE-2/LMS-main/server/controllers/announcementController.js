const db = require("../config/sqlite-db");
const BilingualDataService = require("../services/BilingualDataService");

/* ======================================================
   CREATE ANNOUNCEMENT
====================================================== */
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, publishFor, courseId } = req.body;
    const userId = req.user.userId;
    const role = req.user.role;
    const universityId = req.user?.universityId || 1;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message required" });
    }

    // Build announcement payload
    let announcementData = {
      title,
      content: message,
      university_id: universityId,
      createdByUser: userId,
      createdByRole: role,
    };

    /* ================= ADMIN ================= */
    if (role === "admin") {
      if (!publishFor) {
        return res.status(400).json({ message: "publishFor is required" });
      }

      // Normalize publishFor - accept: 'students', 'mentors'/'faculty', 'both'/'all'
      const pf = String(publishFor).toLowerCase().trim();
      let normalized = pf;
      
      // Normalize to canonical values
      if (pf === "both" || pf === "all") normalized = "both";
      else if (pf === "faculty" || pf === "teacher" || pf === "teachers" || pf === "mentor" || pf === "mentors") normalized = "mentors";
      else if (pf === "student" || pf === "students") normalized = "students";
      else {
        return res.status(400).json({ 
          message: "publishFor must be 'students', 'mentors', or 'both'" 
        });
      }

      announcementData.publishFor = normalized;
    }

    /* ================= MENTOR ================= */
    if (role === "mentor") {
      if (!courseId) {
        return res.status(400).json({ message: "courseId is required" });
      }
      announcementData.courseId = courseId;
    }

    // Insert announcement into central announcements table.
    // Detect which column exists and insert accordingly to avoid failures.
    db.all("PRAGMA table_info(announcements)", (prErr, cols) => {
      if (prErr) {
        console.error("Error inspecting announcements schema:", prErr);
        return res.status(500).json({ message: "Error creating announcement" });
      }

      const colNames = (cols || []).map(c => c.name.toLowerCase());
      const hasContent = colNames.includes('content');
      const hasMessage = colNames.includes('message');
      const hasReadBy = colNames.includes('readby');
      // Build insert SQL and params based on available columns
      const columns = ['title'];
      const values = [announcementData.title];

      // Choose content vs message
      if (hasContent) {
        columns.push('content');
        values.push(announcementData.content);
      } else if (hasMessage) {
        columns.push('message');
        values.push(announcementData.content || announcementData.message);
      } else {
        columns.push('content');
        values.push(announcementData.content);
      }

      // For admin, publishFor must be set; for mentor it's null (course-specific)
      if (announcementData.publishFor) {
        columns.push('publishFor');
        values.push(announcementData.publishFor);
      } else if (role === "admin") {
        // Admin must have publishFor
        columns.push('publishFor');
        values.push('students');  // Default to students if somehow missing
      } else if (role === "mentor") {
        // Mentor announcements are course-specific, not role-based
        columns.push('publishFor');
        values.push(null);  // NULL for course-specific announcements
      }

      columns.push('courseId');
      values.push(announcementData.courseId || null);

      columns.push('createdByUser');
      values.push(announcementData.createdByUser);

      columns.push('createdByRole');
      values.push(announcementData.createdByRole);

      columns.push('university_id');
      values.push(announcementData.university_id);

      if (hasReadBy) {
        columns.push('readBy');
        values.push(JSON.stringify([]));
      }

      const placeholders = columns.map(() => '?').join(', ');
      const insertSQL = `INSERT INTO announcements (${columns.join(', ')}) VALUES (${placeholders})`;

      db.run(insertSQL, values, function(err) {
        if (err) {
          console.error("Error creating announcement:", err);
          return res.status(500).json({ message: "Error creating announcement" });
        }

        const newAnnouncement = {
          id: this.lastID,
          title: announcementData.title,
          content: announcementData.content || announcementData.message,
          publishFor: announcementData.publishFor || null,
          courseId: announcementData.courseId || null,
          createdByUser: userId,
          createdByRole: role,
          readBy: hasReadBy ? JSON.stringify([]) : undefined,
          createdAt: new Date().toISOString(),
        };

        console.log(`📢 Announcement created:`, newAnnouncement);

        // EMIT SOCKET.IO EVENT FOR REAL-TIME NOTIFICATION
        if (req.io) {
          if (role === "admin" && announcementData.publishFor) {
            const targetAudience = announcementData.publishFor;
            console.log(`📢 Broadcasting announcement to: ${targetAudience}`);
            console.log(`📢 Socket.io connected clients count: ${req.io.engine.clientsCount}`);

            const emitPayload = {
              type: "announcement",
              data: newAnnouncement,
              timestamp: new Date().toISOString(),
            };

            // Emit to specific audience channel
            if (targetAudience === 'students') {
              console.log(`  → Emitting to: announcement:students`);
              req.io.emit('announcement:students', emitPayload);
              req.io.emit('announcement:student', emitPayload); // legacy
            } else if (targetAudience === 'mentors') {
              console.log(`  → Emitting to: announcement:mentors`);
              req.io.emit('announcement:mentors', emitPayload);
              req.io.emit('announcement:mentor', emitPayload); // legacy
              req.io.emit('announcement:faculty', emitPayload); // legacy
            } else if (targetAudience === 'both') {
              console.log(`  → Emitting to: announcement:both (students AND mentors)`);
              // Send to students
              req.io.emit('announcement:students', emitPayload);
              req.io.emit('announcement:student', emitPayload); // legacy
              // Send to mentors
              req.io.emit('announcement:mentors', emitPayload);
              req.io.emit('announcement:mentor', emitPayload); // legacy
              req.io.emit('announcement:faculty', emitPayload); // legacy
              // Send to both channel
              req.io.emit('announcement:both', emitPayload);
            }

            // Always emit general event for backward compatibility
            req.io.emit("new-announcement", newAnnouncement);
            console.log(`  → Emitted to: new-announcement`);

            console.log(`✅ Announcement successfully broadcasted to ${targetAudience}`);
          } else if (role === "mentor") {
            // Broadcast to specific course
            console.log(`📢 Mentor announcement to course ${announcementData.courseId}`);
            req.io.emit(`announcement:course:${announcementData.courseId}`, {
              type: "announcement",
              data: newAnnouncement,
              timestamp: new Date().toISOString()
            });
            console.log(`  → Emitted to: announcement:course:${announcementData.courseId}`);

            // Also emit general event
            req.io.emit("new-announcement", newAnnouncement);
            console.log(`  → Emitted to: new-announcement`);
            console.log(`✅ Announcement successfully broadcasted to course ${announcementData.courseId}`);
          }
        } else {
          console.warn(`⚠️ req.io not available - socket events not emitted!`);
        }

        res.status(201).json({
          message: "Announcement created successfully",
          announcement: newAnnouncement,
        });
      });
    });
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET ALL ANNOUNCEMENTS
====================================================== */
const getAllAnnouncements = async (req, res) => {
  try {
    const role = req.user.role;
    const userId = req.user.userId;
    const universityId = req.user?.universityId || 1;

    let query = `
      SELECT a.*, u.name as createdByUserName
      FROM announcements a
      LEFT JOIN users u ON a.createdByUser = u.id
      WHERE a.university_id = ?
    `;

    // Filter based on role
    if (role === "student") {
      // Students see:
      // 1. Announcements published for 'students' or 'both'
      // 2. Announcements created by mentors for courses the student is enrolled in
      query += ` AND (
        a.publishFor IN ('students', 'both')
        OR (a.createdByRole = 'mentor' AND a.courseId IN (SELECT courseId FROM course_students WHERE studentId = ?))
      )`;
    } else if (role === "mentor" || role === "teacher" || role === "faculty") {
      // Mentors see:
      // 1. Announcements published for 'mentors' or 'both'
      // 2. Their own course announcements (where publishFor is NULL and courseId is set)
      query += ` AND (
        a.publishFor IN ('mentors', 'both')
        OR (a.courseId IN (SELECT id FROM courses WHERE mentorId = ?))
      )`;
    } else if (role === "admin") {
      // Admin can see all announcements from their university
      // query already filtered by university_id
    }

    query += ` ORDER BY a.createdAt DESC`;

    console.log(`📋 Fetching announcements for role: ${role}, userId: ${userId}, university: ${universityId}`);
    console.log(`   Query: ${query}`);

    // Prepare query params: universityId is always first, then userId for subqueries
    let params = [universityId];
    if (role === 'student') params.push(userId);
    else if (role === "mentor" || role === "teacher" || role === "faculty") params.push(userId);
    
    db.all(query, params, (err, announcements) => {
      if (err) {
        console.error("Error fetching announcements:", err);
        return res.status(500).json({ message: "Database error" });
      }

      // Ensure readBy field is properly parsed for each announcement
      const processedAnnouncements = (announcements || []).map(announcement => ({
        ...announcement,
        readBy: announcement.readBy || '[]' // Ensure readBy field exists
      }));

      // Format announcements according to language
      const language = req.language || 'en';
      const formatted = BilingualDataService.formatAnnouncements(processedAnnouncements, language);

      console.log(`📋 Retrieved ${formatted.length} announcements for ${role}`);
      res.json(formatted);
    });
  } catch (error) {
    console.error("GET ALL ANNOUNCEMENTS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   DELETE ANNOUNCEMENT
====================================================== */
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;
    const universityId = req.user?.universityId || 1;

    // Check if announcement exists and user has permission
    db.get("SELECT * FROM announcements WHERE id = ? AND university_id = ?", [id, universityId], (err, announcement) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      // Check permissions (admin can delete all, mentor can delete their own)
      if (role !== "admin" && announcement.createdByUser !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Delete announcement
      db.run("DELETE FROM announcements WHERE id = ? AND university_id = ?", [id, universityId], function(err) {
        if (err) {
          console.error("Error deleting announcement:", err);
          return res.status(500).json({ message: "Error deleting announcement" });
        }

        res.json({ message: "Announcement deleted successfully" });
      });
    });
  } catch (error) {
    console.error("DELETE ANNOUNCEMENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   MARK ANNOUNCEMENT AS READ
====================================================== */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    // Extract userId from req.user (handle both userId and id properties)
    const userId = req.user?.userId || req.user?.id;

    console.log(`📢 Mark as read: announcement ${id}, user ${userId}, req.user:`, req.user);

    if (!userId) {
      console.warn(`⚠️ No userId for announcement ${id}, skipping mark as read`);
      // Return success anyway - don't block the UI
      return res.status(200).json({ message: "OK - no userId to mark read" });
    }

    // Get current announcement
    db.get("SELECT * FROM announcements WHERE id = ?", [id], (err, announcement) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      // Parse existing readBy array
      let readBy = [];
      try {
        readBy = JSON.parse(announcement.readBy || '[]');
      } catch (e) {
        console.error("Error parsing readBy:", e);
        readBy = [];
      }

      // Ensure all items are strings for comparison
      readBy = readBy.map(String);
      const userIdStr = String(userId);

      // Add user to readBy if not already there
      if (!readBy.includes(userIdStr)) {
        readBy.push(userIdStr);
        console.log(`  ✅ Added user ${userIdStr} to readBy`);
      } else {
        console.log(`  ℹ️ User ${userIdStr} already in readBy`);
      }

      // Update announcement
      db.run(
        "UPDATE announcements SET readBy = ? WHERE id = ?",
        [JSON.stringify(readBy), id],
        function(err) {
          if (err) {
            console.error("Error updating announcement:", err);
            return res.status(500).json({ message: "Error updating announcement" });
          }

          console.log(`✅ Marked announcement ${id} as read for user ${userIdStr}`);
          res.json({ message: "Announcement marked as read" });
        }
      );
    });
  } catch (error) {
    console.error("MARK AS READ ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createAnnouncement,
  getAllAnnouncements,
  deleteAnnouncement,
  markAsRead,
};
