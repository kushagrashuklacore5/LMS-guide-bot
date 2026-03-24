# Complete LMS Workflow Guide - All Features

## 🎯 System Overview
This LMS supports a complete educational workflow with 5 user roles:
- **Admin**: Manages classrooms and system configuration
- **Mentor/Teacher**: Teaches classes, creates courses, manages assessments
- **Student**: Enrolls in classrooms, takes courses, completes assessments
- **Storekeeper**: Manages inventory
- **Accountant**: Manages finances

---

## 📋 Admin Workflow - Create Classroom & Assign Students

### Step 1: Login as Admin
```
Email: admin@gmail.com
Password: (no password required on first login)
```

### Step 2: Navigate to Classrooms
- Go to: **Admin Dashboard → Classrooms**
- Click **"Create Classroom"** button

### Step 3: Create a Classroom
Fill in the form:
- **Grade**: 10, 11, 12, etc.
- **Section**: A, B, C, etc.
- **Class Teacher**: Name of the teacher (free text)
- **Students**: Select students to assign to this classroom (optional)

**Click Create** → Classroom is created and saved to database

### Step 4: View Created Classroom
- The classroom now appears in the classrooms grid
- Shows: Class name, section, teacher name, student count
- Click on the classroom card to view details

---

## 👨‍🏫 Mentor/Teacher Workflow - Create Courses

### Step 1: Login as Mentor/Teacher
```
Email: mentor@gmail.com
Password: (no password required on first login)
```

### Step 2: Navigate to Create Course
- Go to: **Mentor Dashboard → Course Management**
- Or: **Mentor Dashboard → Create Course**

### Step 3: Create a Course
Fill in the form:
- **Course Title**: Name of the course (Math, Science, etc.)
- **Category**: Subject category
- **Duration**: Hours required to complete
- **Course Teacher**: Select a teacher to assign from dropdown
- **Students**: Select students to enroll (optional)

**Click Create** → Course is created

### Step 4: Course Appears in Multiple Places
1. **Mentor's Course Management Page**: Shows all courses created by this mentor
2. **Student's Course Page**: If student is assigned, course appears in their "Courses" section
3. **Course Details**: Click on course to see details and manage

### Step 5: Add Course Materials (Optional)
- Click on course details
- Add: Videos, PDFs, links, chapters
- Materials appear to enrolled students

### Step 6: Create Assessments (Optional)
- Click on course → Assessment section
- Create MCQ questions
- Set timing and passing percentage
- Students can take assessment (one attempt only - auto-locked)

---

## 👨‍🎓 Student Workflow - Take Courses & Assessments

### Step 1: Login as Student
```
Email: student@gmail.com
Password: (no password required on first login)
```

### Step 2: View Assigned Classroom
- **Dashboard → My Classroom**
- Shows the classroom this student is assigned to
- Shows all courses in that classroom

### Step 3: Browse Available Courses
- **Dashboard → Courses**
- Showing all courses available to this student
- Filter by category or search

### Step 4: Enroll in a Course
- If not automatically enrolled, click "Enroll"
- Course materials now visible

### Step 5: Take a Course
- Click on course
- View materials: videos, PDFs, chapters
- Track progress (shows percentage completed)

### Step 6: Take Assessment (One Time Only)
- In course → Assessments section
- Click "Take Assessment"
- **LOCKED AFTER FIRST ATTEMPT** - Cannot retake
- Results show immediately with score and feedback

### Step 7: View Certificate
- After completing course
- **Dashboard → Certificates**
- Download certificate

### Step 8: Pay Fees (If Required)
- **Dashboard → Pay Fees**
- Shows fees for the classroom
- Click "Pay" → Razorpay checkout
- Payment marked as completed

---

## 📊 Data Synchronization Flow

### When Admin Creates Classroom:
```
Admin creates → Database saved
    ↓
Students assigned → Classroom visible in student dashboard
    ↓
Students see classroom courses
```

### When Teacher Creates Course:
```
Teacher creates → Database saved
    ↓
Assigned students → Course appears in their "Courses" page
    ↓
Students can enroll and access materials
```

### When Student Takes Assessment:
```
Student submits → Answer saved to database
    ↓
Assessment auto-locked → Cannot retake
    ↓
Result shown immediately → Teacher can see in results page
```

---

## 🔄 Real-Time Synchronization

### Technologies Used:
- **Socket.IO**: Real-time notifications
- **5-second polling**: Background data refresh
- **Local state**: Immediate UI updates

### Data Syncs Automatically:
- ✅ New classrooms appear instantly
- ✅ New courses appear for enrolled students
- ✅ Assessment results update immediately
- ✅ Attendance marked in real-time
- ✅ Payment status updates instantly
- ✅ Announcements broadcast to specific roles/courses

---

## 🛠️ Troubleshooting

### Classroom Not Showing?
1. Check if you're logged in as Admin
2. Click "Create Classroom" (start fresh)
3. Reload page (F5)

### Course Not Appearing in Student Portal?
1. Verify student is assigned to course
2. Check student's classroom assignment
3. Wait 5 seconds for sync, then reload

### Assessment Locked But Want to Retake?
- **By Design**: Assessment is locked after first attempt for security
- Contact admin to manually reset if needed

### Can't Create Classroom as Admin?
1. Check Grade and Section are filled
2. Verify network connection
3. Check browser console for errors (F12 → Console)

---

## 📱 Portal Access URLs

| Role | URL | Dashboard |
|------|-----|-----------|
| **Admin** | http://localhost:5174/admin | Classrooms, Users, Settings |
| **Mentor** | http://localhost:5174/mentor | Course Management, Assessments |
| **Student** | http://localhost:5174/student | My Classroom, Courses, Fees |
| **Storekeeper** | http://localhost:5174/storekeeper | Inventory, Orders |
| **Accountant** | http://localhost:5174/accountant | Transactions, Expenses |

---

## 🎓 Demo Credentials

```javascript
const demoUsers = [
  { email: "admin@gmail.com", role: "admin" },
  { email: "mentor@gmail.com", role: "mentor" },
  { email: "student@gmail.com", role: "student" },
  { email: "storekeeper@gmail.com", role: "storekeeper" },
  { email: "accountant@gmail.com", role: "accountant" }
];

// No password required - auto-login on first access
// Password is auto-generated and sent to email (mock in demo)
```

---

## ✅ Complete Feature List

### 1. ✅ Admin User Management
- Create students and teachers with auto-generated passwords
- Assign students to classrooms
- View all users

### 2. ✅ Classroom Management
- Create classrooms with grade and section
- Assign class teacher
- Assign students
- View classroom details and courses

### 3. ✅ Fee Structure & Payments
- Auto-apply fee structures when classroom created
- Multiple fee types (tuition, transport, lab, etc.)
- Razorpay payment integration
- Track payment status

### 4. ✅ Course Creation by Teachers
- Teachers create courses in their classroom
- Assign course teacher
- Enroll students
- Track course progress

### 5. ✅ Course Materials Management
- Upload course materials (videos, PDFs, links)
- Organize by chapters
- Students access from course page
- Track material downloads

### 6. ✅ Assessment Management
- Teachers create assessments with MCQ
- Set questions, time limit, pass percentage
- Auto-lock after one submission
- Automatic grading

### 7. ✅ Attendance Tracking
- Teachers mark daily attendance
- Students view their attendance
- Calculate percentage
- Export attendance reports

### 8. ✅ Results & Grades
- Teachers enter student results
- Students view grades
- Automatic calculation
- Performance analytics

### 9. ✅ Live Classes
- Schedule live class sessions
- Start/stop live class
- Track attendance during live class
- Integration ready for Zoom/Meet

### 10. ✅ Calendar & Events
- Automatic calendar for:
  - Assessment dates
  - Fee due dates
  - Live class times
  - Important events

### 11. ✅ Announcements & Notifications
- Real-time notifications
- Role-based announcements
- Course-specific messages
- Bell notification system

---

## 🔐 Security Features

- ✅ Role-based access control
- ✅ JWT token authentication
- ✅ Middleware route protection
- ✅ Assessment submission locking
- ✅ One-time password generation
- ✅ Secure password hashing

---

## 📞 Support

For issues or questions:
1. Check browser console (F12 → Console)
2. Check network tab (F12 → Network)
3. Check server logs in terminal
4. Restart frontend/backend servers

---

**Last Updated**: January 27, 2026  
**Version**: 1.0.0  
**Status**: ✅ All Features Implemented & Working
