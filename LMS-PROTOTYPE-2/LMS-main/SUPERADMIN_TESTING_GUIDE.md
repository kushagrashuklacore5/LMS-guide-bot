# SuperAdmin Portal - Testing Guide

## 🔓 Step 1: Login to SuperAdmin Portal

1. Open browser and go to: `http://localhost:5175/superadmin/login`
2. You'll see the login page with default credentials displayed
3. Enter:
   - **Email**: `superadmin@lms.com`
   - **Password**: `SuperAdmin@123`
4. Click "Login"
5. You'll be redirected to the dashboard

## 📊 Step 2: Create a University

1. In dashboard, click **"➕ Create University"** tab
2. Fill in the form:
   - University Name: `Tech University`
   - Area: `New York, USA`
   - Admin Name: `John Smith`
   - Admin Email: `john@techuni.edu`
3. Click **"✅ Create University"**
4. You'll see the auto-generated password displayed
5. **Save this password** - it's shown only once!

### What Happens:
- ✅ University created in database
- ✅ Admin user created with auto-generated password
- ✅ Admin is auto-approved (can login immediately)
- ✅ Admin linked to university

## 👥 Step 3: Create Users (Admin, Accountant, Storekeeper)

### Create an Accountant:
1. Click **"👥 Create User"** tab
2. Fill in:
   - Name: `Alice Johnson`
   - Email: `alice@account.com`
   - Role: Select **"accountant"**
3. Click **"✅ Create User"**
4. Green success alert appears with credentials
5. Click **"📥 Download PDF"** to save credentials
6. PDF file downloads as `alice@account.com_credentials.pdf`

### Create a Storekeeper:
1. Same process, but select **"storekeeper"** role
   - Name: `Bob Wilson`
   - Email: `bob@store.com`

### Create an Admin:
1. Same process, select **"admin"** role
   - Name: `Carol Davis`
   - Email: `carol@admin.com`

### Create Other Roles:
- Can create `teacher` and `student` roles the same way

## 📋 Step 4: View All Universities

1. Click **"🏫 Universities"** tab
2. You'll see cards for each created university showing:
   - University Name
   - Location/Area
   - Admin Name
3. Automatically updates when new universities are created

## 👨‍💼 Step 5: View All Users

1. Click **"📋 All Users"** tab
2. See table with all created users:
   - **Name**: User's full name
   - **Email**: Login email
   - **Role**: User's role (badged in blue)
   - **Status**: ✅ Active (all auto-approved)
3. Table updates in real-time

## 🔐 Step 6: Login as Created User

Now you can test if the created user can login!

### For Accountant (Alice):
1. Logout from SuperAdmin (click 🚪 Logout)
2. Go to main login page: `http://localhost:5175`
3. Try to find accountant login or use:
   - Email: `alice@account.com`
   - Password: (the password from the PDF or alert)
4. You should be able to login as accountant

### For Storekeeper (Bob):
- Email: `bob@store.com`
- Password: (from PDF)

### For Teacher or Student:
- Same process with their respective credentials

## 📥 PDF Credential Download Details

When you download PDF, it contains:
```
Name: Alice Johnson
Email: alice@account.com
Password: [Auto-Generated Password]
Role: accountant
Generated on: [Timestamp]
```

Save this PDF securely and share with the user!

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Can login with superadmin credentials
- [ ] Can create university successfully
- [ ] Admin password is generated and shown
- [ ] Can create accountant user
- [ ] Can create storekeeper user
- [ ] Can create other role users
- [ ] Can download credentials PDF
- [ ] Universities list shows all created unis
- [ ] Users list shows all created users
- [ ] User status shows as "✅ Active"
- [ ] Created user can login with their credentials
- [ ] Logout button works
- [ ] Can create multiple of same role

## 🎯 Expected Results

| Action | Expected Result |
|--------|-----------------|
| Login with superadmin creds | ✅ Redirected to dashboard |
| Create university | ✅ Shows in Universities tab |
| Create user | ✅ Green alert with credentials |
| Download PDF | ✅ PDF file downloaded to device |
| View universities | ✅ Shows all created universities |
| View users | ✅ Table with all users |
| User auto-approved | ✅ Status shows Active |
| Created user login | ✅ Can access their dashboard |

## 🚀 URLs for Quick Access

- **SuperAdmin Login**: `http://localhost:5175/superadmin/login`
- **SuperAdmin Dashboard**: `http://localhost:5175/superadmin/dashboard`
- **Backend API**: `http://localhost:5002`
- **Swagger/API Docs**: `http://localhost:5002/api-docs` (if available)

## 💡 Tips

1. **Save passwords immediately** - They're only shown once
2. **Use realistic emails** - Makes testing authentication easier
3. **PDF download** - Great way to share credentials securely
4. **Test all roles** - Try creating each role type
5. **Multiple institutions** - Create multiple universities to test management
6. **User approval** - All created users auto-approved (no pending)

## 🔧 Troubleshooting

### Can't login?
- Check email/password spelling
- Make sure both servers are running (backend + frontend)
- Check browser console for errors

### Credentials not showing?
- Refresh the page
- Clear browser cache
- Try creating user again

### PDF won't download?
- Check if PDF extension is being blocked
- Try a different browser
- Disable any adblockers

### Users not appearing in list?
- Refresh the page
- Wait a moment (database save)
- Check browser console for errors

---

**Ready to test?** 🎉 Start with the login step above!
