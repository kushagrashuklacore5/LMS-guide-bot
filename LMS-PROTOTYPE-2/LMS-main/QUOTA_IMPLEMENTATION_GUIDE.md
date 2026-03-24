# Subscription Quota & Feature Restriction Implementation - Complete Guide

## Overview
This document describes the complete implementation of subscription-based quotas and feature restrictions for the LMS platform. The system enforces free-tier quotas for classrooms, students, teachers/mentors, and announcements, with restricted access to export and calendar features.

## Phase Completion Status

### ✅ Phase 1: Data Isolation (COMPLETE)
- Deleted all existing classrooms from database
- Implemented multi-tenant isolation on all shared tables
- Fresh database created with proper `university_id` filtering

### ✅ Phase 2: Quota Enforcement (COMPLETE)
- Created `quotaMiddleware.js` with all quota checks
- Added middleware to all resource creation routes
- Implemented feature access guards for export and calendar
- HTTP 402 (Payment Required) responses for quota exceeded

### ✅ Phase 3: Frontend UI Components (COMPLETE)
- Created `QuotaLimitModal.jsx` React component
- Styled modal with CSS for professional appearance
- Created API error handler utility
- Ready for integration into pages

---

## Technical Implementation Details

### Backend: Quota Middleware (`server/middleware/quotaMiddleware.js`)

#### Quota Limits by Tier
```javascript
const QUOTAS = {
  free: {
    classrooms: 2,
    teachers: 5,
    mentors: 5,
    students: 10,
    announcements: 2,
    exportData: false,
    calendarAccess: false
  },
  standard: {
    classrooms: 10,
    teachers: 25,
    mentors: 25,
    students: 100,
    announcements: 20,
    exportData: true,
    calendarAccess: true
  },
  professional: {
    classrooms: Infinity,
    teachers: Infinity,
    mentors: Infinity,
    students: Infinity,
    announcements: Infinity,
    exportData: true,
    calendarAccess: true
  }
};
```

#### Available Middleware Functions

1. **`checkClassroomQuota`** - Validates classroom creation limit
2. **`checkStudentQuota`** - Validates student creation limit
3. **`checkTeacherQuota`** - Validates teacher creation limit
4. **`checkMentorQuota`** - Validates mentor creation limit
5. **`checkAnnouncementQuota`** - Validates announcement creation limit
6. **`checkExportAccess`** - Restricts export feature for free tier
7. **`checkCalendarAccess`** - Restricts calendar feature for free tier
8. **`getQuotaUsage`** - Endpoint returning current quota usage stats

#### Response Format for Quota Exceeded
```json
{
  "success": false,
  "quotaExceeded": true,
  "message": "Your account is in free tier. Please contact your administrator to use the full feature.",
  "details": {
    "resource": "classrooms",
    "currentCount": 2,
    "limit": 2,
    "plan": "free"
  },
  "statusCode": 402
}
```

---

### Routes Modified with Quota Checks

#### 1. **Classroom Routes** (`server/routes/classroomRoutes.js`)
```javascript
router.post("/", authMiddleware, adminOnly, checkClassroomQuota, createClassroom);
```
- ✅ Classroom creation now enforces 2-classroom limit for free tier

#### 2. **Admin Routes** (`server/routes/adminRoutes.js`)
```javascript
router.post("/create-student", authMiddleware, adminOnly, checkStudentQuota, createStudent);
router.post("/create-teacher", authMiddleware, adminOnly, checkTeacherQuota, checkMentorQuota, createTeacher);
```
- ✅ Student creation limited to 10 per free tier
- ✅ Teacher/mentor creation limited to 5 per free tier

#### 3. **Announcement Routes** (`server/routes/announcementRoutes.js`)
```javascript
router.post("/", authMiddleware, checkAnnouncementQuota, createAnnouncement);
```
- ✅ Announcement creation limited to 2 per free tier

#### 4. **Calendar Routes** (`server/routes/calendarRoutes.js`)
```javascript
router.post("/", authMiddleware, checkCalendarAccess, createCalendarEvent);
router.get("/", authMiddleware, checkCalendarAccess, getCalendarEvents);
```
- ✅ Calendar access restricted for free tier

#### 5. **Universal Routes** (`server/routes/universalRoutes.js`)
```javascript
router.get('/:entity/export', authMiddleware, checkExportAccess, exportHandler);
```
- ✅ Data export access restricted for free tier

---

## Frontend Integration

### QuotaLimitModal Component

**Location:** `client/src/components/QuotaLimitModal.jsx`

**Features:**
- Beautiful modal with gradient header
- Displays current quota usage with visual progress bar
- Resource-specific messaging
- Contact administrator button
- Responsive design for mobile

**Props:**
```javascript
{
  isOpen: boolean,           // Controls modal visibility
  onClose: function,         // Close handler
  quotaDetails: {
    type: 'quota' | 'feature',
    resourceType: string,
    currentUsage: number,
    limit: number,
    message: string
  }
}
```

### API Error Handler Utility

**Location:** `client/src/utils/apiErrorHandler.js`

**Usage Example:**
```javascript
import { handleApiError } from '../utils/apiErrorHandler';
import QuotaLimitModal from '../components/QuotaLimitModal';

// In your page component
const [quotaModal, setQuotaModal] = useState({ isOpen: false, details: null });

const handleCreateClassroom = async (data) => {
  try {
    await api.post('/classrooms', data);
  } catch (error) {
    if (handleApiError(error, (details) => {
      setQuotaModal({ isOpen: true, details });
    })) {
      return; // Quota error handled
    }
    // Handle other errors
  }
};
```

---

## How It Works: Request Flow

### 1. Quota Check Flow (Classroom Creation Example)

```
User clicks "Create Classroom"
         ↓
Check if already at limit (authMiddleware extracts universityId)
         ↓
Query: COUNT(*) FROM classrooms WHERE university_id = ? AND deleted_at IS NULL
         ↓
Compare count to universitysubscription.subscriptionPlan quota
         ↓
If count >= limit:
  ├─ Return HTTP 402 with quotaExceeded: true
  └─ Frontend shows QuotaLimitModal
  
If count < limit:
  └─ Continue to controller (createClassroom)
```

### 2. Feature Restriction Flow (Export Example)

```
User navigates to Export page or clicks Export button
         ↓
API call: GET /classrooms/export
         ↓
checkExportAccess middleware checks subscription plan
         ↓
If plan === 'free':
  ├─ Return HTTP 402 with featureRestricted: true
  └─ Frontend shows QuotaLimitModal with "Feature Not Available"
  
If plan !== 'free':
  └─ Continue to export handler
```

---

## Database Schema Integration

### universities table
```sql
ALTER TABLE universities ADD COLUMN subscriptionPlan TEXT DEFAULT 'free';
-- Values: 'free', 'standard', 'professional'
```

All multi-tenant tables have:
```sql
ALTER TABLE {table} ADD COLUMN university_id INTEGER;
CREATE INDEX idx_university_id ON {table}(university_id);
```

---

## Testing the Implementation

### Test 1: Classroom Quota (Free Tier)
```bash
# Login as admin user (free tier)
1. POST /classrooms - Success (1st classroom)
2. POST /classrooms - Success (2nd classroom)
3. POST /classrooms - Returns HTTP 402 with quotaExceeded: true
```

### Test 2: Student Quota (Free Tier)
```bash
1. POST /admin/create-student × 10 - Success
2. POST /admin/create-student × 1 - Returns HTTP 402
```

### Test 3: Feature Access (Calendar - Free Tier)
```bash
1. GET /calendar - Returns HTTP 402 with featureRestricted: true
```

### Test 4: Feature Access (Export - Free Tier)
```bash
1. GET /classrooms/export - Returns HTTP 402 with featureRestricted: true
```

### Test 5: Upgrade to Standard Tier
```bash
# Admin updates subscription in database
UPDATE universities SET subscriptionPlan = 'standard' WHERE id = 1

# Now all restrictions are removed
1. POST /classrooms - Success (can create up to 10)
2. GET /calendar - Success
3. GET /classrooms/export - Success
```

---

## Configuration & Customization

### Adjusting Quota Limits

Edit `server/middleware/quotaMiddleware.js`:

```javascript
const QUOTAS = {
  free: {
    classrooms: 2,      // Change here
    students: 10,       // Change here
    teachers: 5,        // Change here
    announcements: 2,   // Change here
    // ...
  }
};
```

### Adding New Quota-Controlled Resources

1. Add quota definition to `QUOTAS` object
2. Create middleware function: `checkNewResourceQuota()`
3. Add import to relevant route file
4. Add middleware to resource creation route

Example:
```javascript
// In quotaMiddleware.js
exports.checkCourseQuota = async (req, res, next) => {
  const universityId = req.user?.universityId || 1;
  const quota = await getQuotaForUser(universityId);
  const count = await countItems('courses', universityId);
  
  if (count >= quota.courses) {
    return res.status(402).json({
      success: false,
      quotaExceeded: true,
      message: 'Course limit reached for your subscription tier.'
    });
  }
  next();
};

// In courseRoutes.js
router.post('/', authMiddleware, checkCourseQuota, createCourse);
```

---

## Error Handling

### Frontend Error Handling
```javascript
// Catch 402 responses specifically
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 402) {
      // Handle quota exceeded
      showQuotaModal(error.response.data);
      return Promise.resolve(); // Prevent further error propagation
    }
    // Handle other errors normally
    return Promise.reject(error);
  }
);
```

---

## Security Considerations

1. **Always check on backend** - Never trust client-side quota checks
2. **University isolation** - All queries filtered by `university_id` from authenticated token
3. **Subscription verification** - Each middleware verifies subscription plan from database
4. **Rate limiting** - Consider adding rate limiting on all protected endpoints
5. **Audit logging** - Log all quota-exceeded attempts for security analysis

---

## Status Summary

| Component | Status | Location |
|-----------|--------|----------|
| Quota Middleware | ✅ Complete | `server/middleware/quotaMiddleware.js` |
| Classroom Routes | ✅ Modified | `server/routes/classroomRoutes.js` |
| Admin Routes | ✅ Modified | `server/routes/adminRoutes.js` |
| Announcement Routes | ✅ Modified | `server/routes/announcementRoutes.js` |
| Calendar Routes | ✅ Modified | `server/routes/calendarRoutes.js` |
| Universal Routes | ✅ Modified | `server/routes/universalRoutes.js` |
| QuotaModal Component | ✅ Created | `client/src/components/QuotaLimitModal.jsx` |
| Modal Styles | ✅ Created | `client/src/components/QuotaLimitModal.css` |
| Error Handler | ✅ Created | `client/src/utils/apiErrorHandler.js` |

---

## Next Steps

1. **Integrate QuotaLimitModal** into resource creation pages (ClassroomPage, UserManagement, etc.)
2. **Wrap API calls** with error handler utility
3. **Test all quota scenarios** with free/standard/professional tiers
4. **Add admin dashboard** showing quota usage
5. **Implement tier upgrade** workflow in admin panel

---

## Support & Troubleshooting

### Issue: Quota check not working
- Verify `authMiddleware` is properly extracting `universityId`
- Check that `universities.subscriptionPlan` column exists and has correct value
- Ensure middleware import is correct: `const { checkResourceQuota } = require(...)`

### Issue: Modal not showing
- Verify error response has status 402
- Check modal state management and `isOpen` prop
- Confirm API error handler is being called

### Issue: Multi-tenant data leakage
- Verify ALL queries have `WHERE university_id = ?` filter
- Check that `req.user.universityId` is set correctly by authMiddleware
- Review database indexes on `university_id` columns

---

**Implementation Date:** January 2025
**System Version:** v2.0 - Multi-Tenant with Subscription Quotas
**Status:** Ready for Testing
