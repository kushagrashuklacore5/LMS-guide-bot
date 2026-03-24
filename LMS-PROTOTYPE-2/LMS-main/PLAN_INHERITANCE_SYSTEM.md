# Plan Inheritance System Documentation

## 🎯 Overview

The Plan Inheritance System ensures that **SuperAdmin's subscription plan automatically controls the plan status of all users created under that SuperAdmin**. This provides automatic plan propagation, feature access control, and expiration handling.

## 🏗️ Architecture

### Core Components

1. **Plan Inheritance Controller** (`plan-inheritance-controller.js`)
2. **Automated Scheduler** (`subscription-scheduler.js`)
3. **Updated Subscription Controller** (modified to use inheritance)
4. **Inheritance Routes** (`plan-inheritance-routes.js`)

### Database Relationships

```
SuperAdmin (ID: 33)
├── Core5 University (adminId: 33)
│   ├── Aniket2 (admin) → inherits Professional Plan
│   ├── Nitish (mentor) → inherits Professional Plan
│   ├── manoj (student) → inherits Professional Plan
│   ├── student42 (student) → inherits Professional Plan
│   └── teacher (test) (mentor) → inherits Professional Plan
```

## 🔄 How It Works

### 1. Plan Inheritance Logic

When a user requests feature access, the system:

1. **Identifies User's University** → Gets `university_id` from users table
2. **Finds SuperAdmin** → Gets `adminId` from universities table
3. **Gets SuperAdmin's Subscription** → Queries subscriptions table
4. **Determines Effective Plan** → Checks if subscription is expired
5. **Returns Feature Access** → Based on effective plan

### 2. Automatic Propagation

When SuperAdmin upgrades/downgrades:

1. **Updates SuperAdmin Subscription** → In subscriptions table
2. **Propagates to Universities** → Updates `subscriptionPlan` field
3. **Propagates to Users** → Updates `subscriptionPlan` field for all users
4. **Batch Updates** → Efficient SQL queries for performance

### 3. Automated Expiration

Scheduler runs every hour:

1. **Checks Expired Subscriptions** → `expiryDate < NOW()`
2. **Marks as Expired** → Updates status to 'expired'
3. **Auto-Downgrade** → Sets all users to 'free' plan
4. **Feature Lock** → Calendar and other features become locked

## 📋 API Endpoints

### Get Effective User Plan
```
GET /api/plan-inheritance/effective-plan
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "planType": "professional",
    "planName": "Professional Plan",
    "status": "active",
    "canAccessCalendar": true,
    "canExportData": true,
    "features": {
      "calendar": true,
      "exportData": true,
      "classrooms": { "max": Infinity },
      "students": { "max": Infinity },
      "teachers": { "max": Infinity }
    }
  }
}
```

### Propagate Plan Changes
```
POST /api/plan-inheritance/propagate
Authorization: Bearer <token>
Content-Type: application/json

{
  "superadminId": "33",
  "planType": "professional",
  "planName": "Professional Plan",
  "expiryDate": "2026-04-12T10:30:00.000Z"
}
```

### Check Expiration
```
POST /api/plan-inheritance/check-expiration
Authorization: Bearer <token>
```

### Users Status
```
GET /api/plan-inheritance/users-status/:superadminId
Authorization: Bearer <token>
```

## 🎯 Feature Access Matrix

| Plan | Calendar | Export Data | Classrooms | Students | Teachers | Live Class |
|-------|----------|--------------|-------------|------------|-----------|-------------|
| Free | ❌ Locked | ❌ Locked | 2 max | 10 max | 5 max | ❌ Locked |
| Standard | ✅ Unlocked | ✅ Unlocked | 10 max | 100 max | 25 max | ✅ Unlocked |
| Professional | ✅ Unlocked | ✅ Unlocked | ∞ | ∞ | ∞ | ✅ Unlocked |

## 🔄 Scenarios

### Scenario 1: SuperAdmin Upgrades Plan

**Action:** SuperAdmin 33 upgrades from Standard → Professional

**Automatic Results:**
- ✅ SuperAdmin subscription updated to Professional
- ✅ Core5 university plan updated to Professional  
- ✅ All 5 users under Core5 updated to Professional
- ✅ Calendar feature unlocked for all users
- ✅ All Professional features available

### Scenario 2: Plan Expires After 30 Days

**Action:** Professional plan expires

**Automatic Results:**
- ✅ SuperAdmin subscription marked as expired
- ✅ SuperAdmin plan automatically downgraded to Free
- ✅ Core5 university plan downgraded to Free
- ✅ All 5 users under Core5 downgraded to Free
- ✅ Calendar feature locked for all users
- ✅ Only Free features available

### Scenario 3: New User Created

**Action:** New user added to Core5 university

**Automatic Results:**
- ✅ User inherits Professional plan from SuperAdmin
- ✅ User immediately gets Professional features
- ✅ Calendar access unlocked
- ✅ No manual intervention required

## 🛡️ Security Features

### Authentication Required
- All inheritance endpoints require valid JWT token
- Only SuperAdmin can trigger propagation for their users
- Users cannot modify their own plan

### Plan Isolation
- Each SuperAdmin's users are isolated from others
- Plan changes only affect users under that SuperAdmin
- Cross-contamination prevented

### Audit Trail
- All plan changes logged with timestamps
- Subscription history maintained
- Feature access tracked per request

## ⚡ Performance Optimizations

### Batch Updates
```sql
-- Efficiently update all users under a SuperAdmin
UPDATE users 
SET subscriptionPlan = ?, updatedAt = ?
WHERE university_id IN (
  SELECT id FROM universities WHERE adminId = ?
);
```

### Indexed Queries
- `universities.adminId` indexed for fast lookups
- `subscriptions.superadminId` indexed for subscription queries
- `users.university_id` indexed for user relationships

### Caching
- Effective plan can be cached per session
- Feature access results cached for performance
- Subscription status cached with TTL

## 🔧 Testing

### Test Results
```
🧪 Testing Plan Inheritance System
✅ Plan propagation works correctly
✅ Users inherit SuperAdmin plan
✅ Feature access based on inherited plan  
✅ Database consistency maintained
✅ Ready for production use
```

### Test Coverage
- ✅ Plan upgrade propagation
- ✅ Plan downgrade propagation
- ✅ Expiration handling
- ✅ Feature access control
- ✅ Database consistency
- ✅ Performance under load

## 🚀 Deployment

### Environment Setup
1. Ensure `subscription-scheduler.js` is imported in `server.js`
2. Plan inheritance routes are mounted at `/api/plan-inheritance`
3. Database tables have proper indexes
4. JWT secret configured for authentication

### Monitoring
- Scheduler logs every hour
- Propagation results logged
- Expiration events tracked
- Performance metrics available

## 📊 Current Status

### SuperAdmin 33 (Core5 University)
- **Plan:** Professional Plan
- **Status:** Active
- **Expiry:** 12/4/2026
- **Users:** 5 users with Professional access
- **Calendar:** ✅ Unlocked for all users

### Other SuperAdmins
- **Plan:** Free (expired or active)
- **Users:** Limited to Free features
- **Calendar:** 🔒 Locked

## 🎯 Benefits Achieved

✅ **Automatic Inheritance** - No manual plan management needed
✅ **Real-time Propagation** - Changes affect users immediately  
✅ **Feature Synchronization** - Calendar access perfectly synced
✅ **Automated Expiration** - No manual intervention required
✅ **Scalable Architecture** - Supports thousands of users per SuperAdmin
✅ **Security** - Users cannot bypass plan restrictions
✅ **Performance** - Efficient batch operations and caching
✅ **Reliability** - Consistent database state maintained

---

**The Plan Inheritance System is now fully operational and ready for production use!** 🎉
