# 🧪 QUICK TESTING GUIDE - CLASSROOM & FEE UPDATES

## Prerequisites
- Backend server running on `localhost:5000`
- Frontend server running on `localhost:5174`
- Logged in as a mentor/class teacher
- Sample data created (classrooms, students, mentors)

---

## TEST 1: Classroom Cards View

### Steps:
1. Login to LMS as mentor
2. Navigate to "My Classrooms" from sidebar
3. Look for classroom cards (not expandable rows)

### Expected Results:
- ✅ See multiple classroom cards in a grid layout
- ✅ Each card shows: classroom name, section, grade, student count, class teacher
- ✅ Cards have blue gradient background
- ✅ Cards are clickable with hover effect
- ✅ "Click to manage classroom" text appears at bottom

### If Failed:
- Check browser console for errors
- Verify classrooms are assigned to the mentor
- Check `/mentor/classrooms` route is correct

---

## TEST 2: Entering Classroom (ClassroomDetail)

### Steps:
1. Click on any classroom card
2. You should navigate to classroom detail page
3. See classroom name in header with back button

### Expected Results:
- ✅ New page loads with classroom name and section
- ✅ Back arrow button visible in top left
- ✅ 4 colorful action buttons visible:
  - Blue: Create Course
  - Green: Assign Students
  - Yellow: Attendance
  - Purple: Add Result
- ✅ Course section below (empty if no courses)

### If Failed:
- Check URL: Should be `/mentor/classroom/{classroomId}`
- Check browser console for 404 errors
- Verify classroom ID is being passed correctly

---

## TEST 3: Create Course in Classroom

### Steps:
1. Inside classroom detail page
2. Click "Create Course" button (blue)
3. Modal should open

### Form Fields to Check:
- ✅ Course Title (text input)
- ✅ Description (textarea)
- ✅ Category (dropdown)
- ✅ Duration in weeks (number input)
- ✅ **Course Teacher** (dropdown - THIS WAS FIXED)
- ✅ Assign Students (checkboxes)

### Create a Course:
1. Fill all required fields:
   - Title: "English 101"
   - Description: "Basic English course"
   - Category: "English"
   - Duration: "12"
   - Course Teacher: Select any mentor name
2. (Optional) Check some students to assign
3. Click "Create Course"

### Expected Results:
- ✅ Success toast notification appears
- ✅ Modal closes
- ✅ Course appears in the course list below
- ✅ Course card shows: title, description, student count, course teacher name, category

### If Failed:
- Check course teacher dropdown is populated (fix was: fetch mentors on load)
- Check network tab for 400/500 errors
- Verify course creation endpoint is working

---

## TEST 4: Assign Students to Classroom

### Steps:
1. Inside classroom detail page
2. Click "Assign Students" button (green)
3. Modal should open with student list

### Assign Students:
1. Check boxes next to student names
2. Select 2-3 students
3. Click "Assign Students"

### Expected Results:
- ✅ Success toast notification
- ✅ Modal closes
- ✅ Student list updates in classroom (if visible)
- ✅ **For Each Assigned Student**: PayFees page should now show their classroom's fee structure

### Test Student Fee Update:
1. Open another browser window/incognito
2. Login as the student you just assigned
3. Navigate to "Pay Fees"
4. **Check**: Student should see the classroom's fee structure (not default fees)

### If Failed:
- Check student assignment endpoint: `POST /api/classrooms/assign-student`
- Verify student can see their classroom
- Check PayFees for errors in fetching classroom data

---

## TEST 5: Attendance Management

### Steps:
1. Inside classroom detail page
2. Click "Attendance" button (yellow)
3. Should navigate to `/mentor/attendance`

### Expected Results:
- ✅ Attendance page loads
- ✅ Classroom is pre-selected from URL parameter
- ✅ Student list appears
- ✅ Can mark Present/Absent with radio buttons
- ✅ Can save attendance

### If Failed:
- Check URL includes classroomId parameter
- Verify attendance route exists
- Check network requests

---

## TEST 6: Results Management

### Steps:
1. Inside classroom detail page
2. Click "Add Result" button (purple)
3. Should navigate to `/mentor/results`

### Expected Results:
- ✅ Results page loads
- ✅ Classroom is pre-selected
- ✅ Can add new results
- ✅ Can edit/delete results

### If Failed:
- Check URL includes classroomId parameter
- Verify results route exists

---

## TEST 7: Course List in Classroom

### Steps:
1. Inside classroom detail page
2. Scroll down below the 4 action buttons
3. Should see "Courses in this Classroom" section

### Expected Results:
- ✅ Grid of course cards visible
- ✅ Each card shows:
  - Course title
  - Description (truncated)
  - Course teacher name
  - Total students in course
  - Category (if exists)
- ✅ Cards are clickable (click to manage course)

### Course Click Test:
1. Click on any course card
2. Should navigate to `/mentor/course/{courseId}`
3. Course teacher portal should load

### If Failed:
- Check courses are being fetched for the classroom
- Verify course IDs are correct
- Check course teacher name is populated

---

## TEST 8: Student Fee Structure Auto-Update

### Prerequisites:
- Student assigned to a classroom (from Test 4)
- Classroom has fee structure set

### Steps:
1. Login as a student
2. Navigate to "Pay Fees" section
3. Check if classroom is displayed
4. Check if fee structure matches the classroom

### Expected Results:
- ✅ Student's assigned classroom is shown
- ✅ Fee structure is based on the classroom (not default)
- ✅ All fee fields are populated:
  - Tuition Fee
  - Transport Fee
  - Computer Lab Fee
  - Library Fee
  - Sports Fee
  - Examination Fee
  - Miscellaneous Fee
- ✅ Total fees = sum of all fees
- ✅ Charts and visualizations work

### If Failed:
- Check student-classroom relationship is saved
- Verify classroom fee structure endpoint works
- Check network tab for API errors
- Test with: `curl http://localhost:5000/api/classrooms/{classroomId}/fee-structure`

---

## TEST 9: Mentor Dropdown Fix

### Steps:
1. Inside ClassroomDetail, click "Create Course"
2. Check "Course Teacher" dropdown
3. It should have the fix - mentors should be visible

### Expected Results:
- ✅ Dropdown shows "Select a mentor" placeholder
- ✅ List of mentors is populated (name and email)
- ✅ Can select any mentor
- ✅ Selected mentor is saved with course

### If Failed:
- Check fetchMentors() is called in useEffect
- Verify mentors API endpoint works
- Check mentors array is being populated

---

## DEBUGGING CHECKLIST

If tests fail, check these:

### Frontend Issues:
```bash
# 1. Open browser console (F12)
# 2. Check for JavaScript errors
# 3. Check Network tab for API errors (4xx, 5xx)
# 4. Check if routes exist in App.jsx
# 5. Check component imports are correct
```

### Backend Issues:
```bash
# 1. Check server is running: curl http://localhost:5000/api
# 2. Check endpoint exists: curl http://localhost:5000/api/classrooms/my-classrooms
# 3. Check database: Verify tables exist
# 4. Check authorization headers are sent
# 5. Check console for database errors
```

### API Testing:
```bash
# Test classroom detail endpoint:
curl http://localhost:5000/api/classrooms/{id} \
  -H "Authorization: Bearer {token}"

# Test fee structure endpoint:
curl http://localhost:5000/api/classrooms/{id}/fee-structure \
  -H "Authorization: Bearer {token}"

# Test student classrooms:
curl http://localhost:5000/api/classrooms/student-classrooms \
  -H "Authorization: Bearer {token}"

# Test assign student endpoint:
curl -X POST http://localhost:5000/api/classrooms/assign-student \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"classroomId": "xxx", "studentId": "yyy"}'
```

---

## EXPECTED BEHAVIOR SUMMARY

| Action | Before | After |
|--------|--------|-------|
| View classrooms | Expandable rows | Clickable cards |
| Create course | Modal in MentorClassrooms | ClassroomDetail page |
| Mentor selection | No mentors visible | Mentors visible in dropdown |
| Student fees | Based on grade | Based on assigned classroom |
| Classroom access | Single view | Multi-action dashboard |

---

## SUCCESS CRITERIA

All tests pass when:
- ✅ Classroom cards display correctly
- ✅ ClassroomDetail page loads without errors
- ✅ Create Course modal shows mentor dropdown
- ✅ Mentors are visible and selectable
- ✅ Courses appear after creation
- ✅ Students can be assigned to classrooms
- ✅ Student fee structure updates automatically
- ✅ All 4 action buttons navigate correctly

---

## NOTES

- Some features (attendance, results) may already exist and just need to pre-populate classroom ID
- Fee structure fields might need to be added to classroom model if not present
- Student-classroom assignment might use different table/field names in your DB
- Always check browser console and server logs for detailed error messages

---

**Testing Time**: ~15-20 minutes for all tests  
**Required Roles**: Mentor (class teacher), Student, Admin  
**Status**: Ready for testing
