# Quick Reference: Quota System Integration

## TL;DR - What You Need to Know

Free-tier admins can now only create:
- 2 classrooms
- 10 students  
- 5 teachers/mentors
- 2 announcements

Cannot access:
- Data export
- Calendar features

When limits are hit, they get a professional popup modal.

---

## For Backend Developers

### Add Quota Check to New Route

```javascript
// Import the middleware
const { checkResourceQuota } = require('../middleware/quotaMiddleware');

// Add to your route
router.post('/resources', authMiddleware, checkResourceQuota, controllerFunction);

// Returns HTTP 402 with quotaExceeded: true if limit hit
```

### Create New Quota Check

Edit `server/middleware/quotaMiddleware.js`:

```javascript
exports.checkNewResourceQuota = async (req, res, next) => {
  try {
    const universityId = req.user?.universityId || 1;
    const quota = await getQuotaForUser(universityId);
    const count = await countItems('table_name', universityId);

    if (count >= quota.newResource) {
      return res.status(402).json({
        success: false,
        quotaExceeded: true,
        message: 'Quota limit reached...'
      });
    }
    next();
  } catch (error) {
    console.error('Quota check error:', error);
    next(); // Continue on error for graceful degradation
  }
};
```

---

## For Frontend Developers

### Use the Modal

```javascript
import QuotaLimitModal from './components/QuotaLimitModal';
import { handleApiError } from './utils/apiErrorHandler';

const [quotaModal, setQuotaModal] = useState({ isOpen: false, details: null });

const createItem = async (data) => {
  try {
    await api.post('/items', data);
  } catch (error) {
    handleApiError(error, (details) => {
      setQuotaModal({ isOpen: true, details });
    });
  }
};

return (
  <>
    <button onClick={() => createItem(data)}>Create</button>
    <QuotaLimitModal
      isOpen={quotaModal.isOpen}
      onClose={() => setQuotaModal({ isOpen: false, details: null })}
      quotaDetails={quotaModal.details}
    />
  </>
);
```

### Just Check Response Code

```javascript
catch (error) {
  if (error.response?.status === 402) {
    // Quota exceeded
    showQuotaModal(error.response.data);
  }
}
```

---

## Files Changed

### Backend
- `server/routes/classroomRoutes.js` - Added checkClassroomQuota
- `server/routes/adminRoutes.js` - Added checkStudentQuota, checkTeacherQuota
- `server/routes/announcementRoutes.js` - Added checkAnnouncementQuota
- `server/routes/calendarRoutes.js` - Added checkCalendarAccess
- `server/routes/universalRoutes.js` - Added checkExportAccess

### Frontend
- `client/src/components/QuotaLimitModal.jsx` - NEW
- `client/src/components/QuotaLimitModal.css` - NEW
- `client/src/utils/apiErrorHandler.js` - NEW

### Middleware
- `server/middleware/quotaMiddleware.js` - NEW (all quota logic here)

---

## Response Codes

**202 OK** - Resource created successfully

**402 Payment Required** - Quota exceeded or feature blocked
```json
{
  "success": false,
  "quotaExceeded": true,
  "message": "Your account is in free tier...",
  "details": { "currentCount": 2, "limit": 2 }
}
```

**500 Server Error** - Check logs

---

## Testing

```bash
# Test classroom quota
curl -X POST http://localhost:5002/classrooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}'

# After 2 successful creates, next one returns 402

# Test export block
curl -X GET http://localhost:5002/classrooms/export \
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns 402 with featureRestricted: true
```

---

## FAQ

**Q: User can create unlimited resources?**  
A: Check that middleware is imported and added to route. Verify `authMiddleware` sets `req.user.universityId`.

**Q: Modal doesn't show?**  
A: Confirm API returns 402 status. Check component `isOpen` prop is true.

**Q: How to change limits?**  
A: Edit `QUOTAS` object in `server/middleware/quotaMiddleware.js`

**Q: How to upgrade tier?**  
A: Update `subscriptionPlan` column in `universities` table:
```sql
UPDATE universities SET subscriptionPlan = 'standard' WHERE id = 1;
```

**Q: Need to exclude a user from quotas?**  
A: Add superadmin check in middleware before quota validation.

---

## Quota Limits Quick Reference

| | Free | Standard | Pro |
|---|------|----------|-----|
| Classrooms | **2** | 10 | ∞ |
| Students | **10** | 100 | ∞ |
| Teachers | **5** | 25 | ∞ |
| Announcements | **2** | 20 | ∞ |
| Export | ❌ | ✅ | ✅ |
| Calendar | ❌ | ✅ | ✅ |

---

## Support Resources

- Full Guide: `QUOTA_IMPLEMENTATION_GUIDE.md`
- Status Report: `QUOTA_SYSTEM_COMPLETED.md`
- Middleware Code: `server/middleware/quotaMiddleware.js`
- Modal Component: `client/src/components/QuotaLimitModal.jsx`

---

**System Ready:** ✅ All components implemented and tested
