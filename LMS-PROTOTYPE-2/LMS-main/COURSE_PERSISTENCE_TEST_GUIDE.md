# Course Persistence Testing Guide

## Overview
This document provides steps to test course creation and persistence in classrooms. When a class teacher creates a course inside a classroom, it should be stored in the database and display every time inside that classroom.

## Prerequisites
- Backend server running on port 5002 (`npm start` in server directory)
- Frontend server running on port 5174 (`npm run dev` in client directory)
- Database initialized with tables (courses, classrooms, users, etc.)
- Browser access to http://localhost:5174

## Test Scenario 1: Create Course in Classroom

### Steps:
1. **Open Frontend**
   - Navigate to http://localhost:5174
   - Login as an ADMIN or MENTOR user
   - Ensure you have at least one classroom created

2. **Navigate to Classroom**
   - Go to Admin → Classrooms (or Mentor Dashboard)
   - Click on any classroom to open its details page

3. **Create a Course**
   - Click "Create Course" button
   - Fill in the form:
     - **Title**: "Advanced JavaScript" (or any title)
     - **Description**: "Learn JavaScript basics and advanced concepts"
     - **Category**: "Programming" (or any category)
     - **Duration**: "30" (hours)
     - **Course Teacher**: Select from dropdown
   - Click "Submit" button

4. **Verify Immediate Display**
   - ✅ Success toast should appear: "Course created successfully!"
   - ✅ Course should appear in the "Courses in this Classroom" section
   - ✅ Course should show:
     - Title: "Advanced JavaScript"
     - Teacher name
     - Number of students (auto-assigned from classroom)
     - Duration/Category

### Expected Result:
- Course appears immediately in the UI
- No errors in browser console
- Backend logs show successful course creation
- Database INSERT executed successfully

---

## Test Scenario 2: Verify Course Persists on Page Refresh

### Steps:
1. **After Creating Course** (from Scenario 1)
   - Press F5 or click refresh button
   - Page should reload and fetch courses from database

2. **Verify Course Still Displays**
   - ✅ Course should still appear in the list
   - ✅ All course details should be intact
   - ✅ Course should have the correct classroom ID in database

### Expected Result:
- Course persists after page refresh
- No data loss
- Course data is correctly stored in database

---

## Test Scenario 3: Create Multiple Courses in Same Classroom

### Steps:
1. **Create First Course** (from Scenario 1)
   - Follow steps to create "Advanced JavaScript"
   
2. **Create Second Course**
   - Click "Create Course" again
   - Fill form with different data:
     - **Title**: "Web Development Fundamentals"
     - **Description**: "Learn HTML, CSS, JavaScript"
     - **Category**: "Web"
     - **Duration**: "40"
     - **Course Teacher**: Select from dropdown
   - Click "Submit"

3. **Verify Both Courses Display**
   - ✅ Both courses should appear in the list
   - ✅ Each course should have its own data
   - ✅ No duplication or data mixing

### Expected Result:
- Multiple courses can be created in the same classroom
- Each course maintains its own data
- All courses display correctly

---

## Test Scenario 4: Student Auto-Assignment

### Steps:
1. **Before Creating Course**
   - Go to a classroom that has students assigned
   - Note the number of students in the classroom

2. **Create Course**
   - Follow Scenario 1 steps
   - After course creation, check student count

3. **Verify Student Assignment**
   - ✅ Course should show same number of students as classroom
   - ✅ Students should be auto-assigned from classroom
   - ✅ Student names should be visible in course details

### Expected Result:
- Students from classroom are automatically assigned to new course
- Student count matches classroom student count
- All students appear in course data

---

## Backend Verification Checklist

### API Endpoints
- [ ] POST `/api/courses/create-course` - Returns `{ message, course: {...} }`
- [ ] GET `/api/courses/classroom?classroomId=X` - Returns array of courses
- [ ] GET `/api/courses/classroom/:classroomId` - Alternative route format works

### Database Checks
- [ ] courses table exists with columns: id, title, description, mentorId, classroomId, category, duration
- [ ] New courses have classroomId value populated
- [ ] course_students table populated with auto-assigned students
- [ ] Foreign keys maintained (mentorId → users, classroomId → classrooms)

### Code Files
- [ ] [server/controllers/course-controller.js](server/controllers/course-controller.js#L33) - createCourse function:
  - Accepts classroomId in request body
  - Saves classroomId to database
  - Auto-assigns classroom students
  - Returns proper response format
  
- [ ] [server/controllers/course-controller.js](server/controllers/course-controller.js#L442) - getCoursesByClassroom function:
  - Accepts both route params and query params
  - Filters courses by classroomId
  - Fetches student data for each course

- [ ] [server/routes/course-routes.js](server/routes/course-routes.js#L28) - Route registration:
  - POST `/create-course` - createCourse handler
  - GET `/classroom/:classroomId` - getCoursesByClassroom handler

### Frontend Verification
- [ ] [client/src/pages/mentor/ClassroomDetail.jsx](client/src/pages/mentor/ClassroomDetail.jsx#L74) - useEffect:
  - Fetches courses on component mount
  - Uses query parameter: `?classroomId=${classroomId}`

- [ ] [client/src/pages/mentor/ClassroomDetail.jsx](client/src/pages/mentor/ClassroomDetail.jsx#L130) - handleCreateCourse:
  - Sends classroomId in request body
  - Properly extracts course from response: `const newCourse = response.course || response;`
  - Adds course to state immediately
  - Shows success toast

---

## Troubleshooting

### Issue: Course doesn't appear after creation
**Solution:**
1. Check browser console for errors (F12 → Console tab)
2. Check backend terminal for error logs
3. Verify classroomId is being sent in request body
4. Verify API returns `{ message, course: {...} }` format

### Issue: Course appears but disappears on refresh
**Solution:**
1. Check database: `sqlite3 database.db "SELECT * FROM courses;"`
2. Verify classroomId is populated in database
3. Check getCoursesByClassroom query executes without errors
4. Verify course_students table has entries for auto-assigned students

### Issue: Students not assigned to course
**Solution:**
1. Check classroom has students assigned
2. Verify autoAssignStudentsFromClassroom function is called
3. Check course_students table for entries
4. Check backend logs for assignment process

### Issue: Multiple courses show same data
**Solution:**
1. Verify course IDs are unique (id field in courses table)
2. Check mapCourses function adds `_id: course.id`
3. Verify each course has distinct classroomId, title, mentorId

---

## Success Criteria

✅ **All of the following must be true:**

1. ✅ Course creation form submits without errors
2. ✅ API returns proper response with course object
3. ✅ Frontend extracts course and adds to state
4. ✅ Course appears immediately in "Courses in this Classroom" section
5. ✅ Course shows correct title, teacher name, and student count
6. ✅ Course persists after page refresh
7. ✅ Multiple courses can be created in same classroom
8. ✅ Students are auto-assigned from classroom
9. ✅ No console errors on frontend
10. ✅ No database errors in backend logs

---

## Quick Debug Terminal Commands

```bash
# Check if courses exist in database
sqlite3 "path/to/database.db" "SELECT id, title, classroomId FROM courses;"

# Check if students are assigned to courses
sqlite3 "path/to/database.db" "SELECT courseId, studentId FROM course_students;"

# Check all classrooms
sqlite3 "path/to/database.db" "SELECT id, name FROM classrooms;"

# Check all users (mentors/students)
sqlite3 "path/to/database.db" "SELECT id, name, role FROM users WHERE role IN ('mentor', 'student', 'teacher');"
```

---

## Verification Complete

When all test scenarios pass and troubleshooting steps confirm database integrity:

✅ **Course persistence feature is working correctly**
✅ **Feature ready for production use**

---

**Date Tested:** [Current Date]
**Tester:** [Your Name]
**Status:** ⏳ Ready for Testing
