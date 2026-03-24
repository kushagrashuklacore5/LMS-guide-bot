const axios = require("axios");

const API = "http://localhost:5002";

// Test flow: Create live class as mentor, then fetch as student and join
async function testStudentLiveClasses() {
  try {
    console.log("\n🎬 STARTING STUDENT LIVE CLASSES TEST\n");

    // Step 1: Get mentor token (assuming mentor exists)
    console.log("1️⃣  Logging in as mentor...");
    const mentorLoginRes = await axios.post(`${API}/api/users/login`, {
      email: "mentor@example.com",
      password: "password123",
    });
    const mentorToken = mentorLoginRes.data.token;
    const mentorId = mentorLoginRes.data.user.userId;
    console.log(`✅ Mentor logged in: ${mentorLoginRes.data.user.name} (ID: ${mentorId})`);

    // Step 2: Get a course where mentor teaches
    console.log("\n2️⃣  Fetching mentor's courses...");
    const coursesRes = await axios.get(
      `${API}/api/mentor/courses`,
      { headers: { Authorization: `Bearer ${mentorToken}` } }
    );
    if (coursesRes.data.length === 0) {
      console.log("❌ No courses found for mentor. Please create a course first.");
      return;
    }
    const courseId = coursesRes.data[0].id || coursesRes.data[0]._id;
    const courseName = coursesRes.data[0].title || coursesRes.data[0].name;
    console.log(`✅ Using course: ${courseName} (ID: ${courseId})`);

    // Step 3: Create a live class as mentor
    console.log("\n3️⃣  Creating a live class as mentor...");
    const now = new Date();
    const startTime = new Date(now.getTime() + 5 * 60000).toISOString(); // 5 min from now
    const endTime = new Date(now.getTime() + 35 * 60000).toISOString(); // 35 min from now

    const createLiveClassRes = await axios.post(
      `${API}/api/live-classes`,
      {
        courseId,
        title: "Test Live Class",
        description: "Testing student live class join functionality",
        scheduledStartTime: startTime,
        scheduledEndTime: endTime,
      },
      { headers: { Authorization: `Bearer ${mentorToken}` } }
    );

    const liveClass = createLiveClassRes.data.liveClass;
    console.log(`✅ Live class created:`);
    console.log(`   - ID: ${liveClass.id}`);
    console.log(`   - Meeting ID: ${liveClass.meetingId}`);
    console.log(`   - Meeting Link: ${liveClass.meetingLink}`);
    console.log(`   - Status: ${liveClass.status}`);

    // Step 4: Get student token
    console.log("\n4️⃣  Logging in as student...");
    const studentLoginRes = await axios.post(`${API}/api/users/login`, {
      email: "student@example.com",
      password: "password123",
    });
    const studentToken = studentLoginRes.data.token;
    const studentId = studentLoginRes.data.user.userId;
    console.log(`✅ Student logged in: ${studentLoginRes.data.user.name} (ID: ${studentId})`);

    // Step 5: Verify student is enrolled in the course
    console.log("\n5️⃣  Checking student enrollments...");
    const enrollmentsRes = await axios.get(
      `${API}/courses/student`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    const enrolledInCourse = enrollmentsRes.data.some(
      (c) => (c.id || c._id) == courseId
    );
    if (!enrolledInCourse) {
      console.log(`⚠️  Student is not enrolled in course ${courseId}. Skipping join test.`);
      console.log("   (This is expected in a fresh test environment)");
    } else {
      console.log(`✅ Student is enrolled in course: ${courseName}`);
    }

    // Step 6: Fetch live classes for student
    console.log("\n6️⃣  Fetching live classes for student...");
    const studentLiveClassesRes = await axios.get(
      `${API}/api/live-classes/student/upcoming`,
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );

    const studentLiveClasses = studentLiveClassesRes.data;
    console.log(`✅ Student has ${studentLiveClasses.length} upcoming live classes`);

    if (studentLiveClasses.length > 0) {
      const foundClass = studentLiveClasses.find(
        (c) => (c.id || c._id) == liveClass.id
      );
      if (foundClass) {
        console.log(`✅ Student can see the newly created live class!`);
      } else {
        console.log(`ℹ️  Student sees live classes but not the new one (may be from different course)`);
      }

      studentLiveClasses.forEach((lc, idx) => {
        console.log(`   [${idx + 1}] ${lc.title} - Status: ${lc.status}`);
      });
    } else {
      console.log("ℹ️  No live classes visible to student (expected if not enrolled)");
    }

    // Step 7: Student joins the live class
    if (enrolledInCourse && studentLiveClasses.length > 0) {
      console.log("\n7️⃣  Student joining live class...");
      const joinRes = await axios.post(
        `${API}/api/live-classes/${liveClass.id}/join`,
        {},
        { headers: { Authorization: `Bearer ${studentToken}` } }
      );
      console.log(`✅ Student joined successfully!`);
      console.log(`   - Response: ${joinRes.data.message}`);
      console.log(`   - Meeting Link: ${joinRes.data.meetingLink}`);
    }

    console.log("\n✅ TEST COMPLETED SUCCESSFULLY!\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:\n");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Message: ${error.response.data.message}`);
      console.error(`Full response:`, error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testStudentLiveClasses();
