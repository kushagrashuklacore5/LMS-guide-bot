# Subscription Timer System - Implementation Guide

## Overview
This document outlines the complete subscription timer system implementation for the superadmin portal. The system automatically creates a 10-day free trial, manages subscription plans purchased through Razorpay, and displays an upgrade popup when plans expire.

## Key Features

### 1. Automatic Free Trial
- When a superadmin accesses the portal for the first time, a 10-day free trial is automatically created
- The free trial has a status of "active" with plan type "free"
- Timer displays: "Free" plan with countdown

### 2. Subscription Payment Flow
1. User clicks on Standard or Professional plan
2. System calls `/api/subscriptions/create-order` to create a Razorpay order
3. Razorpay payment modal opens
4. After successful payment, system calls `/api/subscriptions/verify-payment`
5. Backend verifies Razorpay signature and updates subscription in database
6. Timer resets with the purchased plan name and duration

### 3. Timer Display
- **Desktop Header**: Shows plan name + remaining Days:Hours:Minutes:Seconds
- **Mobile Header**: Shows compact view with Days and Hours
- **Colors**: Blue when active, Red when expired

### 4. Expiration Popup
When the timer reaches zero:
- A popup appears showing "Subscription Expired!"
- Displays the plan name that expired
- Offers buttons to "Upgrade Now" or "Later"
- Prevents dismissal until user upgrades

## Database Models

### Subscription Collection (MongoDB)
```javascript
{
  superadminId: String (unique)
  planType: 'free' | 'standard' | 'professional'
  planName: String
  status: 'active' | 'expired' | 'cancelled'
  startDate: Date
  expiryDate: Date
  durationDays: Number
  paymentId: String (null for free)
  amount: Number
  currency: 'INR'
  paymentMethod: String (null for free)
  isFreeTrial: Boolean
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### GET /api/subscriptions/current
**Purpose**: Fetch current subscription data
**Headers**: Authorization: Bearer {token}
**Response**:
```json
{
  "success": true,
  "subscription": {
    "planType": "standard",
    "planName": "Standard",
    "status": "active",
    "expiryDate": "2026-03-16T08:15:00Z",
    "startDate": "2026-02-14T08:15:00Z",
    "durationDays": 30,
    "isFreeTrial": false,
    "remainingSeconds": 2592000
  }
}
```

### POST /api/subscriptions/create-order
**Purpose**: Create Razorpay order for subscription purchase
**Body**:
```json
{
  "planId": "standard",
  "planName": "Standard",
  "amount": 600
}
```
**Response**:
```json
{
  "success": true,
  "order": {
    "id": "order_xxxxx",
    "amount": 60000,
    "currency": "INR",
    "createdAt": 1708081500
  },
  "planData": {
    "planId": "standard",
    "planName": "Standard",
    "amount": 600
  }
}
```

### POST /api/subscriptions/verify-payment
**Purpose**: Verify payment and activate subscription
**Body**:
```json
{
  "orderId": "order_xxxxx",
  "paymentId": "pay_xxxxx",
  "signature": "xxxxx",
  "planId": "standard",
  "planName": "Standard",
  "amount": 600,
  "durationDays": 30
}
```
**Response**:
```json
{
  "success": true,
  "message": "Payment verified and subscription activated",
  "subscription": {
    "planType": "standard",
    "planName": "Standard",
    "status": "active",
    "expiryDate": "2026-03-16T08:15:00Z",
    "remainingSeconds": 2592000
  }
}
```

### POST /api/subscriptions/activate-free-trial
**Purpose**: Manually activate a 10-day free trial
**Headers**: Authorization: Bearer {token}
**Response**:
```json
{
  "success": true,
  "message": "Free trial activated",
  "subscription": {
    "planType": "free",
    "planName": "Free",
    "status": "active",
    "expiryDate": "2026-02-24T08:15:00Z",
    "isFreeTrial": true,
    "remainingSeconds": 864000
  }
}
```

## Frontend Components

### SuperAdminLayout.jsx
**State Management**:
- `subscription`: Stores complete subscription object from backend
- `timer`: Remaining seconds in subscription (updates every second)
- `showPopup`: Controls visibility of expiration popup
- `planName`: Name of current plan
- `loading`: Indicates if subscription data is being fetched

**Lifecycle**:
1. On component mount: Fetches subscription data from backend
2. Every second: Decrements timer if > 0
3. When timer reaches 0: Shows popup and sets showPopup to true
4. On popup action: Redirects to subscription page or dismisses

**Timer Display**:
- Active (timer > 0): Blue badge with plan name and countdown
- Expired (timer = 0): Red badge with "PLAN EXPIRED" message

### SuperAdminSubscription.jsx
**Changes**:
- `handlePlanSelect()`: Now calls `activateFreeTrial()` for free plan instead of alert
- `initiatePayment()`: Creates order via `/api/subscriptions/create-order` before opening Razorpay
- `openRazorpayCheckout()`: Uses order ID from backend instead of calculating amount
- `activateSubscription()`: Calls `/api/subscriptions/verify-payment` to verify and activate subscription

## Testing Guide

### Test 1: Free Trial Activation
1. Clear browser storage/cache
2. Navigate to superadmin dashboard
3. Verify in network tab: `/api/subscriptions/current` is called
4. Verify timer shows "Free" plan with 10 days countdown
5. Verify database: Subscription document created with `isFreeTrial: true`

### Test 2: Free Trial Expiration
1. Complete Test 1
2. Use browser DevTools to modify timer to 0 seconds
3. Verify popup appears with "Subscription Expired!" message
4. Verify plan name shows as "Free" in popup

### Test 3: Subscription Purchase (Standard Plan)
1. Navigate to Subscription page
2. Click "Choose Standard" button
3. In network tab, verify:
   - POST `/api/subscriptions/create-order` with planId="standard"
   - Response includes Razorpay order
4. Complete Razorpay payment (test card: 4111111111111111)
5. Verify network: POST `/api/subscriptions/verify-payment`
6. Verify page redirects to dashboard
7. Verify timer shows "Standard" plan name
8. Verify database: Subscription updated with `planType: "standard"`, `amount: 600`, `paymentId: pay_xxxxx`

### Test 4: Purchased Plan Timer Countdown
1. Complete Test 3 (purchase Standard plan)
2. Verify timer counts down correctly every second
3. Monitor frontend state: timer value decreases from ~2592000 (30 days)
4. After 3 minuteswait, manually set expiry to past time in database
5. Refresh page
6. Verify popup appears immediately with "Subscription Expired! Your Standard plan has expired."

### Test 5: Plan Switch (Standard → Professional)
1. Have active Standard plan
2. Go to Subscription page
3. Click "Choose Professional"
4. Complete payment
5. Verify timer resets and shows "Professional" plan
6. Verify database: Old subscription marked as updated, new one replaces it

### Test 6: Multiple Login Sessions
1. User A: Standard plan with 10 days remaining
2. User B: Professional plan with 20 days remaining
3. Each session should fetch their own subscription (verified via unique `superadminId`)
4. Timers show independently for each user

## Important Notes

### Data Persistence
- Subscription data is stored in MongoDB (persistent)
- Frontend state is NOT stored in localStorage (only fetched from backend)
- Timer accuracy depends on backend-calculated remaining seconds
- Timer will reset to correct value if page is refreshed

### Payment Verification
- Razorpay signature verification is done on backend
- Only valid signatures result in subscription activation
- Failed verifications log error and don't update database

### Edge Cases Handled
1. **User opens portal after subscription expires**: Backend marks as "expired", popup shows immediately
2. **Network delay**: Timer uses server-calculated expiry time, not client clock
3. **Page refresh during payment**: Subscription state is fetched fresh (no localStorage dependency)
4. **Multiple payment attempts**: Latest successful payment overwrites previous

## Troubleshooting

### Timer showing incorrect time
- Check if `/api/subscriptions/current` is returning correct `remainingSeconds`
- Verify server system clock is accurate
- Clear browser cache and refresh

### Popup not appearing on expiry
- Check JavaScript console for errors
- Verify `showPopup` state is updating correctly
- Ensure timer is reaching 0 (not stuck at some value)

### Payment not activating subscription
- Check Razorpay response in network tab
- Verify signature matches in backend logs
- Ensure MongoDB connection is working

### Plan name not displaying
- Verify `planName` is being set in `setSubscription()`
- Check database that subscription has `planName` field
- Restart browser and refetch subscription

## Deployment Checklist

- [ ] Subscription model added to MongoDB
- [ ] Subscription controller exported correctly
- [ ] Subscription routes added to server.js
- [ ] Backend dependencies updated (if needed)
- [ ] Frontend API endpoints pointing to correct backend URL
- [ ] Auth middleware working on subscription endpoints
- [ ] Razorpay credentials configured in controller
- [ ] Error handling tested for network failures
- [ ] Mobile responsive design verified
- [ ] Payment flow tested end-to-end
