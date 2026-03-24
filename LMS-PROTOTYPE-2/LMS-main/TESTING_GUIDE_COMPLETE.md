# Quick Start Testing Guide

## Setup & Running the Project

### 1. Start the Server
```bash
cd server
npm install  # if not already done
npm start    # or npm run dev for development
```
Server runs on: `http://localhost:5002`

### 2. Start the Client
```bash
cd client
npm install  # if not already done
npm run dev  # or npm start
```
Client runs on: `http://localhost:5173`

### 3. Verify Database
The SQLite database (`server/data/lms-database.sqlite`) is automatically created with all tables.

---

## Testing the Features

### ✅ TEST 1: LOGIN SYSTEM

**Test Case:** Login with demo credentials (no password needed)

1. Open `http://localhost:5173` in browser
2. Go to Login page
3. Enter email: `mentor@gmail.com` (or any demo email)
4. Leave password empty or type anything
5. Click "Login"
6. ✅ Should login successfully

**Demo Accounts (all work without password):**
- `student@gmail.com` → Student role
- `mentor@gmail.com` → Mentor/Teacher role  
- `admin@gmail.com` → Admin role
- `accountant@demo.com` → Admin/Accountant role
- `storekeeper@demo.com` → Storekeeper role

---

### ✅ TEST 2: TEACHER CREATES REQUIREMENT

**Test Case:** Teacher creates a requirement list

1. Login as `mentor@gmail.com` (teacher)
2. Navigate to "Requirements" section
3. Click "New Requirement" button
4. **Fill in:**
   - Classroom Name: `Grade 5 - Section A`
   - Priority: `High`
   - Select Items: Check `Chalk`, `Notebooks`, `Pens`
   - Set Quantities: 
     - Chalk: 50
     - Notebooks: 100
     - Pens: 30
5. Click "Submit Request"
6. ✅ Requirement created successfully
7. See it in "My Requirements" list with "pending" status

**Expected Result:**
- Requirement appears in teacher's dashboard
- Shows classroom name, teacher name, date, priority
- Lists all items with quantities and pending status

---

### ✅ TEST 3: STOREKEEPER VIEWS REQUIREMENTS

**Test Case:** Storekeeper sees all teacher requirements in real-time

1. **In another browser/tab**, login as `storekeeper@demo.com`
2. Navigate to "Requirements" (should show "Manage Requirements")
3. ✅ See the requirement created by teacher
4. Shows:
   - Classroom: "Grade 5 - Section A"
   - Teacher: "Mentor"
   - Priority: "High"
   - Items: Chalk (50), Notebooks (100), Pens (30)
   - Status: "pending"

**Expected Result:**
- All teacher requirements visible
- Real-time updates (test by creating new requirement in teacher tab)

---

### ✅ TEST 4: STOREKEEPER APPROVES/MARKS OUT-OF-STOCK

**Test Case:** Storekeeper marks items as approved or out-of-stock

1. Stay logged in as storekeeper
2. For the requirement from teacher:
   - **Approve Chalk:** Click "Approve" button for Chalk item
   - **Mark Out of Stock:** Click "Out of Stock" button for Notebooks
   - **Approve Pens:** Click "Approve" button for Pens item

3. ✅ Items status changes immediately

**Expected Result:**
- Each item shows updated status icon
- Chalk: ✓ (green checkmark) - Approved
- Notebooks: ✗ (red x) - Out of Stock
- Pens: ✓ (green checkmark) - Approved
- Requirement status becomes "Partially Approved"

**Teacher sees in real-time:**
- Switch to teacher tab
- See status updates automatically (within 5 seconds)
- Icons show which items are approved/out-of-stock

---

### ✅ TEST 5: STOREKEEPER PLACES ORDER

**Test Case:** Storekeeper places order for out-of-stock items

1. Stay logged in as storekeeper
2. Find the Notebooks item (marked Out of Stock)
3. Click "Place Order" button
4. **Fill in Order Details:**
   - Order Quantity: `100`
   - Unit Price (₹): `50`
   - Delivery Date: (optional) select a date
   - Vendor ID: (optional) leave blank
5. ✅ See calculated Total Amount: ₹5,000
6. Click "Place Order"

**Expected Result:**
- Order created successfully
- Inventory updated (+100 Notebooks)
- Expense record created for accountant
- Order shows in order history

---

### ✅ TEST 6: ACCOUNTANT SEES EXPENSES

**Test Case:** Accountant sees order expenses automatically

1. Login as `accountant@demo.com`
2. Navigate to "Expenses" section
3. ✅ Should see:
   - **Summary Cards:**
     - Total Expenses: ₹5,000+ (includes the new order)
     - Pending: ₹5,000 (the new order expense)
     - Monthly Chart showing expenses

4. **In Expense Records Table:**
   - Description: `Order #[OrderID]: Purchase of 100x Notebooks`
   - Amount: `₹5,000`
   - Category: `Supplies`
   - Status: `Pending`
   - Due Date: (if provided)

5. ✅ Mark as Paid
   - Click "Mark Paid" button
   - Status changes to "Paid"
   - Paid amount increases

**Expected Result:**
- All order expenses automatically tracked
- Accountant can mark as paid when received
- Running totals update correctly
- Monthly trends visible in chart

---

## REAL-TIME VERIFICATION

**Test Multi-User Real-Time Updates:**

1. **Open 3 browser windows:**
   - Window 1: Teacher login
   - Window 2: Storekeeper login  
   - Window 3: Accountant login

2. **Create new requirement in Window 1 (Teacher)**
   - Check appears in Window 2 (Storekeeper) within 5 seconds

3. **Mark items in Window 2 (Storekeeper)**
   - Changes appear in Window 1 (Teacher) within 5 seconds

4. **Place order in Window 2 (Storekeeper)**
   - New expense appears in Window 3 (Accountant) automatically

✅ All real-time updates working!

---

## KEY DATA FLOW

```
TEACHER                    STOREKEEPER                ACCOUNTANT
  ↓                             ↓                           ↓
Create Requirement ────→ View All Reqs ────────→ (see expense when
     ↓                       ↓                     order placed)
Approve/Out-of-stock ← Mark Status ────→ See Updates
     ↓                    ↓
  (auto-updates)    Place Order ───────→ Auto Expense
                        ↓                    ↓
                   (inventory          (Track & Pay)
                    updated)
```

---

## TROUBLESHOOTING

### Issue: Login not working
- Clear browser cache
- Check server is running on port 5002
- Check JWT_SECRET environment variable

### Issue: No data appearing
- Check database connection in server logs
- Verify tables created (check console output)
- Try database reset: delete `server/data/lms-database.sqlite`

### Issue: Real-time updates not working
- Check Socket.IO connection in browser console
- Verify CORS settings in server.js
- Check that both server and client on same network

### Issue: Orders not creating expenses
- Verify expenses-controller is loaded
- Check orders-controller calls createExpenseRecord
- Check database has expenses table

---

## FILES MODIFIED/CREATED

### New Files:
- `server/controllers/orders-controller.js` - Order logic
- `server/routes/orders-routes.js` - Order endpoints
- `server/controllers/expenses-controller.js` - Expense logic
- `server/routes/expenses-routes.js` - Expense endpoints

### Modified Files:
- `server/controllers/auth-controller.js` - Simplified login
- `server/routes/requirement-routes.js` - Added PATCH endpoint
- `server/config/sqlite-db.js` - Added orders table
- `server/server.js` - Registered new routes
- `client/src/components/Requirements.tsx` - Enhanced with API & ordering
- `client/src/accountant/Expenses.tsx` - API integration

---

## NEXT STEPS (OPTIONAL ENHANCEMENTS)

1. **Vendor Integration** - Select vendor when placing order
2. **Approval Workflow** - Admin approval for large orders
3. **Budget Tracking** - Set and track budget limits
4. **Automatic Reordering** - Based on minimum stock levels
5. **Payment Integration** - Track order payments
6. **Reports** - Generate expense/inventory reports
7. **Notifications** - Email alerts for approvals/deliveries
8. **Audit Trail** - Track all changes and who made them

---

## SUPPORT

All endpoints are documented in the comments within controller files.
Database schema documented in `server/config/sqlite-db.js`.

For issues, check:
1. Server console logs
2. Browser console logs (F12)
3. Network tab to verify API calls
4. Socket.IO connection status
