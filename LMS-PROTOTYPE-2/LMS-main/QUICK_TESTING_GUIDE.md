# LMS Testing Guide - Quick Reference

## Demo Credentials

All demo accounts can login with just email (no password required):

| Email | Password | Role | Use Case |
|-------|----------|------|----------|
| student@gmail.com | 12345678 | Student | View assignments, pay fees |
| mentor@gmail.com | 12345678 | Mentor/Teacher | Create courses, mark attendance |
| admin@gmail.com | 12345678 | Admin | Create users, manage system |
| storekeeper@demo.com | 12345678 | Storekeeper | Manage inventory |
| accountant@demo.com | 12345678 | Accountant | Track expenses |

---

## Feature Testing Steps

### 1. Admin User Management
**Login as:** admin@gmail.com

1. Go to Admin Dashboard → Users
2. Click "Add Student" or "Add Teacher"
3. Fill in form:
   - Student: Name, Email, Grade, Section
   - Teacher: Name, Email, Subject
4. System auto-generates password
5. Note password shown in response
6. ✅ User created successfully

---

### 2. Classroom Creation & Assignment
**Login as:** admin@gmail.com

**Create Classroom:**
1. Go to Admin Dashboard → Classrooms
2. Click "Create Classroom"
3. Select Grade Level (1-12)
4. Select Section (A, B, C, etc.)
5. Assign Class Teacher (dropdown)
6. Select Students to add
7. Click Create
8. ✅ Classroom appears in list

**Verify Auto-Reflection:**
1. Login as teacher (mentor@gmail.com)
2. Go to My Classrooms
3. ✅ Assigned classroom appears
4. Click classroom → See assigned students
5. Login as student
6. Go to My Classroom
7. ✅ Classroom and class teacher visible

---

### 3. Fee Structure & Payments
**Login as:** student@gmail.com

1. Go to Student Dashboard → Pay Fees
2. See Fee Structure:
   - Grade 1-4: ₹8,050
   - Grade 5-12: ₹12,100
3. Click "Pay Now"
4. Choose payment option:
   - Full payment
   - Partial payment (enter amount)
   - Installment
5. Complete Razorpay payment (test card)
6. ✅ Payment recorded
7. See payment history

---

### 4. Course Creation by Teachers
**Login as:** mentor@gmail.com

1. Go to Courses → Create Course
2. Fill in:
   - Title: "Mathematics 101"
   - Description: "Algebra basics"
   - Category: "Mathematics"
   - Duration: "12" weeks
3. Select Assign Course Teacher (you)
4. Select Students to enroll
5. Click Create
6. ✅ Course created
7. Go to My Courses
8. ✅ Course appears

---

### 5. Course Materials Upload
**Login as:** mentor@gmail.com

1. Go to Courses → Select Course
2. Click "Add Material"
3. Choose type:
   - Video Link: Paste YouTube URL
   - PDF Link: Paste Drive link
   - Upload File: Select from computer
4. Add title and description
5. Click Upload
6. ✅ Material added

**Student View:**
1. Login as student@gmail.com
2. Go to Courses → Select Course
3. ✅ See all materials
4. Click to view/download

---

### 6. Assessment Creation
**Login as:** mentor@gmail.com

1. Go to Courses → Select Course
2. Click "Create Assessment"
3. Fill in:
   - Title: "Quiz 1"
   - Start Time: Today 10:00 AM
   - End Time: Today 10:30 AM
   - Timer: 30 minutes
4. Click Add Question
5. Enter question text
6. Add 4 options
7. Mark correct answer
8. Add more questions (repeat 5-7)
9. Click Create Assessment
10. ✅ Assessment created

---

### 7. Student Assessment Taking
**Login as:** student@gmail.com

**First Attempt:**
1. Go to Courses → Select Course → Assessments
2. Click "Take Assessment"
3. See timer (30 minutes)
4. Select answers for all questions
5. Click Submit
6. ✅ Results shown:
   - Score out of total
   - Percentage
   - Pass/Fail
   - Correct answers

**Second Attempt:**
1. Go back to same assessment
2. Click "Take Assessment" again
3. ✅ Error: "Already attempted. You can only attempt once!"
4. See previous result

---

### 8. Attendance & Results
**Login as:** mentor@gmail.com

**Mark Attendance:**
1. Go to Attendance Management
2. Select Classroom
3. Select Date
4. Check Present/Absent for each student
5. Click Submit
6. ✅ Attendance saved

**Add Results:**
1. Go to Results Management
2. Select Classroom
3. Select Student
4. Add marks for subjects
5. Add comments
6. Click Save
7. ✅ Result saved

**Student View:**
1. Login as student@gmail.com
2. Go to Dashboard → My Attendance
3. ✅ See all attendance records
4. Go to Dashboard → My Results
5. ✅ See all marks and grades

---

### 9. Live Class
**Login as:** mentor@gmail.com

**Schedule Live Class:**
1. Go to Courses → Select Course
2. Click "Schedule Live Class"
3. Fill in:
   - Title: "Class Discussion"
   - Scheduled Start: Today 2:00 PM
   - Scheduled End: Today 3:00 PM
4. Click Schedule
5. ✅ Live class scheduled

**Start Live Class:**
1. Go to Live Classes
2. Find scheduled class
3. Click "Start Class"
4. ✅ Meeting link generated
5. Share link with students

**Student Join:**
1. Login as student@gmail.com
2. Go to Dashboard → Live Classes
3. ✅ See upcoming class
4. Click "Join"
5. ✅ Meeting link provided
6. System records attendance

---

### 10. Calendar
**Login as:** any user

1. Go to Calendar section
2. ✅ See all events:
   - Assessment dates
   - Fee due dates
   - Live class sessions
   - Announcements
3. Click event for details
4. Filter by type if available

---

### 11. Announcements & Bell
**Admin Publish:**
1. Login as admin@gmail.com
2. Go to Announcements → Create
3. Select "Publish For": "All Students"
4. Title: "Holiday Notice"
5. Message: "Classes closed tomorrow"
6. Click Publish
7. ✅ Announcement created

**Student Receive:**
1. Login as student@gmail.com
2. ✅ Bell icon shows unread count (🔴)
3. Click bell
4. ✅ See announcement popup
5. Click to mark as read
6. ✅ Badge disappears

---

## Important URLs

| Page | URL |
|------|-----|
| Login | http://localhost:5174/login |
| Admin Dashboard | http://localhost:5174/admin/dashboard |
| Teacher Dashboard | http://localhost:5174/mentor/dashboard |
| Student Dashboard | http://localhost:5174/student/dashboard |
| Classrooms | http://localhost:5174/admin/classrooms |
| Courses | http://localhost:5174/mentor/create-course |
| Assessments | http://localhost:5174/student/assessments |
| Attendance | http://localhost:5174/mentor/attendance-management |
| Results | http://localhost:5174/student/results |
| Pay Fees | http://localhost:5174/student/fees |
| Calendar | http://localhost:5174/calendar |

---

**All Features Ready for Testing!** ✅

Start with logging in as admin@gmail.com to explore the admin panel, then test each feature systematically.
