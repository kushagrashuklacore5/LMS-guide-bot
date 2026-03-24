# 📚 LMS PROTOTYPE 2 - COMPREHENSIVE DOCUMENTATION

## 📖 TABLE OF CONTENTS
- **Page 1**: SuperAdmin Features & Architecture
- **Page 2**: Admin Features & Role Management  
- **Page 3**: Mentor/Faculty Features & Course Management
- **Page 4**: Student Features & Learning Experience
- **Page 5**: Storekeeper & Accountant Features + Technical Architecture

---

# 📄 PAGE 1: SUPERADMIN FEATURES & ARCHITECTURE

## 🎯 OVERVIEW
The SuperAdmin role serves as the ultimate system administrator with complete control over the entire LMS ecosystem. This role manages universities, oversees all user accounts, and maintains system-wide settings.

## 🏛️ CORE SUPERADMIN FEATURES

### 1. UNIVERSITY MANAGEMENT
#### **Create University**
- **Endpoint**: `POST /api/superadmin/create-university`
- **Frontend**: `CreateUniversityForm.jsx`
- **Database**: Inserts into `universities` table
- **Process**:
  1. Creates university record with name, area, and admin assignment
  2. Generates admin user account with random password
  3. Displays credentials for 5 seconds with countdown timer
  4. Auto-redirects to universities list

#### **View Universities**
- **Endpoint**: `GET /api/superadmin/universities`
- **Frontend**: `SuperAdminDashboard.jsx` → Universities tab
- **Features**:
  - Grid layout with university cards
  - Search functionality
  - Real-time status indicators
  - Delete functionality with confirmation
  - Admin information display

#### **Delete University**
- **Endpoint**: `DELETE /api/superadmin/universities/:id`
- **Frontend**: Delete button on university cards
- **Process**:
  1. Confirmation dialog with warning message
  2. Cascade deletion: university + all associated users
  3. UI state update: removes card, updates stats
  4. Success/error toast notifications

### 2. USER MANAGEMENT
#### **Create Staff Member**
- **Endpoint**: `POST /api/superadmin/create-user`
- **Frontend**: `CreateUserForm.jsx`
- **Roles Available**: Admin, Accountant, Storekeeper
- **Process**:
  1. Form validation for all required fields
  2. Subscription check for premium roles (accountant, storekeeper)
  3. Random password generation
  4. University assignment
  5. Success callback with credentials

#### **View All Users**
- **Endpoint**: `GET /api/superadmin/users`
- **Frontend**: `SuperAdminDashboard.jsx` → Users tab
- **Features**:
  - Table view with user details
  - Role-based color coding
  - University assignment display
  - Approval status indicators
  - Search and filter capabilities

### 3. DASHBOARD OVERVIEW
#### **Statistics Panel**
- Total Universities count
- Total Students count  
- Total Faculty count
- Recent activity feed
- System health indicators

#### **Quick Actions**
- Add University button
- Add Staff button
- View Universities button
- View Staff button

## 🔐 AUTHENTICATION & SECURITY

### SuperAdmin Login
- **Endpoint**: `POST /api/superadmin/login`
- **Process**:
  1. Email/password validation
  2. JWT token generation
  3. Role-based routing
  4. Session management

### Authorization Middleware
- **File**: `server/middleware/authMiddleware.js`
- **Process**:
  1. Token verification
  2. User role extraction
  3. Route protection
  4. Error handling

## 🗄️ DATABASE SCHEMA (SUPERADMIN ENTITIES)

### Universities Table
```sql
CREATE TABLE universities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  adminId INTEGER,
  subscriptionPlan TEXT DEFAULT 'free',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (adminId) REFERENCES users(id)
);
```

### Users Table (SuperAdmin View)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL, -- superadmin, admin, accountant, storekeeper, faculty, student
  university_id INTEGER DEFAULT 1,
  isApproved BOOLEAN DEFAULT 0,
  classroom_id INTEGER,
  subscriptionPlan TEXT DEFAULT 'free',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 FRONTEND ARCHITECTURE

### Component Structure
```
src/pages/superadmin/
├── SuperAdminDashboard.jsx     # Main dashboard
├── CreateUniversityForm.jsx    # University creation
├── CreateUserForm.jsx         # Staff creation
└── SuperAdminLayout.jsx       # Layout component
```

### Key Features
- **Modern UI**: Tailwind CSS with gradient designs
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Toast notifications
- **Loading States**: Spinners and disabled states
- **Error Handling**: Comprehensive error management
- **Search & Filter**: Dynamic data filtering

### State Management
- **Local State**: React hooks (useState, useEffect)
- **API Integration**: Custom auth hook
- **Navigation**: React Router
- **Notifications**: React Toastify

## 🔄 API FLOWS

### University Creation Flow
1. **Frontend**: Form submission → `CreateUniversityForm.jsx`
2. **API**: `POST /api/superadmin/create-university`
3. **Controller**: `superAdminController.createUniversityWithAdmin`
4. **Database**: Insert university → Insert admin user
5. **Response**: Generated password + success message
6. **Frontend**: Display credentials → Auto-redirect

### User Deletion Flow
1. **Frontend**: Delete button click → Confirmation dialog
2. **API**: `DELETE /api/superadmin/universities/:id`
3. **Controller**: `superAdminController.deleteUniversity`
4. **Database**: Delete users → Delete university
5. **Response**: Success message
6. **Frontend**: Update UI state → Remove card

## 🎯 SUPERADMIN PERMISSIONS MATRIX

| Feature | Create | Read | Update | Delete |
|---------|--------|------|--------|--------|
| Universities | ✅ | ✅ | ✅ | ✅ |
| All Users | ✅ | ✅ | ✅ | ✅ |
| System Settings | ✅ | ✅ | ✅ | ✅ |
| Subscriptions | ✅ | ✅ | ✅ | ✅ |
| Database Export | ✅ | ✅ | ✅ | ✅ |

## 🚀 TECHNICAL IMPLEMENTATION

### Backend Controllers
- **File**: `server/controllers/superAdminController.js`
- **Functions**:
  - `createUniversityWithAdmin`
  - `createUser`
  - `getAllUniversities`
  - `getAllUsers`
  - `deleteUniversity`

### Frontend Components
- **Main Dashboard**: Comprehensive overview with statistics
- **Forms**: Modern, validated, user-friendly forms
- **Cards**: Interactive university cards with actions
- **Tables**: Sortable, searchable user tables

### Integration Points
- **Authentication**: JWT-based auth system
- **Database**: SQLite with foreign key relationships
- **File Upload**: Support for university logos
- **Email**: Password delivery system
- **Notifications**: Real-time toast notifications

---

# 📄 PAGE 2: ADMIN FEATURES & ROLE MANAGEMENT

## 🎯 OVERVIEW
The Admin role manages individual universities, overseeing faculty, students, courses, and daily operations within their assigned institution. Admins have university-level permissions but cannot access other universities' data.

## 🏫 CORE ADMIN FEATURES

### 1. DASHBOARD MANAGEMENT
#### **Admin Dashboard**
- **Component**: `admin/Admin-Dashboard.jsx`
- **Features**:
  - University-specific statistics
  - Student enrollment metrics
  - Faculty performance overview
  - Course completion rates
  - Recent activities
  - Quick action buttons

#### **Key Metrics Display**
- Total students enrolled
- Active faculty members
- Number of courses
- Classroom utilization
- Attendance statistics
- Assessment completion rates

### 2. STUDENT MANAGEMENT
#### **Add Student**
- **Component**: `admin/AddStudent.jsx`
- **Endpoint**: `POST /api/admin/add-student`
- **Process**:
  1. Student information collection
  2. Classroom assignment
  3. Account creation with generated password
  4. Parent/guardian information (optional)
  5. Enrollment confirmation

#### **View Student List**
- **Component**: `admin/UserList.jsx`
- **Features**:
  - Filterable student directory
  - Search by name, email, or classroom
  - Enrollment status tracking
  - Academic performance overview
  - Bulk actions (approve, suspend)

#### **Student Profile Management**
- Edit student information
- Update classroom assignments
- Track academic progress
- Manage attendance records
- Parent communication logs

### 3. FACULTY MANAGEMENT
#### **Add Teacher/Mentor**
- **Component**: `admin/AddTeacher.jsx`
- **Endpoint**: `POST /api/admin/add-teacher`
- **Process**:
  1. Faculty credentials collection
  2. Subject specialization assignment
  3. Classroom allocation
  4. Approval workflow
  5. Access level configuration

#### **Mentor Approval System**
- **Component**: `admin/MentorApproval.jsx`
- **Features**:
  - Pending mentor applications
  - Credential verification
  - Interview scheduling
  - Approval/rejection workflow
  - Automated notifications

#### **Faculty Performance Tracking**
- Teaching quality metrics
- Student feedback analysis
- Course completion rates
- Professional development records
- Performance review scheduling

### 4. CLASSROOM MANAGEMENT
#### **Create Classroom**
- **Component**: `admin/CreateClassroomModal.jsx`
- **Endpoint**: `POST /api/admin/create-classroom`
- **Features**:
  - Classroom naming and coding
  - Capacity planning
  - Resource allocation
  - Schedule configuration
  - Faculty assignment

#### **View Classrooms**
- **Component**: `admin/Classrooms.jsx`
- **Features**:
  - Grid layout of all classrooms
  - Student count per classroom
  - Assigned faculty information
  - Schedule overview
  - Resource utilization

#### **Classroom Details**
- **Component**: `admin/ClassroomDetails.jsx`
- **Features**:
  - Student roster management
  - Faculty assignment
  - Schedule management
  - Resource allocation
  - Performance metrics

### 5. COURSE MANAGEMENT
#### **Create Course**
- **Component**: `admin/CreateCourseAdmin.jsx`
- **Endpoint**: `POST /api/admin/create-course`
- **Process**:
  1. Course information setup
  2. Curriculum planning
  3. Resource allocation
  4. Faculty assignment
  5. Student enrollment configuration

#### **Course Analytics**
- **Component**: `admin/Analytics.jsx`
- **Features**:
  - Enrollment statistics
  - Completion rates
  - Student performance metrics
  - Faculty effectiveness
  - Resource utilization

### 6. DATABASE & REPORTS
#### **Database Export**
- **Component**: `admin/DatabaseExport.jsx`
- **Endpoints**: Various export endpoints
- **Features**:
  - Student data export
  - Faculty records export
  - Course completion reports
  - Attendance summaries
  - Performance analytics

## 🔐 ADMIN AUTHENTICATION & PERMISSIONS

### Login Process
- **Endpoint**: `POST /api/auth/login`
- **Role Verification**: Admin role validation
- **University Assignment**: Restrict to assigned university
- **Access Control**: University-scoped data access

### Permission Matrix
| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Students | ✅ | ✅ | ✅ | ✅ |
| Faculty | ✅ | ✅ | ✅ | ✅ |
| Classrooms | ✅ | ✅ | ✅ | ✅ |
| Courses | ✅ | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ❌ | ❌ |

## 🗄️ DATABASE SCHEMA (ADMIN ENTITIES)

### Classrooms Table
```sql
CREATE TABLE classrooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  university_id INTEGER NOT NULL,
  faculty_id INTEGER,
  capacity INTEGER DEFAULT 30,
  schedule TEXT, -- JSON schedule data
  resources TEXT, -- JSON resource allocation
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES universities(id),
  FOREIGN KEY (faculty_id) REFERENCES users(id)
);
```

### Courses Table
```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  university_id INTEGER NOT NULL,
  faculty_id INTEGER,
  classroom_id INTEGER,
  duration INTEGER, -- in weeks
  difficulty_level TEXT DEFAULT 'beginner',
  prerequisites TEXT, -- JSON array of course IDs
  materials TEXT, -- JSON array of material IDs
  max_students INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (university_id) REFERENCES universities(id),
  FOREIGN KEY (faculty_id) REFERENCES users(id),
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
);
```

### Course Students Table
```sql
CREATE TABLE course_students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  student_id INTEGER NOT NULL,
  enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  completion_date DATETIME,
  progress_percentage REAL DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, completed, dropped
  grade TEXT,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  UNIQUE(course_id, student_id)
);
```

## 🎨 FRONTEND ARCHITECTURE (ADMIN)

### Component Structure
```
src/pages/admin/
├── Admin-Dashboard.jsx        # Main dashboard
├── AddStudent.jsx            # Student creation
├── AddTeacher.jsx            # Faculty creation
├── Classrooms.jsx            # Classroom management
├── ClassroomDetails.jsx       # Classroom details
├── CreateClassroomModal.jsx   # Classroom creation
├── CreateCourseAdmin.jsx      # Course creation
├── MentorApproval.jsx         # Faculty approval
├── UserList.jsx              # Student/faculty lists
├── Analytics.jsx             # Performance analytics
└── DatabaseExport.jsx        # Data export
```

### Key UI Features
- **Responsive Design**: Mobile-first approach
- **Data Tables**: Sortable, filterable tables
- **Modal Forms**: Clean, validated forms
- **Progress Indicators**: Loading and completion states
- **Charts & Graphs**: Visual analytics
- **Search & Filter**: Advanced filtering options

## 🔄 API FLOWS (ADMIN)

### Student Creation Flow
1. **Frontend**: `AddStudent.jsx` form submission
2. **API**: `POST /api/admin/add-student`
3. **Controller**: `adminController.addStudent`
4. **Database**: Insert student → Assign classroom
5. **Response**: Student ID + generated password
6. **Frontend**: Success notification → Clear form

### Classroom Management Flow
1. **Frontend**: `Classrooms.jsx` → Create/Edit
2. **API**: `POST/PUT /api/admin/classrooms/:id`
3. **Controller**: `adminController.manageClassroom`
4. **Database**: Update classroom → Assign faculty
5. **Response**: Updated classroom data
6. **Frontend**: Refresh classroom list

### Faculty Approval Flow
1. **Frontend**: `MentorApproval.jsx` → Review application
2. **API**: `POST /api/admin/approve-mentor`
3. **Controller**: `adminController.approveMentor`
4. **Database**: Update user status → Send notification
5. **Response**: Approval confirmation
6. **Frontend**: Update pending list

## 📊 ANALYTICS & REPORTING

### Student Performance Analytics
- Enrollment trends
- Attendance patterns
- Grade distributions
- Course completion rates
- Learning progress tracking

### Faculty Performance Metrics
- Teaching load analysis
- Student satisfaction scores
- Course effectiveness ratings
- Professional development tracking
- Peer review summaries

### Institutional Reports
- Monthly enrollment reports
- Financial summaries
- Resource utilization
- Compliance documentation
- Accreditation support

## 🔧 TECHNICAL IMPLEMENTATION

### Backend Controllers
- **File**: `server/controllers/adminController.js`
- **Key Functions**:
  - `addStudent`
  - `addTeacher`
  - `createClassroom`
  - `approveMentor`
  - `getAnalytics`
  - `exportData`

### Frontend State Management
- **Local State**: React hooks for form data
- **Global State**: Context for university data
- **Caching**: Local storage for user preferences
- **Real-time Updates**: WebSocket integration

### Integration Points
- **Authentication**: Role-based access control
- **File Storage**: Document and media uploads
- **Notifications**: Email and in-app alerts
- **Calendar**: Schedule management
- **Payment**: Integration with billing system

---

# 📄 PAGE 3: MENTOR/FACULTY FEATURES & COURSE MANAGEMENT

## 🎯 OVERVIEW
The Mentor/Faculty role focuses on educational delivery, course management, student assessment, and academic support. Mentors create and deliver courses, manage student progress, and facilitate the learning experience within their assigned classrooms.

## 🎓 CORE MENTOR FEATURES

### 1. COURSE MANAGEMENT
#### **Create Course**
- **Component**: `mentor/CreateCourse.jsx`
- **Endpoint**: `POST /api/mentor/create-course`
- **Process**:
  1. Course information setup (title, description, objectives)
  2. Curriculum planning and structure
  3. Resource allocation and material preparation
  4. Assessment strategy design
  5. Student enrollment configuration

#### **Course Structure Design**
- Chapter organization and sequencing
- Learning objectives per chapter
- Prerequisites setup
- Duration planning
- Difficulty level assignment

#### **Course Materials Upload**
- **Component**: `mentor/CourseMaterialsUpload.jsx`
- **Endpoint**: `POST /api/mentor/upload-materials`
- **Features**:
  - Document upload (PDF, DOC, PPT)
  - Video content management
  - Interactive material support
  - Version control
  - Access permission settings

### 2. CHAPTER MANAGEMENT
#### **Add Chapter**
- **Component**: `mentor/AddChapter.jsx`
- **Endpoint**: `POST /api/mentor/add-chapter`
- **Process**:
  1. Chapter content creation
  2. Learning resources attachment
  3. Assignment of duration and objectives
  4. Sequencing within course
  5. Publication status management

#### **Chapter Content Types**
- Text-based lessons
- Video lectures
- Interactive presentations
- Reading materials
- External resource links
- Practice exercises

### 3. ASSESSMENT MANAGEMENT
#### **Create Assessment**
- **Component**: `mentor/CreateAssessment.jsx`
- **Endpoint**: `POST /api/mentor/create-assessment`
- **Features**:
  - Multiple question types (MCQ, essay, practical)
  - Time limit configuration
  - Grading rubric setup
  - Randomization options
  - Accessibility settings

#### **Add Questions**
- **Component**: `mentor/AddQuestions.jsx`
- **Endpoint**: `POST /api/mentor/add-questions`
- **Question Types**:
  - Multiple Choice Questions (MCQ)
  - True/False
  - Fill in the blanks
  - Essay questions
  - Practical assignments
  - File upload submissions

#### **Design Assessment**
- **Component**: `mentor/DesignAssessment.jsx`
- **Features**:
  - Question bank management
  - Assessment template creation
  - Difficulty level assignment
  - Point distribution
  - Automated grading setup

### 4. STUDENT MANAGEMENT
#### **Assign Students**
- **Component**: `mentor/AssignStudents.jsx`
- **Endpoint**: `POST /api/mentor/assign-students`
- **Process**:
  1. Student selection from available pool
  2. Course enrollment management
  3. Classroom assignment
  4. Progress tracking setup
  5. Notification to students

#### **Assign Students to Classroom**
- **Component**: `mentor/AssignStudentsToClassroom.jsx`
- **Endpoint**: `POST /api/mentor/assign-to-classroom`
- **Features**:
  - Bulk student assignment
  - Capacity management
  - Schedule conflict detection
  - Parent notification
  - Enrollment confirmation

#### **Student Progress Tracking**
- Real-time progress monitoring
- Completion percentage tracking
- Performance analytics
- Engagement metrics
- Intervention alerts

### 5. ATTENDANCE MANAGEMENT
#### **Attendance System**
- **Component**: `mentor/Attendance.jsx`
- **Endpoint**: `POST /api/mentor/mark-attendance`
- **Features**:
  - Daily attendance marking
  - Bulk attendance update
  - Absence reason tracking
  - Pattern analysis
  - Parent notifications

#### **Attendance Management**
- **Component**: `mentor/AttendanceManagement.jsx`
- **Features**:
  - Historical attendance records
  - Attendance reports generation
  - Trend analysis
  - Automated alerts for chronic absence
  - Export functionality

### 6. GRADING & ASSESSMENT
#### **Add Results**
- **Component**: `mentor/AddResult.jsx`
- **Endpoint**: `POST /api/mentor/add-result`
- **Process**:
  1. Assessment selection
  2. Student result entry
  3. Grade calculation
  4. Feedback provision
  5. Parent notification

#### **Class Results**
- **Component**: `mentor/ClassResults.jsx`
- **Features**:
  - Grade book management
  - Performance analytics
  - Grade distribution charts
  - Progress tracking
  - Report generation

### 7. CLASSROOM MANAGEMENT
#### **Course Teacher Portal**
- **Component**: `mentor/CourseTeacherPortal.jsx`
- **Features**:
  - Dashboard with teaching schedule
  - Quick access to assigned courses
  - Student roster management
  - Resource library
  - Communication tools

#### **Classroom Detail**
- **Component**: `mentor/ClassroomDetail.jsx`
- **Features**:
  - Student information display
  - Attendance tracking
  - Performance metrics
  - Communication log
  - Resource management

## 🗄️ DATABASE SCHEMA (MENTOR ENTITIES)

### Chapters Table
```sql
CREATE TABLE chapters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  course_id INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  duration INTEGER, -- in minutes
  objectives TEXT, -- JSON array of learning objectives
  materials TEXT, -- JSON array of material IDs
  is_published BOOLEAN DEFAULT 0,
  created_by INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Assessments Table
```sql
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  course_id INTEGER NOT NULL,
  chapter_id INTEGER,
  type TEXT DEFAULT 'quiz', -- quiz, exam, assignment
  duration INTEGER, -- in minutes
  total_marks INTEGER DEFAULT 100,
  passing_marks INTEGER DEFAULT 60,
  instructions TEXT,
  is_published BOOLEAN DEFAULT 0,
  randomize_questions BOOLEAN DEFAULT 0,
  show_results_immediately BOOLEAN DEFAULT 1,
  created_by INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (chapter_id) REFERENCES chapters(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Assessment Questions Table
```sql
CREATE TABLE assessment_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- mcq, true_false, essay, fill_blank
  options TEXT, -- JSON array for MCQ options
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  order_index INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);
```

### Attendance Table
```sql
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL, -- present, absent, late, excused
  marked_by INTEGER NOT NULL,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (marked_by) REFERENCES users(id),
  UNIQUE(student_id, course_id, date)
);
```

### Results Table
```sql
CREATE TABLE results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  assessment_id INTEGER NOT NULL,
  marks_obtained REAL NOT NULL,
  total_marks REAL NOT NULL,
  percentage REAL NOT NULL,
  grade TEXT,
  feedback TEXT,
  submitted_at DATETIME,
  graded_by INTEGER NOT NULL,
  graded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id),
  FOREIGN KEY (graded_by) REFERENCES users(id)
);
```

## 🎨 FRONTEND ARCHITECTURE (MENTOR)

### Component Structure
```
src/pages/mentor/
├── CourseTeacherPortal.jsx      # Main dashboard
├── CreateCourse.jsx            # Course creation
├── AddChapter.jsx             # Chapter management
├── CreateAssessment.jsx        # Assessment creation
├── DesignAssessment.jsx        # Assessment design
├── AddQuestions.jsx           # Question management
├── AssignStudents.jsx         # Student assignment
├── AssignStudentsToClassroom.jsx # Classroom assignment
├── Attendance.jsx             # Attendance marking
├── AttendanceManagement.jsx    # Attendance management
├── AddResult.jsx              # Grade entry
├── ClassResults.jsx           # Grade book
├── ClassroomDetail.jsx        # Classroom details
└── CourseMaterialsUpload.jsx   # Material upload
```

### Key UI Features
- **Course Builder**: Drag-and-drop course creation
- **Rich Text Editor**: For content creation
- **File Upload**: Multi-format support
- **Grade Book**: Comprehensive grading interface
- **Analytics Dashboard**: Performance visualization
- **Communication Tools**: Student messaging

## 🔄 API FLOWS (MENTOR)

### Course Creation Flow
1. **Frontend**: `CreateCourse.jsx` form submission
2. **API**: `POST /api/mentor/create-course`
3. **Controller**: `mentorController.createCourse`
4. **Database**: Insert course → Link to mentor
5. **Response**: Course ID + creation confirmation
6. **Frontend**: Redirect to course management

### Assessment Creation Flow
1. **Frontend**: `CreateAssessment.jsx` → Design assessment
2. **API**: `POST /api/mentor/create-assessment`
3. **Controller**: `mentorController.createAssessment`
4. **Database**: Insert assessment → Add questions
5. **Response**: Assessment ID + question bank
6. **Frontend**: Update assessment list

### Grading Flow
1. **Frontend**: `AddResult.jsx` → Enter grades
2. **API**: `POST /api/mentor/add-result`
3. **Controller**: `mentorController.addResult`
4. **Database**: Insert result → Calculate statistics
5. **Response**: Grade confirmation
6. **Frontend**: Update grade book

## 📊 TEACHING ANALYTICS

### Student Performance Metrics
- Individual student progress tracking
- Class average performance
- Learning pace analysis
- Engagement metrics
- Intervention recommendations

### Course Effectiveness Analysis
- Completion rates per course
- Student satisfaction scores
- Learning outcome achievement
- Content engagement metrics
- Assessment performance analysis

### Teaching Load Management
- Course assignment overview
- Student-to-faculty ratios
- Time allocation tracking
- Workload balance analysis
- Scheduling optimization

## 🔧 TECHNICAL IMPLEMENTATION

### Backend Controllers
- **File**: `server/controllers/mentorController.js`
- **Key Functions**:
  - `createCourse`
  - `addChapter`
  - `createAssessment`
  - `markAttendance`
  - `addResult`
  - `assignStudents`

### Frontend State Management
- **Course State**: Active course information
- **Assessment State**: Question bank and results
- **Student State**: Roster and progress data
- **Attendance State**: Daily attendance records
- **Grade State**: Grade book and analytics

### Integration Points
- **File Storage**: Cloud storage integration
- **Rich Text Editor**: Content creation tools
- **Video Platform**: Lecture hosting
- **Communication**: Student messaging system
- **Calendar**: Schedule management

## 🎯 MENTOR PERMISSIONS MATRIX

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Courses | ✅ | ✅ | ✅ | ✅ |
| Chapters | ✅ | ✅ | ✅ | ✅ |
| Assessments | ✅ | ✅ | ✅ | ✅ |
| Attendance | ✅ | ✅ | ✅ | ❌ |
| Results | ✅ | ✅ | ✅ | ✅ |
| Materials | ✅ | ✅ | ✅ | ✅ |

---

# 📄 PAGE 4: STUDENT FEATURES & LEARNING EXPERIENCE

## 🎯 OVERVIEW
The Student role provides a comprehensive learning platform where students can access courses, complete assignments, track progress, communicate with faculty, and manage their academic journey. The student experience is designed to be intuitive, engaging, and supportive of various learning styles.

## 🎓 CORE STUDENT FEATURES

### 1. DASHBOARD & OVERVIEW
#### **Student Dashboard**
- **Component**: `student/StudentDashboard.jsx`
- **Features**:
  - Personalized welcome message
  - Enrolled courses overview
  - Upcoming assignments and deadlines
  - Recent grades and feedback
  - Attendance summary
  - Achievement badges and progress indicators

#### **Key Metrics Display**
- Course completion percentage
- Overall GPA/grade average
- Attendance rate
- Assignment completion status
- Upcoming events and deadlines
- Recent notifications

### 2. COURSE ACCESS & LEARNING
#### **My Courses**
- **Component**: `student/MyCourses.jsx`
- **Endpoint**: `GET /api/student/courses`
- **Features**:
  - Grid layout of enrolled courses
  - Progress indicators per course
  - Quick access to course materials
  - Faculty information display
  - Course status (active, completed, upcoming)

#### **Course Content Viewer**
- **Component**: `student/CourseViewer.jsx`
- **Features**:
  - Sequential chapter navigation
  - Rich content display (text, video, interactive)
  - Downloadable materials
  - Bookmarking functionality
  - Note-taking capabilities
  - Progress tracking

#### **Learning Materials Access**
- **Component**: `student/CourseMaterials.jsx`
- **Features**:
  - Material library per course
  - Multiple format support (PDF, video, audio)
  - Download and offline access
  - Search functionality
  - Version tracking

### 3. ASSESSMENTS & ASSIGNMENTS
#### **Assessment Portal**
- **Component**: `student/AssessmentPortal.jsx`
- **Endpoint**: `GET /api/student/assessments`
- **Features**:
  - List of available assessments
  - Due dates and time limits
  - Attempt history
  - Grade display
  - Feedback viewing

#### **Take Assessment**
- **Component**: `student/TakeAssessment.jsx`
- **Endpoint**: `POST /api/student/submit-assessment`
- **Features**:
  - Various question types support
  - Timer functionality
  - Auto-save progress
  - Review before submission
  - Immediate feedback (when enabled)

#### **Assignment Submission**
- **Component**: `student/AssignmentSubmission.jsx`
- **Endpoint**: `POST /api/student/submit-assignment`
- **Features**:
  - File upload support
  - Text submission with rich formatting
  - Draft saving
  - Submission history
  - Plagiarism check integration

### 4. PROGRESS TRACKING
#### **My Progress**
- **Component**: `student/MyProgress.jsx`
- **Endpoint**: `GET /api/student/progress`
- **Features**:
  - Overall academic progress
  - Course-wise completion rates
  - Grade trends over time
  - Learning analytics
  - Achievement tracking

#### **Performance Analytics**
- **Component**: `student/PerformanceAnalytics.jsx`
- **Features**:
  - Grade distribution charts
  - Learning pace analysis
  - Strength and weakness identification
  - Comparison with class averages
  - Improvement suggestions

### 5. ATTENDANCE MANAGEMENT
#### **Attendance Records**
- **Component**: `student/AttendanceRecords.jsx`
- **Endpoint**: `GET /api/student/attendance`
- **Features**:
  - Personal attendance history
  - Monthly/weekly attendance reports
  - Absence details and reasons
  - Attendance percentage calculation
  - Export functionality

#### **Leave Applications**
- **Component**: `student/LeaveApplication.jsx`
- **Endpoint**: `POST /api/student/apply-leave`
- **Features**:
  - Leave request submission
  - Document attachment
  - Application status tracking
  - Approval history
  - Automated notifications

### 6. COMMUNICATION & COLLABORATION
#### **Messaging System**
- **Component**: `student/Messaging.jsx`
- **Endpoint**: `GET/POST /api/student/messages`
- **Features**:
  - Direct messaging with faculty
  - Group discussions
  - File sharing in messages
  - Read receipts
  - Message search and filtering

#### **Discussion Forums**
- **Component**: `student/DiscussionForums.jsx`
- **Endpoint**: `GET/POST /api/student/forums`
- **Features**:
  - Course-specific discussion boards
  - Topic creation and participation
  - Peer interaction and support
  - Faculty moderation
  - Rich text formatting

### 7. CERTIFICATES & ACHIEVEMENTS
#### **My Certificates**
- **Component**: `student/MyCertificates.jsx`
- **Endpoint**: `GET /api/student/certificates`
- **Features**:
  - Certificate gallery
  - Download and print options
  - Verification links
  - Sharing capabilities
  - Achievement badges

#### **Achievement System**
- **Component**: `student/Achievements.jsx`
- **Features**:
  - Badge collection
  - Progress milestones
  - Leaderboard participation
  - Rewards and recognition
  - Social sharing

### 8. FEES & PAYMENTS
#### **Fee Management**
- **Component**: `student/PayFees.jsx`
- **Endpoint**: `GET /api/student/fees`
- **Features**:
  - Fee structure display
  - Payment history
  - Outstanding balance
  - Payment reminders
  - Receipt generation

#### **Payment Processing**
- **Endpoint**: `POST /api/student/make-payment`
- **Features**:
  - Multiple payment methods
  - Installment plans
  - Automatic receipts
  - Payment confirmation
  - Refund tracking

## 🗄️ DATABASE SCHEMA (STUDENT ENTITIES)

### Student Progress Table
```sql
CREATE TABLE student_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  chapter_id INTEGER,
  completion_percentage REAL DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- in minutes
  last_accessed DATETIME,
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (chapter_id) REFERENCES chapters(id),
  UNIQUE(student_id, course_id, chapter_id)
);
```

### Assessment Attempts Table
```sql
CREATE TABLE assessment_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  assessment_id INTEGER NOT NULL,
  attempt_number INTEGER NOT NULL,
  started_at DATETIME,
  submitted_at DATETIME,
  time_taken INTEGER, -- in minutes
  answers TEXT, -- JSON object of answers
  score REAL,
  percentage REAL,
  grade TEXT,
  status TEXT DEFAULT 'in_progress', -- in_progress, submitted, graded, timed_out
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);
```

### Student Materials Table
```sql
CREATE TABLE student_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  material_id INTEGER NOT NULL,
  access_count INTEGER DEFAULT 0,
  last_accessed DATETIME,
  is_bookmarked BOOLEAN DEFAULT 0,
  notes TEXT,
  download_date DATETIME,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (material_id) REFERENCES materials(id),
  UNIQUE(student_id, material_id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT 0,
  is_deleted BOOLEAN DEFAULT 0,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME,
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

## 🎨 FRONTEND ARCHITECTURE (STUDENT)

### Component Structure
```
src/pages/student/
├── StudentDashboard.jsx      # Main dashboard
├── MyCourses.jsx            # Course listing
├── CourseViewer.jsx         # Course content
├── CourseMaterials.jsx       # Material access
├── AssessmentPortal.jsx     # Assessment list
├── TakeAssessment.jsx      # Assessment interface
├── AssignmentSubmission.jsx  # Assignment submission
├── MyProgress.jsx          # Progress tracking
├── PerformanceAnalytics.jsx # Performance data
├── AttendanceRecords.jsx   # Attendance history
├── LeaveApplication.jsx    # Leave requests
├── Messaging.jsx           # Communication
├── DiscussionForums.jsx   # Forums
├── MyCertificates.jsx     # Certificates
├── Achievements.jsx       # Badges & rewards
└── PayFees.jsx          # Fee management
```

### Key UI Features
- **Responsive Design**: Mobile-first learning experience
- **Progress Visualization**: Interactive progress bars and charts
- **Rich Content Viewer**: Multi-format content support
- **Interactive Assessments**: Engaging assessment interface
- **Real-time Notifications**: Instant updates and reminders
- **Offline Support**: Download and offline learning capability

## 🔄 API FLOWS (STUDENT)

### Course Access Flow
1. **Frontend**: `MyCourses.jsx` → Select course
2. **API**: `GET /api/student/courses/:id`
3. **Controller**: `studentController.getCourseContent`
4. **Database**: Fetch course → Get progress → Load materials
5. **Response**: Course content + progress data
6. **Frontend**: Display course → Update progress tracking

### Assessment Submission Flow
1. **Frontend**: `TakeAssessment.jsx` → Complete assessment
2. **API**: `POST /api/student/submit-assessment`
3. **Controller**: `studentController.submitAssessment`
4. **Database**: Save attempt → Calculate score → Update progress
5. **Response**: Grade + feedback
6. **Frontend**: Show results → Update analytics

### Progress Tracking Flow
1. **Frontend**: `CourseViewer.jsx` → Track activity
2. **API**: `POST /api/student/update-progress`
3. **Controller**: `studentController.updateProgress`
4. **Database**: Update progress → Log activity → Calculate completion
5. **Response**: Progress confirmation
6. **Frontend**: Update progress indicators

## 📊 LEARNING ANALYTICS

### Student Performance Metrics
- Course completion rates
- Assessment performance trends
- Learning pace analysis
- Engagement metrics
- Skill development tracking

### Personalized Learning Insights
- Learning style identification
- Strength and weakness analysis
- Recommended learning paths
- Personalized study suggestions
- Goal setting and tracking

### Social Learning Analytics
- Forum participation metrics
- Peer interaction patterns
- Collaborative learning indicators
- Knowledge sharing contributions
- Community engagement levels

## 🔧 TECHNICAL IMPLEMENTATION

### Backend Controllers
- **File**: `server/controllers/studentController.js`
- **Key Functions**:
  - `getCourses`
  - `getCourseContent`
  - `submitAssessment`
  - `updateProgress`
  - `getAttendance`
  - `sendMessage`

### Frontend State Management
- **Course State**: Active course and progress
- **Assessment State**: Current assessment and answers
- **Progress State**: Learning progress and analytics
- **Communication State**: Messages and notifications
- **Profile State**: Student information and settings

### Integration Points
- **Content Delivery**: CDN integration for materials
- **Assessment Engine**: Real-time assessment processing
- **Progress Tracking**: Learning analytics engine
- **Communication**: Real-time messaging system
- **Payment Gateway**: Fee processing integration

## 🎯 STUDENT PERMISSIONS MATRIX

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Courses | ❌ | ✅ | ❌ | ❌ |
| Assessments | ❌ | ✅ | ❌ | ❌ |
| Progress | ❌ | ✅ | ✅ | ❌ |
| Messages | ✅ | ✅ | ✅ | ✅ |
| Materials | ❌ | ✅ | ❌ | ❌ |
| Attendance | ❌ | ✅ | ❌ | ❌ |

## 🎮 GAMIFICATION & ENGAGEMENT

### Achievement System
- Course completion badges
- Perfect attendance awards
- High achievement recognition
- Peer collaboration badges
- Learning streak rewards

### Progress Visualization
- Interactive progress bars
- Learning journey maps
- Milestone celebrations
- Personal achievement walls
- Social leaderboards

### Motivational Features
- Personalized learning paths
- Adaptive difficulty adjustment
- Intelligent recommendations
- Goal setting assistance
- Progress celebrations

---

# 📄 PAGE 5: STOREKEEPER & ACCOUNTANT FEATURES + TECHNICAL ARCHITECTURE

## 🎯 OVERVIEW
The Storekeeper and Accountant roles provide specialized administrative functions for inventory management and financial operations. These roles ensure smooth operational workflows, resource allocation, and financial transparency within the educational institution.

## 📦 STOREKEEPER FEATURES

### 1. INVENTORY MANAGEMENT
#### **Inventory Dashboard**
- **Component**: `accountant/Inventory.jsx`
- **Endpoint**: `GET /api/storekeeper/inventory`
- **Features**:
  - Real-time stock levels
  - Item categorization
  - Low stock alerts
  - Expiry date tracking
  - Supplier information

#### **Item Management**
- **Component**: `storekeeper/ItemManagement.jsx`
- **Endpoint**: `POST/PUT/DELETE /api/storekeeper/items`
- **Features**:
  - Add new inventory items
  - Update item details
  - Track item movements
  - Manage categories
  - Set reorder points

#### **Stock Operations**
- **Component**: `storekeeper/StockOperations.jsx`
- **Endpoint**: `POST /api/storekeeper/stock-operations`
- **Features**:
  - Stock in/out recording
  - Transfer between locations
  - Adjustment entries
  - Batch tracking
  - Quality control records

### 2. PROCUREMENT & VENDORS
#### **Vendor Management**
- **Component**: `storekeeper/VendorManagement.jsx`
- **Endpoint**: `GET/POST /api/storekeeper/vendors`
- **Features**:
  - Vendor directory
  - Performance tracking
  - Contract management
  - Payment terms
  - Communication logs

#### **Purchase Orders**
- **Component**: `storekeeper/PurchaseOrders.jsx`
- **Endpoint**: `POST /api/storekeeper/purchase-orders`
- **Features**:
  - Create purchase requests
  - Approval workflow
  - Order tracking
  - Receipt confirmation
  - Invoice processing

#### **Requirements Management**
- **Component**: `storekeeper/Requirements.jsx`
- **Endpoint**: `GET/POST /api/requirements`
- **Features**:
  - Departmental requests
  - Requirement prioritization
  - Budget allocation
  - Approval tracking
  - Fulfillment status

### 3. REPORTING & ANALYTICS
#### **Inventory Reports**
- **Component**: `storekeeper/InventoryReports.jsx`
- **Endpoint**: `GET /api/storekeeper/reports`
- **Features**:
  - Stock valuation reports
  - Movement analysis
  - Consumption patterns
  - Expiry reports
  - Cost analysis

#### **Analytics Dashboard**
- **Features**:
  - Inventory turnover ratios
  - Holding cost analysis
  - Supplier performance metrics
  - Demand forecasting
  - Budget variance analysis

## 💰 ACCOUNTANT FEATURES

### 1. FINANCIAL DASHBOARD
#### **Accountant Dashboard**
- **Component**: `accountant/AccountantDashboard.jsx`
- **Endpoint**: `GET /api/accountant/dashboard`
- **Features**:
  - Financial overview
  - Revenue and expense summaries
  - Cash flow indicators
  - Budget status
  - Key financial ratios

#### **Fee Management**
- **Component**: `accountant/FeeManagement.jsx`
- **Endpoint**: `GET/POST /api/accountant/fees`
- **Features**:
  - Fee structure setup
  - Student fee records
  - Payment status tracking
  - Outstanding balances
  - Fee adjustments

### 2. PAYMENT PROCESSING
#### **Payment History**
- **Component**: `accountant/PaymentHistory.jsx`
- **Endpoint**: `GET /api/accountant/payments`
- **Features**:
  - Transaction records
  - Payment method analysis
  - Reconciliation tools
  - Receipt generation
  - Refund processing

#### **Revenue Management**
- **Component**: `accountant/RevenueManagement.jsx`
- **Endpoint**: `GET /api/accountant/revenue`
- **Features**:
  - Income sources tracking
  - Revenue recognition
  - Period comparisons
  - Forecasting tools
  - Performance metrics

### 3. EXPENSE MANAGEMENT
#### **Expense Tracking**
- **Component**: `accountant/Expenses.jsx`
- **Endpoint**: `GET/POST /api/expenses`
- **Features**:
  - Expense categorization
  - Approval workflows
  - Budget allocation
  - Receipt attachment
  - Reimbursement processing

#### **Budget Management**
- **Component**: `accountant/BudgetManagement.jsx`
- **Endpoint**: `GET/POST /api/accountant/budgets`
- **Features**:
  - Budget creation
  - Departmental allocation
  - Variance analysis
  - Budget vs actual
  - Forecasting

### 4. FINANCIAL REPORTING
#### **Financial Reports**
- **Component**: `accountant/FinancialReports.jsx`
- **Endpoint**: `GET /api/accountant/reports`
- **Features**:
  - Income statements
  - Balance sheets
  - Cash flow statements
  - Trial balances
  - Custom reports

#### **Database Export**
- **Component**: `accountant/DatabaseExport.jsx`
- **Endpoint**: `GET /api/accountant-export/data`
- **Features**:
  - Financial data export
  - Multiple format support
  - Scheduled exports
  - Data validation
  - Archive management

## 🗄️ DATABASE SCHEMA (SPECIALIZED ROLES)

### Inventory Table
```sql
CREATE TABLE inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_code TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit TEXT,
  current_stock REAL DEFAULT 0,
  minimum_stock REAL DEFAULT 0,
  maximum_stock REAL,
  unit_cost REAL,
  supplier_id INTEGER,
  location TEXT,
  expiry_date DATE,
  status TEXT DEFAULT 'active', -- active, inactive, discontinued
  created_by INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES vendors(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Stock Movements Table
```sql
CREATE TABLE stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER NOT NULL,
  movement_type TEXT NOT NULL, -- in, out, transfer, adjustment
  quantity REAL NOT NULL,
  reference_number TEXT,
  reference_type TEXT, -- purchase, issue, transfer, adjustment
  from_location TEXT,
  to_location TEXT,
  reason TEXT,
  performed_by INTEGER NOT NULL,
  movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (item_id) REFERENCES inventory(id),
  FOREIGN KEY (performed_by) REFERENCES users(id)
);
```

### Vendors Table
```sql
CREATE TABLE vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  payment_terms TEXT,
  tax_id TEXT,
  status TEXT DEFAULT 'active', -- active, inactive, blacklisted
  rating INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Fees Table
```sql
CREATE TABLE fees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  fee_type TEXT NOT NULL, -- tuition, examination, library, laboratory
  amount REAL NOT NULL,
  due_date DATE,
  paid_amount REAL DEFAULT 0,
  balance REAL,
  status TEXT DEFAULT 'pending', -- pending, paid, partial, overdue
  payment_method TEXT,
  receipt_number TEXT,
  academic_year TEXT,
  semester TEXT,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_type TEXT NOT NULL, -- salary, utilities, maintenance, supplies
  description TEXT,
  amount REAL NOT NULL,
  expense_date DATE,
  department TEXT,
  approved_by INTEGER,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, paid
  receipt_url TEXT,
  vendor_id INTEGER,
  budget_category TEXT,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## 🎨 FRONTEND ARCHITECTURE (SPECIALIZED ROLES)

### Storekeeper Component Structure
```
src/pages/storekeeper/
├── StorekeeperDashboard.jsx   # Main dashboard
├── Inventory.jsx            # Inventory management
├── ItemManagement.jsx       # Item CRUD operations
├── StockOperations.jsx      # Stock movements
├── VendorManagement.jsx     # Supplier management
├── PurchaseOrders.jsx      # Procurement
├── Requirements.jsx        # Requirements tracking
└── InventoryReports.jsx    # Analytics & reports
```

### Accountant Component Structure
```
src/pages/accountant/
├── AccountantDashboard.jsx  # Financial dashboard
├── FeeManagement.jsx       # Fee processing
├── PaymentHistory.jsx      # Payment tracking
├── RevenueManagement.jsx    # Revenue analysis
├── Expenses.jsx           # Expense tracking
├── BudgetManagement.jsx    # Budget control
├── FinancialReports.jsx    # Financial reporting
├── DatabaseExport.jsx     # Data export
└── Inventory.jsx          # Inventory oversight
```

## 🔄 API FLOWS (SPECIALIZED ROLES)

### Inventory Management Flow
1. **Frontend**: `Inventory.jsx` → Update stock
2. **API**: `POST /api/storekeeper/stock-movement`
3. **Controller**: `storekeeperController.recordMovement`
4. **Database**: Update inventory → Record movement → Check alerts
5. **Response**: Movement confirmation + updated stock
6. **Frontend**: Update UI → Send notifications

### Fee Processing Flow
1. **Frontend**: `FeeManagement.jsx` → Record payment
2. **API**: `POST /api/accountant/process-payment`
3. **Controller**: `accountantController.processPayment`
4. **Database**: Update fee → Record transaction → Generate receipt
5. **Response**: Payment confirmation + receipt details
6. **Frontend**: Update payment history → Show receipt

### Expense Approval Flow
1. **Frontend**: `Expenses.jsx` → Review expense
2. **API**: `POST /api/accountant/approve-expense`
3. **Controller**: `accountantController.approveExpense`
4. **Database**: Update expense → Check budget → Send notifications
5. **Response**: Approval confirmation
6. **Frontend**: Update expense status → Update budget

## 📊 ANALYTICS & REPORTING

### Inventory Analytics
- Stock turnover analysis
- Holding cost calculations
- Supplier performance metrics
- Demand forecasting
- ABC analysis (categorization)

### Financial Analytics
- Revenue trend analysis
- Expense pattern analysis
- Cash flow projections
- Budget variance analysis
- Profitability analysis

### Operational Reports
- Inventory valuation reports
- Supplier performance reports
- Fee collection reports
- Expense analysis reports
- Budget execution reports

## 🔧 TECHNICAL ARCHITECTURE

### Backend Architecture
```
server/
├── server.js                 # Main application server
├── config/
│   ├── sqlite-db.js          # Database configuration
│   └── .env                 # Environment variables
├── controllers/
│   ├── superAdminController.js
│   ├── adminController.js
│   ├── mentorController.js
│   ├── studentController.js
│   ├── storekeeperController.js
│   └── accountantController.js
├── routes/
│   ├── superadminRoutes.js
│   ├── adminRoutes.js
│   ├── studentRoutes.js
│   ├── storekeeperRoutes.js
│   ├── accountantRoutes.js
│   └── universalRoutes.js
├── middleware/
│   ├── authMiddleware.js     # Authentication
│   └── languageMiddleware.js  # Internationalization
├── models/                  # Data models
├── utils/                   # Utility functions
└── uploads/                  # File storage
```

### Frontend Architecture
```
client/
├── src/
│   ├── components/            # Reusable components
│   ├── pages/               # Page components by role
│   ├── auth/                # Authentication logic
│   ├── services/            # API services
│   ├── utils/               # Utility functions
│   ├── context/             # React contexts
│   └── styles/              # CSS/Tailwind
├── public/                  # Static assets
└── package.json             # Dependencies
```

### Database Design
- **Primary Database**: SQLite
- **Connection Pooling**: Connection management
- **Migrations**: Schema versioning
- **Backups**: Automated backup system
- **Indexes**: Performance optimization

### API Architecture
- **RESTful Design**: Standard HTTP methods
- **JSON Format**: Request/response format
- **Error Handling**: Consistent error responses
- **Rate Limiting**: API protection
- **Documentation**: API specification

## 🔐 SECURITY IMPLEMENTATION

### Authentication & Authorization
- **JWT Tokens**: Secure session management
- **Role-Based Access**: Permission control
- **Password Encryption**: Bcrypt hashing
- **Session Management**: Secure sessions
- **API Security**: Request validation

### Data Protection
- **Input Validation**: XSS prevention
- **SQL Injection Protection**: Parameterized queries
- **File Upload Security**: Type and size validation
- **Data Encryption**: Sensitive data protection
- **Audit Logging**: Activity tracking

## 🚀 DEPLOYMENT ARCHITECTURE

### Development Environment
- **Frontend**: Vite development server (localhost:5174)
- **Backend**: Node.js server (localhost:5002)
- **Database**: SQLite file-based storage
- **Hot Reload**: Development efficiency

### Production Considerations
- **Frontend**: Static file hosting
- **Backend**: Node.js process management
- **Database**: Production SQLite setup
- **Load Balancing**: Horizontal scaling
- **Monitoring**: Application health

## 📈 PERFORMANCE OPTIMIZATION

### Frontend Optimization
- **Code Splitting**: Lazy loading
- **Asset Optimization**: Compression and caching
- **Bundle Analysis**: Size optimization
- **Service Workers**: Offline support
- **CDN Integration**: Content delivery

### Backend Optimization
- **Database Indexing**: Query performance
- **Connection Pooling**: Resource management
- **Caching Strategy**: Redis integration
- **API Response Optimization**: Pagination
- **Background Jobs**: Async processing

## 🔧 INTEGRATION POINTS

### Third-Party Services
- **Payment Gateway**: Financial transactions
- **Email Service**: Notifications
- **File Storage**: Cloud storage
- **SMS Service**: Text notifications
- **Analytics**: Usage tracking

### External Systems
- **Student Information System**: Data synchronization
- **Financial System**: Accounting integration
- **Library System**: Resource management
- **HR System**: Staff management
- **Learning Management**: Educational content

## 🎯 PERMISSIONS SUMMARY

### Storekeeper Permissions
| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Inventory | ✅ | ✅ | ✅ | ✅ |
| Stock Movements | ✅ | ✅ | ✅ | ❌ |
| Vendors | ✅ | ✅ | ✅ | ✅ |
| Purchase Orders | ✅ | ✅ | ✅ | ✅ |
| Reports | ❌ | ✅ | ❌ | ❌ |

### Accountant Permissions
| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Fees | ✅ | ✅ | ✅ | ❌ |
| Payments | ✅ | ✅ | ✅ | ❌ |
| Expenses | ✅ | ✅ | ✅ | ✅ |
| Budgets | ✅ | ✅ | ✅ | ✅ |
| Reports | ❌ | ✅ | ❌ | ❌ |

## 🌐 INTERNATIONALIZATION & LOCALIZATION

### Multi-Language Support
- **Translation System**: Dynamic language switching
- **Localized Content**: Region-specific content
- **Date/Time Formats**: Local formatting
- **Currency Support**: Multi-currency handling
- **RTL Support**: Right-to-left languages

### Translation Management
- **Translation Files**: JSON-based translations
- **Dynamic Loading**: On-demand translation
- **Fallback Mechanism**: Default language support
- **Admin Interface**: Translation management
- **Quality Assurance**: Translation validation

## 📱 MOBILE RESPONSIVENESS

### Responsive Design
- **Mobile-First**: Progressive enhancement
- **Touch Interface**: Mobile-optimized interactions
- **Offline Support**: PWA capabilities
- **Performance**: Mobile optimization
- **Accessibility**: WCAG compliance

### Mobile Features
- **Push Notifications**: Real-time alerts
- **Offline Mode**: Cached content access
- **Touch Gestures**: Intuitive navigation
- **Camera Integration**: Document scanning
- **Location Services**: Context-aware features

## 🔮 FUTURE ENHANCEMENTS

### Planned Features
- **AI-Powered Analytics**: Predictive insights
- **Blockchain Integration**: Credential verification
- **IoT Integration**: Smart classroom features
- **Virtual Reality**: Immersive learning
- **Machine Learning**: Personalized learning paths

### Scalability Plans
- **Microservices Architecture**: Service decomposition
- **Container Deployment**: Docker/Kubernetes
- **Database Scaling**: Read replicas
- **Global CDN**: Content distribution
- **Auto-Scaling**: Dynamic resource allocation

---

# 📋 CONCLUSION

This comprehensive documentation covers the complete LMS PROTOTYPE 2 system, detailing all user roles, features, API flows, database schemas, and technical architecture. The system provides a robust, scalable, and user-friendly learning management solution with:

## 🎯 KEY STRENGTHS

1. **Role-Based Architecture**: Clear separation of responsibilities
2. **Comprehensive Feature Set**: Complete educational workflow
3. **Modern UI/UX**: Responsive, intuitive interfaces
4. **Scalable Design**: Built for growth and expansion
5. **Security First**: Robust authentication and authorization
6. **Data-Driven**: Comprehensive analytics and reporting
7. **Integration Ready**: Extensible architecture

## 🚀 DEPLOYMENT READY

The system is production-ready with:
- ✅ Complete frontend and backend implementation
- ✅ Database schema and migrations
- ✅ API documentation and testing
- ✅ Security measures and best practices
- ✅ Performance optimizations
- ✅ Mobile responsiveness
- ✅ Internationalization support

## 📞 SUPPORT & MAINTENANCE

For technical support, maintenance, or enhancements:
- **Code Repository**: Version-controlled source code
- **Documentation**: Comprehensive technical docs
- **Testing Framework**: Automated testing suite
- **Monitoring**: Application health tracking
- **Backup Strategy**: Data protection measures

---

*End of Documentation - LMS PROTOTYPE 2 Comprehensive Guide*
