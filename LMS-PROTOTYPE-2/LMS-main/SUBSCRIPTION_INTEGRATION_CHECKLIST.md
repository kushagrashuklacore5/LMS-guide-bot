# Subscription System - Integration Checklist

## Pre-Deployment Verification

### Backend Setup
- [ ] MongoDB connection is configured in `server/config/mongodb.js` or equivalent
- [ ] `server/models/Subscription.js` file exists and contains SubscriptionSchema
- [ ] `server/controllers/subscription-controller.js` file exists with all exports
- [ ] `server/routes/subscription-routes.js` file exists with route definitions
- [ ] `server/server.js` includes the line: `app.use("/api/subscriptions", require("./routes/subscription-routes"));`
- [ ] Server restarts without errors
- [ ] No console errors when accessing `/api/subscriptions/current` endpoint

### Frontend Setup
- [ ] `client/src/components/SuperAdminLayout.jsx` has useEffect that fetches `/api/subscriptions/current`
- [ ] `client/src/pages/superadmin/SuperAdminSubscription.jsx` calls `/api/subscriptions/create-order` on plan select
- [ ] `client/src/pages/superadmin/SuperAdminSubscription.jsx` calls `/api/subscriptions/verify-payment` after payment
- [ ] Timer displays in superadmin header with plan name
- [ ] Popup appears when subscription expires
- [ ] No console errors in browser DevTools

### Database Setup
- [ ] MongoDB is running and accessible
- [ ] Can connect to database from server
- [ ] `subscriptions` collection will be auto-created on first subscription

### Environment Configuration
- [ ] Razorpay key ID is set: `rzp_test_S7aUmYSaQyE0h6` (test) or production key
- [ ] Razorpay secret key is set: `DFei1Nk0mzEHm3ehq6Va5QhW` (test) or production secret
- [ ] JWT secret is configured for auth middleware
- [ ] Backend API URL is correct in frontend fetch calls

## Feature Verification Checklist

### Free Trial Feature
- [ ] New superadmin access automatically creates 10-day free trial
- [ ] Free trial shows "Free" as plan name in timer
- [ ] Free trial countdown shows correct duration
- [ ] Database shows `isFreeTrial: true` for free trial
- [ ] Database shows `status: "active"` for active free trial

### Payment Flow
- [ ] Clicking plan button opens Razorpay modal
- [ ] Test payment can be completed with 4111111111111111
- [ ] After successful payment, page redirects to dashboard
- [ ] Network shows POST `/api/subscriptions/verify-payment` succeeded
- [ ] Database shows subscription with correct plan type and amount
- [ ] Timer updates to show correct plan name and duration

### Timer Display
- [ ] Desktop header shows: "PLAN: {name} • DAYS • XX : HRS • XX : MIN • XX : SEC • XX"
- [ ] Mobile header shows compact version with days and hours
- [ ] Timer counts down every second
- [ ] Timer color is blue when active
- [ ] Timer color changes to red when expired
- [ ] Timer displays exactly 0 when subscription ends

### Expiry Popup
- [ ] Popup appears when timer reaches 0
- [ ] Popup shows correct plan name that expired
- [ ] "Upgrade Now" button navigates to subscription page
- [ ] "Later" button dismisses popup temporarily
- [ ] Popup is not dismissible by clicking outside

### Plan Upgrade
- [ ] Can upgrade from Free to Standard
- [ ] Can upgrade from Free to Professional
- [ ] Can upgrade from Standard to Professional
- [ ] Can upgrade from any plan to same plan (renewal)
- [ ] Timer properly resets with new plan duration
- [ ] Old subscription is updated with new details

### Data Persistence
- [ ] Refreshing page maintains correct timer (fetches from backend)
- [ ] Closing and reopening browser maintains subscription state
- [ ] Multiple superadmins have separate subscriptions
- [ ] Payment ID is unique per transaction

## API Endpoint Verification

### GET /api/subscriptions/current
- [ ] Endpoint accessible with valid auth token
- [ ] Returns 401 without auth token
- [ ] Returns subscription object with all fields
- [ ] `remainingSeconds` is calculated correctly
- [ ] Status is marked as "expired" when date has passed
- [ ] New subscription is created if none exists

### POST /api/subscriptions/create-order
- [ ] Endpoint returns Razorpay order object
- [ ] Returns 400 if planId or amount missing
- [ ] Returns unique order ID each time
- [ ] Amount is in paise (multiply by 100)
- [ ] Order is retrievable from Razorpay API

### POST /api/subscriptions/verify-payment
- [ ] Endpoint verifies signature correctly
- [ ] Returns 400 for invalid signature
- [ ] Creates new subscription if doesn't exist
- [ ] Updates existing subscription if exists
- [ ] Saves payment ID to database
- [ ] Sets correct expiry date based on durationDays
- [ ] Marks status as "active"

### POST /api/subscriptions/activate-free-trial
- [ ] Creates 10-day free trial subscription
- [ ] Marks as `isFreeTrial: true`
- [ ] Blocks if user already has active paid subscription
- [ ] Returns appropriate error message if blocked

## Error Handling Verification

- [ ] Network timeout shows appropriate error message
- [ ] Invalid payment shows error without updating database
- [ ] Duplicate payment attempts handled gracefully
- [ ] Missing fields return meaningful error messages
- [ ] Database errors logged but don't crash frontend
- [ ] Auth failures return 401 consistently

## Performance Verification

- [ ] Page load time not significantly increased
- [ ] Timer update every second is smooth (no stuttering)
- [ ] No memory leaks on long page sessions
- [ ] Fetching subscription takes < 1 second
- [ ] Network requests are < 100ms on good connection

## Browser Compatibility

- [ ] Chrome/Chromium: ✅
- [ ] Firefox: ✅
- [ ] Safari: ✅
- [ ] Edge: ✅
- [ ] Mobile Chrome: ✅
- [ ] Mobile Safari: ✅

## Security Checklist

- [ ] Auth middleware validates JWT token before subscription access
- [ ] Razorpay signature verification is mandatory
- [ ] User can only access their own subscription
- [ ] Sensitive data (paymentId) not exposed unnecessarily
- [ ] No sensitive info in browser console logs
- [ ] CORS configured properly for API calls

## Deployment Checklist

- [ ] All environment variables are set on server
- [ ] Database backup created before deployment
- [ ] Test payment verified in production Razorpay account
- [ ] Error logging configured for production
- [ ] Auth tokens have appropriate expiry times
- [ ] Rate limiting enabled on payment endpoints
- [ ] SSL/TLS configured for HTTPS
- [ ] Firewall rules allow MongoDB access from app server

## Post-Deployment Verification

- [ ] Test free trial creation with new superadmin user
- [ ] Test full payment flow with small amount
- [ ] Monitor database for subscription records
- [ ] Check server logs for any errors
- [ ] Verify timer accuracy across multiple sessions
- [ ] Test expiry popup appears correctly
- [ ] Stress test with multiple concurrent payments (optional)

## Quick Validation Commands

### MongoDB Validation
```javascript
// Check if subscriptions collection exists
db.subscriptions.countDocuments()

// View a subscription
db.subscriptions.findOne()

// Check creation date of latest subscription
db.subscriptions.findOne({}, { sort: { createdAt: -1 } })
```

### Server Endpoint Testing
```bash
# Get current subscription
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/subscriptions/current

# Create order (requires authentication)
curl -X POST http://localhost:5000/api/subscriptions/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"planId":"standard","planName":"Standard","amount":600}'
```

### Frontend Console Testing
```javascript
// Check subscription in localStorage
localStorage.getItem('token')

// Check current subscription state (if stored in window object)
window.subscription

// Manually trigger timer expiry
sessionStorage.setItem('testExpiry', 'true')
```

## Sign-Off

- [ ] Technical Lead reviewed implementation
- [ ] QA tested all scenarios
- [ ] Security review completed
- [ ] Performance baseline established
- [ ] Documentation is complete and accurate
- [ ] Team trained on new system
- [ ] Ready for production deployment

**Deployment Date**: ___________
**Deployed By**: ________________
**Verified By**: _________________
**Notes**: _______________________
