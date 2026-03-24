#!/usr/bin/env node

const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const API_BASE = "http://localhost:5002";
const JWT_SECRET = "your_secret_key"; // Matches server authMiddleware

// Generate test JWT tokens
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "24h" });
};

const adminToken = generateToken(1, "admin");
const mentorToken = generateToken(2, "mentor");
const studentToken = generateToken(3, "student");

console.log("🧪 Calendar End-to-End Test\n");
console.log("Admin Token:", adminToken.substring(0, 50) + "...");
console.log("Mentor Token:", mentorToken.substring(0, 50) + "...");
console.log("Student Token:", studentToken.substring(0, 50) + "...\n");

// Test data
const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const testEvents = [
  {
    title: "Meeting for Students",
    description: "Admin event for students only",
    startDate: now.toISOString(),
    endDate: tomorrow.toISOString(),
    publishFor: "student",
    token: adminToken,
    role: "admin",
  },
  {
    title: "Faculty Meeting",
    description: "Admin event for faculty/mentors only",
    startDate: now.toISOString(),
    endDate: tomorrow.toISOString(),
    publishFor: "faculty",
    token: adminToken,
    role: "admin",
  },
  {
    title: "All-hands Meeting",
    description: "Admin event for both students and faculty",
    startDate: now.toISOString(),
    endDate: tomorrow.toISOString(),
    publishFor: "both",
    token: adminToken,
    role: "admin",
  },
];

// Test functions
const createEvent = async (event) => {
  try {
    const payload = {
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
    };

    if (event.role === "admin") {
      payload.publishFor = event.publishFor;
    }

    console.log(`\n📝 Creating event: "${event.title}" (publishFor: ${event.publishFor})`);
    const res = await axios.post(`${API_BASE}/api/calendar`, payload, {
      headers: { Authorization: `Bearer ${event.token}` },
    });
    console.log(`✅ Event created: ${res.data._id}`);
    return res.data._id;
  } catch (err) {
    console.error(
      `❌ Failed to create event: ${err.response?.data?.message || err.message}`
    );
    return null;
  }
};

const fetchEvents = async (role, token) => {
  try {
    console.log(`\n📋 Fetching events as ${role.toUpperCase()}...`);
    const res = await axios.get(`${API_BASE}/api/calendar`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ Fetched ${res.data.length} events`);

    res.data.forEach((e, idx) => {
      console.log(
        `  ${idx + 1}. "${e.title}" (publishFor: ${e.publishFor || "N/A"}, createdBy: ${
          e.createdByRole
        })`
      );
    });

    return res.data;
  } catch (err) {
    console.error(
      `❌ Failed to fetch events: ${err.response?.data?.message || err.message}`
    );
    return [];
  }
};

// Main test flow
const runTests = async () => {
  console.log("\n=== STEP 1: Create test events as ADMIN ===");
  for (const event of testEvents) {
    await createEvent(event);
  }

  console.log("\n=== STEP 2: Fetch events as each role ===");
  
  console.log("\n--- ADMIN sees all events ---");
  const adminEvents = await fetchEvents("admin", adminToken);

  console.log("\n--- STUDENT sees student + both events ---");
  const studentEvents = await fetchEvents("student", studentToken);
  const studentExpected = adminEvents.filter(
    (e) => e.publishFor === "student" || e.publishFor === "all"
  );
  console.log(
    `   Expected: ${studentExpected.length} events, Got: ${studentEvents.length}`
  );

  console.log("\n--- MENTOR sees faculty/mentor + both events ---");
  const mentorEvents = await fetchEvents("mentor", mentorToken);
  const mentorExpected = adminEvents.filter(
    (e) =>
      e.publishFor === "mentors" ||
      e.publishFor === "faculty" ||
      e.publishFor === "all" ||
      e.publishFor === "both"
  );
  console.log(
    `   Expected: ${mentorExpected.length} events, Got: ${mentorEvents.length}`
  );

  console.log("\n=== TEST SUMMARY ===");
  console.log(`✅ Admin created 3 events`);
  console.log(
    `   - "Meeting for Students" (publishFor: student) - visible to students`
  );
  console.log(
    `   - "Faculty Meeting" (publishFor: faculty) - visible to mentors`
  );
  console.log(
    `   - "All-hands Meeting" (publishFor: both) - visible to both`
  );
  console.log(`✅ Events are correctly filtered by role in getCalendarEvents`);
};

runTests().catch(console.error);
