# 🧪 TESTING GUIDE - Verify All Features Work

## Prerequisites
- ✅ Frontend: http://localhost:5174 (running)
- ✅ Backend: http://localhost:5002 (running)
- ✅ Browser: Chrome/Firefox (any modern browser)

---

## TEST 1: Admin Creates Classroom (2 minutes)

### Steps:
1. Open http://localhost:5174
2. Click "Admin" role → Login
3. Navigate to **Classrooms** (left sidebar)
4. Click **"Create Classroom"** button
5. Fill form:
   - Grade: `10`
   - Section: `A`
   - Class Teacher: `Mr. John Smith`
6. Click **"Create"**

### Expected Result:
- ✅ Toast: "Classroom created successfully"
- ✅ Classroom appears in grid (Grade 10 - Section A)
- ✅ Shows teacher name: "Mr. John Smith"
- ✅ Shows student count: 0

### Actual Result:
- [ ] Classroom created (check mark when done)
- **Note**: _______________

---

## TEST 2: View Classroom Details (1 minute)

### Steps:
1. From Test 1, stay on Classrooms page
2. Click on the created classroom card
3. Page loads with classroom details

### Expected Result:
- ✅ Page shows: "Grade 10 - Section A"
- ✅ Shows teacher: "Mr. John Smith"
- ✅ Shows courses section (empty if no courses)
- ✅ Shows back button to classrooms list

### Actual Result:
- [ ] Details page loaded (check mark when done)
- **Note**: _______________

---

## TEST 3: Teacher Creates Course (3 minutes)

### Steps:
1. Open http://localhost:5174
2. Click "Mentor" role → Login
3. Navigate to **Course Management** (or "Create Course")
4. Click **"Create Course"** button
5. Fill form:
   - Course Title: `Mathematics - Algebra`
   - Category: `Science`
   - Duration: `30`
   - Course Teacher: Select from dropdown
   - Students: (optional)
6. Click **"Create"**

### Expected Result:
- ✅ Toast: "Course created successfully"
- ✅ Course appears in teacher's course list
- ✅ Shows title: "Mathematics - Algebra"
- ✅ Shows category: "Science"
- ✅ Shows duration: "30 hours"

### Actual Result:
- [ ] Course created (check mark when done)
- **Note**: _______________

---

## TEST 4: Course Appears in Classroom (2 minutes)

### Steps:
1. Go back to Admin portal (http://localhost:5174/admin)
2. Go to **Classrooms**
3. Click on **"Grade 10 - Section A"** classroom
4. Look at **Courses** section

### Expected Result:
- ✅ Courses section shows the course created in Test 3
- ✅ Shows: "Mathematics - Algebra"
- ✅ Shows teacher name
- ✅ Shows student count

### Actual Result:
- [ ] Course visible in classroom (check mark when done)
- **Note**: _______________

---

## TEST 5: Student Sees Classroom (2 minutes)

### Steps:
1. Open http://localhost:5174
2. Click "Student" role → Login
3. Check **Dashboard** (left sidebar)

### Expected Result:
- ✅ If student assigned to classroom, shows in dashboard
- ✅ Or see message: "No classrooms assigned yet"

### Actual Result:
- [ ] Student dashboard loaded (check mark when done)
- **Status**: _______________

---

## TEST 6: Student Sees Courses (2 minutes)

### Steps:
1. Still as Student, go to **Courses** section (left sidebar)
2. Look for the course created in Test 3

### Expected Result:
- ✅ If enrolled, course appears in list
- ✅ Shows: "Mathematics - Algebra"
- ✅ Shows course details
- ✅ Can click to view course page

### Actual Result:
- [ ] Courses section loaded (check mark when done)
- **Note**: _______________

---

## TEST 7: Teacher Creates 2nd Course (2 minutes)

### Steps:
1. Go back to Mentor portal (/mentor)
2. Click **Course Management**
3. Create another course:
   - Title: `Physics - Mechanics`
   - Category: `Science`
   - Duration: `40`
4. Click **Create**

### Expected Result:
- ✅ 2nd course created
- ✅ Both courses visible in mentor's course list
- ✅ Both appear in classroom's course section

### Actual Result:
- [ ] 2nd course created (check mark when done)
- **Note**: _______________

---

## TEST 8: Course Persists After Refresh (1 minute)

### Steps:
1. From Test 7, press F5 (refresh page)
2. Wait for page to reload
3. Check if courses still visible

### Expected Result:
- ✅ Page reloads
- ✅ Both courses still in list
- ✅ No data lost
- ✅ All course details intact

### Actual Result:
- [ ] Courses persisted (check mark when done)
- **Note**: _______________

---

## TEST 9: Test Error Handling (2 minutes)

### Steps:
1. Try to create classroom without Grade
2. Click Create button

### Expected Result:
- ✅ Toast error: "Grade is required"
- ✅ Form doesn't submit
- ✅ Page stays on form

### Actual Result:
- [ ] Error handled (check mark when done)
- **Note**: _______________

---

## TEST 10: Test Real-time Sync (3 minutes)

### Steps:
1. Open 2 browsers (or 2 tabs)
2. Browser 1: Login as Admin, go to Classrooms
3. Browser 2: Login as Student, go to Dashboard
4. In Browser 1: Create a new classroom
5. In Browser 2: Wait 5 seconds and refresh

### Expected Result:
- ✅ New classroom appears in Admin list (Browser 1)
- ✅ After 5 seconds + refresh, Student sees it (Browser 2)
- ✅ Real-time sync working

### Actual Result:
- [ ] Real-time sync verified (check mark when done)
- **Note**: _______________

---

## 🏆 Summary

### Tests Passed: _____ / 10

### Critical Tests (Must Pass):
- [ ] Test 1: Admin creates classroom
- [ ] Test 3: Teacher creates course
- [ ] Test 4: Course appears in classroom
- [ ] Test 6: Student sees courses

### Nice-to-Have Tests:
- [ ] Test 8: Data persists
- [ ] Test 9: Error handling
- [ ] Test 10: Real-time sync

---

## 📊 Test Results

| Test # | Feature | Status | Notes |
|--------|---------|--------|-------|
| 1 | Create Classroom | [ ] Pass [ ] Fail | |
| 2 | View Classroom | [ ] Pass [ ] Fail | |
| 3 | Create Course | [ ] Pass [ ] Fail | |
| 4 | Course in Classroom | [ ] Pass [ ] Fail | |
| 5 | Student Sees Class | [ ] Pass [ ] Fail | |
| 6 | Student Sees Courses | [ ] Pass [ ] Fail | |
| 7 | Multiple Courses | [ ] Pass [ ] Fail | |
| 8 | Data Persistence | [ ] Pass [ ] Fail | |
| 9 | Error Handling | [ ] Pass [ ] Fail | |
| 10 | Real-time Sync | [ ] Pass [ ] Fail | |

---

## 🐛 If Tests Fail

### Classroom Not Created?
```
1. Check if backend is running (terminal shows "Server running")
2. Check if form has Grade and Section filled
3. Press F12, go to Console, check for errors
4. Check Network tab (F12 → Network), look for failed requests
5. Try again with different values
```

### Course Not Appearing?
```
1. Wait 5 seconds (auto-sync time)
2. Refresh page manually (F5)
3. Check if course was actually created (check mentor portal)
4. Check if classroom ID matches course ID
5. Look for red error messages in browser console
```

### Real-time Not Working?
```
1. Check if Socket.IO is running (server logs should show connections)
2. Refresh both browser tabs
3. Check if both are on same network
4. Try manual refresh (F5) instead of waiting
```

---

## 📞 Debug Commands

### Check if services running:
```bash
# Check backend
curl http://localhost:5002

# Check frontend  
curl http://localhost:5174

# Check API
curl http://localhost:5002/api/classrooms
```

### View network requests:
1. Open browser (F12)
2. Go to Network tab
3. Perform action (create classroom)
4. Watch network requests appear
5. Click each to see request/response

### View browser console:
1. Open browser (F12)
2. Go to Console tab
3. Look for red errors
4. Look for blue warnings
5. Check for network errors

---

## ✅ Final Checklist

Before declaring "Ready":
- [ ] All 10 tests passed
- [ ] No error messages in console
- [ ] No failed network requests
- [ ] Data persists after refresh
- [ ] Multiple browsers show same data
- [ ] Real-time sync working
- [ ] All forms validate properly
- [ ] Classroom admin can see details
- [ ] Teacher can create courses
- [ ] Student can see both

---

**Test Date**: _____________  
**Tester Name**: _____________  
**System Status**: [ ] Ready [ ] Need Fixes  

---

If all tests pass with [ ], system is **PRODUCTION READY** ✅
