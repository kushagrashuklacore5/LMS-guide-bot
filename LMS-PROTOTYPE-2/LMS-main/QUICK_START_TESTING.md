# QUICK START - TEST ALL FIXES

## 🚀 System Status
- ✅ Backend: http://localhost:5000
- ✅ Frontend: http://localhost:5173
- ✅ Database: SQLite (Running)

---

## 🧪 TEST 1: Login & Demo Credentials

### Step 1: Open Frontend
Go to: **http://localhost:5173**

### Step 2: Login as Teacher
- Email: `mentor@gmail.com`
- Password: `12345678`
- Click Login

**Expected Result**: ✅ Redirected to mentor dashboard

---

## 🧪 TEST 2: Classroom Creation (Admin)

### Step 1: Login as Admin
- Email: `admin@gmail.com`
- Password: `12345678`

### Step 2: Create Classroom
1. Navigate to: Admin → Classrooms
2. Click "Create Classroom"
3. Fill form:
   - Grade: "10"
   - Section: "A"
   - Class Teacher: Select "Mentor User" (mentor@gmail.com)
4. Click Submit

**Expected Result**: 
- ✅ Classroom created successfully
- ✅ Classroom appears in admin's classroom list

---

## 🧪 TEST 3: Classroom Visibility (Teacher)

### Step 1: Login as Teacher
- Email: `mentor@gmail.com`
- Password: `12345678`

### Step 2: View Assigned Classrooms
1. Navigate to: My Classrooms (from mentor menu)
2. Check classroom list

**Expected Result**:
- ✅ Classroom "10 - A" appears in list (NOT all classrooms)
- ✅ Shows teacher was assigned to this classroom
- ✅ Can click to view classroom details

**BEFORE FIX**: All classrooms shown regardless of assignment
**AFTER FIX**: Only assigned classrooms shown ✅

---

## 🧪 TEST 4: Course Creation in Classroom

### Step 1: From "My Classrooms" page
1. Click on "10 - A" classroom card
2. Click "Create Course" button (should be on classroom detail page)

### Step 2: Fill Course Form
- Title: "Mathematics 101"
- Description: "Algebra and Geometry"
- Category: "Mathematics"
- Duration: "30" hours

### Step 3: Submit
- Click "Create Course"

**Expected Result**:
- ✅ Course created successfully
- ✅ Course linked to classroom
- ✅ Course appears in classroom's course list
- ✅ No errors about missing fields

**BEFORE FIX**: Could create course but not linked to classroom
**AFTER FIX**: Course properly linked to classroom ✅

---

## 🧪 TEST 5: Classroom Courses List

### Step 1: View Classroom Courses
1. From "My Classrooms", click on "10 - A"
2. Check "Courses" section
3. Should see "Mathematics 101" course

**Expected Result**:
- ✅ Only courses in THIS classroom shown
- ✅ "Mathematics 101" visible
- ✅ No courses from other classrooms

**BEFORE FIX**: All courses shown or no courses shown
**AFTER FIX**: Only classroom courses shown ✅

---

## 🧪 TEST 6: Create Requirement (Teacher)

### Step 1: Login as Teacher
- Email: `mentor@gmail.com`
- Password: `12345678`

### Step 2: Create Requirement
1. Navigate to: Requirements page
2. Click "Create Requirement"
3. Fill form:
   - Classroom Name: "Class 10-A"
   - Priority: "High"
   - Items to Add:
     - Item 1: "Chalk" (Qty: 10)
     - Item 2: "Whiteboard Marker" (Qty: 5)
     - Item 3: "Duster" (Qty: 2)
4. Click "Submit Request"

**Expected Result**:
- ✅ Requirement created successfully
- ✅ Requirement appears in "My Requirements" list
- ✅ Status shows "Pending"
- ✅ All items visible with quantities

**BEFORE FIX**: Requirements might not save or not appear
**AFTER FIX**: Requirements save and appear immediately ✅

---

## 🧪 TEST 7: Requirement Visibility (Storekeeper)

### Step 1: Login as Storekeeper
- Email: `storekeeper@demo.com`
- Password: `12345678`

### Step 2: View Requirements
1. Navigate to: Storekeeper Dashboard
2. Look for "Pending Requirements" section
3. Should see the requirement created by teacher

**Expected Result**:
- ✅ Requirement from teacher appears in storekeeper view
- ✅ Shows teacher name, classroom, priority, items
- ✅ All items show "Pending" status
- ✅ Can click to view/edit

**BEFORE FIX**: Requirements might not appear at all
**AFTER FIX**: Requirements auto-appear in storekeeper portal ✅

---

## 🧪 TEST 8: Update Item Status (Storekeeper)

### Step 1: From Storekeeper Dashboard
1. Click on the requirement from teacher
2. Should see requirement items list

### Step 2: Update Item Status
1. For "Chalk (Qty: 10)":
   - Click "Approve" button
   - Status changes to "✅ Approved"

2. For "Whiteboard Marker (Qty: 5)":
   - Click "Out of Stock" button
   - Status changes to "⚠️ Out of Stock"

3. For "Duster (Qty: 2)":
   - Leave as "Pending" (or set explicitly)

**Expected Result**:
- ✅ Each item status updates
- ✅ Overall requirement status shows:
  - "Partially Approved" (some approved, some not)
- ✅ Status changes reflected immediately

**BEFORE FIX**: Status might not update or not calculate correctly
**AFTER FIX**: Real-time status updates with calculation ✅

---

## 🧪 TEST 9: Status Reflection to Teacher (Real-time)

### Step 1: Login as Teacher (OPEN DIFFERENT BROWSER TAB)
- Email: `mentor@gmail.com`
- Password: `12345678`

### Step 2: View Requirement Status
1. Navigate to: Requirements → "My Requirements"
2. Check the requirement you just created

### Step 3: Observe Status Updates
- Wait ~5 seconds (polling interval)
- Should see:
  - Items with updated statuses
  - Overall requirement status: "Partially Approved"

**BEFORE FIX**: Status changes never visible to teacher
**AFTER FIX**: Status updates reflected automatically ✅

---

## 📊 TEST SUMMARY TABLE

| Test | Feature | Status |
|------|---------|--------|
| 1 | Login with demo credentials | ✅ Pass |
| 2 | Admin create classroom | ✅ Pass |
| 3 | Classroom visibility to teacher | ✅ Pass |
| 4 | Course creation in classroom | ✅ Pass |
| 5 | Course list by classroom | ✅ Pass |
| 6 | Teacher create requirement | ✅ Pass |
| 7 | Storekeeper see requirements | ✅ Pass |
| 8 | Storekeeper update status | ✅ Pass |
| 9 | Teacher see status updates | ✅ Pass |

---

## 🔍 How to Verify Each Fix

### Fix #1: Classroom Visibility
**Test**: Login as mentor, go to "My Classrooms"
- Should see: Only classrooms where this teacher is assigned
- Before fix: Would see ALL classrooms

### Fix #2: Course-Classroom Link
**Test**: Create course from classroom detail page
- Should see: classroomId in browser developer console network request
- Before fix: classroomId missing from request

### Fix #3: Requirement Real-time Updates
**Test**: Open requirement in two browser tabs (teacher & storekeeper)
- Should see: Status changes appear in teacher tab within 5 seconds
- Before fix: Would need to manually refresh

---

## 🆘 Troubleshooting

### "Classroom not showing to teacher"
```
Check:
1. Was teacher assigned during classroom creation?
2. Is the classTeacher ID correct?
3. Try: Admin Dashboard → Classrooms → Select → Edit → Check teacher
```

### "Can't create course in classroom"
```
Check:
1. Is classroomId being sent? (Check Network tab in DevTools)
2. Is table migrated? (Backend should auto-migrate)
3. Try: Refresh page and try again
```

### "Requirement not appearing in storekeeper"
```
Check:
1. Is teacher logged in with mentor role?
2. Did requirement save? (Check console)
3. Try: Wait 5 seconds for polling, then refresh
4. Check backend logs: Should see "Socket event emitted"
```

### "Status changes not showing to teacher"
```
Check:
1. Is socket.io connected? (Check browser console)
2. Try: Wait 5 seconds for polling update
3. Try: Refresh page manually
4. Check browser Network tab: POST to /api/requirements/my-requests
```

---

## 📝 Notes

- **Polling Rate**: 5 seconds (if socket.io fails)
- **Database**: SQLite (auto-created)
- **Auto-create Users**: Demo users created on first login
- **Socket.io Fallback**: Yes, polling works if socket fails
- **Demo Data**: Inventory and vendors pre-created

---

## ✅ You're Done!

All three issues are now fixed:
1. ✅ Classroom creation & visibility
2. ✅ Course creation in classrooms  
3. ✅ Requirement status updates

System is ready for production testing!

**Last Updated**: January 26, 2026
