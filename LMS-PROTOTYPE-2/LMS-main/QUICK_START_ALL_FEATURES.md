# QUICK START - Admin Creates Classroom & Teacher Creates Course

## 🚀 Quick Setup (5 Minutes)

### Prerequisites
- ✅ Frontend running on http://localhost:5174
- ✅ Backend running on http://localhost:5002
- ✅ Both servers started

---

## STEP 1: Admin Creates Classroom (30 seconds)

1. **Go to**: http://localhost:5174
2. **Login**: Click "Login" → Select **Admin** role
3. **Dashboard Opens**: Go to **Classrooms** section
4. **Click**: "Create Classroom" button
5. **Fill Form**:
   - Grade: `10`
   - Section: `A`
   - Class Teacher: `Mr. John Smith`
   - Students: (optional - select if available)
6. **Click**: "Create" button
7. **✅ Classroom Created!** Appears instantly in list

---

## STEP 2: Teacher Creates Course (30 seconds)

### OPTION A: Login as Mentor
1. **Go to**: http://localhost:5174
2. **Login**: Click "Login" → Select **Mentor** role
3. **Dashboard**: Goes to Mentor Dashboard
4. **Click**: "Course Management" or "Create Course"
5. **Fill Form**:
   - Course Title: `Mathematics - Algebra`
   - Category: `Science`
   - Duration: `30` (hours)
   - Course Teacher: Select from dropdown
   - Students: (optional - select if available)
6. **Click**: "Create"
7. **✅ Course Created!** Appears in mentor's course list

### OPTION B: From Classroom
1. **From Admin**: Click on Classroom card
2. **In Classroom**: Click "Create Course" button
3. **Fill same form** as Option A
4. **Click**: "Create"
5. **✅ Done!**

---

## STEP 3: Verify Data Syncs to Student Portal

1. **Go to**: http://localhost:5174
2. **Login**: Select **Student** role
3. **Check**:
   - Dashboard → "My Classroom" → Should show the classroom you created
   - Dashboard → "Courses" → Should show the course you created
4. **✅ Verified!**

---

## STEP 4: Test Course Access by Student

1. **Still as Student**:
   - Click on classroom or course
   - See course details
   - (Materials will appear after teacher adds them)

---

## 🎯 Complete Flow Diagram

```
┌─────────────────┐
│  ADMIN PORTAL   │
│  Create         │
│  Classroom      │
└────────┬────────┘
         │
         ↓
┌──────────────────────┐
│ DATABASE             │
│ - Classroom saved    │
│ - Students assigned  │
└────────┬─────────────┘
         │
         ├─────────────────────┐
         ↓                     ↓
┌──────────────────┐   ┌──────────────────┐
│ MENTOR PORTAL    │   │ STUDENT PORTAL   │
│ See Classroom    │   │ See Classroom    │
│ Create Course    │   │ See Courses      │
└────────┬─────────┘   │ Take Assessment  │
         │             └──────────────────┘
         ↓
┌──────────────────────┐
│ DATABASE             │
│ - Course saved       │
│ - Teacher assigned   │
└────────┬─────────────┘
         │
         ↓
┌──────────────────┐
│ STUDENT PORTAL   │
│ Course appears   │
│ Can enroll       │
└──────────────────┘
```

---

## 🔧 If Something Goes Wrong

### Classroom Not Created?
```
1. Check you're logged in as Admin
2. Check Grade and Section are not empty
3. Reload page (Ctrl+R)
4. Try creating again
```

### Course Not Appearing in Student Portal?
```
1. Wait 5 seconds (auto-sync)
2. Reload student page (F5)
3. Check if you're viewing correct classroom
4. Verify student is assigned to course
```

### Can't Login?
```
1. Check frontend is running (http://localhost:5174)
2. Check backend is running (http://localhost:5002)
3. Try different role
4. Clear browser cache (Ctrl+Shift+Delete)
```

---

## 📝 API Endpoints Used

### Classroom Creation
```
POST /api/classrooms
Body: { name, grade, section, classTeacher }
Response: { success: true, data: { id, name, ... } }
```

### Course Creation
```
POST /api/courses/create-course
Body: { title, description, mentorId, category, duration }
Response: { success: true, data: { id, title, ... } }
```

### Fetch Classrooms
```
GET /api/classrooms
Response: { success: true, data: [...classrooms] }
```

### Fetch Courses by Classroom
```
GET /api/courses/classroom?classroomId=1
Response: [...courses in that classroom]
```

---

## ✅ Success Checklist

- [ ] Admin logged in
- [ ] Classroom created with grade and section
- [ ] Classroom appears in admin dashboard
- [ ] Mentor logged in
- [ ] Course created for that classroom
- [ ] Course appears in mentor's course list
- [ ] Student logged in
- [ ] Classroom visible in student's "My Classroom"
- [ ] Course visible in student's "Courses"
- [ ] Student can click on classroom/course to view details

---

## 🎓 Next Steps

After classrooms and courses are created:

1. **Add Course Materials**: Upload videos, PDFs, documents
2. **Create Assessments**: Add MCQ questions for students to take
3. **Mark Attendance**: Teachers mark daily attendance
4. **Track Progress**: Monitor student progress
5. **Manage Fees**: Set up payment structure

See `COMPLETE_WORKFLOW_GUIDE.md` for full documentation.

---

**System Ready**: ✅ All features working  
**Last Update**: January 27, 2026
