# Multi-Tenancy Implementation Guide

## Problem Statement
Currently, the system doesn't isolate data by university. This means:
- Users from different universities can see each other's data
- Teachers can see courses from different universities
- Financial data is not separated

## Solution: Add `university_id` to Users Table

### Step 1: Add Column to Users Table
```sql
ALTER TABLE users ADD COLUMN university_id INTEGER DEFAULT 1;
ALTER TABLE users ADD FOREIGN KEY (university_id) REFERENCES universities(id);
```

### Step 2: Update Routes for University Filtering

Every SELECT query must include `WHERE university_id = ?` filter using the user's university.

#### Examples:

**Before:**
```js
const students = db.prepare('SELECT * FROM students').all();
```

**After:**
```js
const students = db.prepare('SELECT * FROM students WHERE university_id = ?').all(req.user.universityId);
```

### Step 3: Update Routes to Include `university_id` in Inserts

When creating new records, include the user's university_id:

**Before:**
```js
db.prepare('INSERT INTO students (name, email, grade) VALUES (?, ?, ?)').run(name, email, grade);
```

**After:**
```js
db.prepare('INSERT INTO students (name, email, grade, university_id) VALUES (?, ?, ?, ?)').run(name, email, grade, req.user.universityId);
```

### Step 4: Update JWT Token to Include University

In auth-routes.js, when generating JWT token:

**Before:**
```js
const token = jwt.sign({ userId: user.id, role: user.role }, SECRET);
```

**After:**
```js
const token = jwt.sign({ userId: user.id, role: user.role, universityId: user.university_id }, SECRET);
```

### Step 5: Extract University from Token in Middleware

In authMiddleware.js:

```js
const decoded = jwt.verify(token, SECRET);
req.user = {
  userId: decoded.userId,
  role: decoded.role,
  universityId: decoded.universityId,
};
```

## Tables Requiring University Filtering

These tables need `university_id` column and WHERE clause filtering:
- students
- teachers  
- classrooms
- courses
- announcements
- assessments
- chapters
- materials
- attendance
- results
- assessments
- calendar
- live_classes
- expenses
- payments
- orders
- inventory
- requirements

## Universal Routes Affected

The universalRoutes.js file handles CRUD for all entities. It needs:
1. Extract `universityId` from `req.user`
2. Add `university_id` to INSERT queries
3. Add `WHERE university_id = ?` to SELECT queries
4. Add `WHERE university_id = ?` to UPDATE queries
5. Add `WHERE university_id = ?` to DELETE queries

## Accountant & Storekeeper Dashboards

Once users have `university_id`, the dashboard endpoints can aggregate data:

```js
// Accountant dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
  const universityId = req.user.universityId;
  
  // Get revenue by summing payments for this university
  const payments = db.prepare(
    'SELECT SUM(amount) as total FROM payments WHERE university_id = ?'
  ).get(universityId);
  
  // Get expenses
  const expenses = db.prepare(
    'SELECT SUM(amount) as total FROM expenses WHERE university_id = ?'
  ).get(universityId);
  
  res.json({
    totalRevenue: payments?.total || 0,
    totalExpenses: expenses?.total || 0,
    // ... more data
  });
});
```

## Admin Dashboard

The admin dashboard at `/admin/dashboard` should also aggregate university-specific data once university_id is available.

## SuperAdmin Portal

SuperAdmin should:
1. See all universities
2. Click on university to see admin/accountant for that university
3. Dashboard should show data per university (not aggregate all)

## Login & Redirect Flow

```
User logs in with email/password
  ↓
Check user's role AND university_id
  ↓
Issue JWT token with both role and universityId
  ↓
Frontend reads token
  ↓
Redirect based on role:
  - admin → /admin/dashboard (sees only their university's data)
  - accountant → /accountant/dashboard (sees only their university's data)
  - storekeeper → /storekeeper/dashboard (sees only their university's data)
  - mentor → /mentor/dashboard
  - teacher → /teacher/dashboard
  - student → /student/dashboard
  ↓
All API calls include Authorization header with token
  ↓
Backend extracts universityId from token and filters all queries
```

## Testing Checklist

- [ ] Add university_id column to users table
- [ ] Update auth routes to include universityId in JWT token
- [ ] Update authMiddleware to extract universityId from token
- [ ] Update universalRoutes to filter by universityId
- [ ] Update student routes to filter by universityId
- [ ] Update course routes to filter by universityId
- [ ] Update attendance routes to filter by universityId
- [ ] Update payment routes to filter by universityId
- [ ] Update accountant dashboard to use real data (filtered by universityId)
- [ ] Update storekeeper dashboard to use real data (filtered by universityId)
- [ ] Update admin dashboard to use real data (filtered by universityId)
- [ ] Create two universities and two sets of users
- [ ] Login as user in University 1, verify they only see University 1 data
- [ ] Login as user in University 2, verify they only see University 2 data
- [ ] Verify no cross-university data leakage
