# Gmail App Password Setup for Core5 Academy

## 🚨 **Important: Regular Gmail Password Won't Work**

Gmail requires **App Passwords** for applications like our LMS system.

## 📧 **Step-by-Step Setup**

### **Step 1: Enable 2-Step Verification**
1. Go to: https://myaccount.google.com/security
2. Find "2-Step Verification" and turn it **ON**
3. Follow the setup process (phone number, backup codes, etc.)

### **Step 2: Generate App Password**
1. Go to: https://myaccount.google.com/apppasswords
2. You might need to sign in again
3. Under "Select app", choose: **"Mail"**
4. Under "Select device", choose: **"Other (Custom name)"**
5. Enter: **"Core5 Academy LMS"**
6. Click **"Generate"**
7. Copy the **16-character password** (without spaces)

### **Step 3: Update .env File**
Edit `server/.env` and replace the EMAIL_PASS line:

```env
# Replace this:
EMAIL_PASS=Core5support@8800

# With your 16-character App Password:
EMAIL_PASS=abcd efgh ijkl mnop
```

### **Step 4: Restart Server**
```bash
taskkill /F /IM node.exe
cd server
node server.js
```

## 🔧 **Alternative: Use Outlook SMTP**

If Gmail setup is problematic, use Outlook:

### **Outlook Configuration**
```env
EMAIL_SERVICE=outlook
EMAIL_USER=support@core5.co.in
EMAIL_PASS=your-outlook-password
EMAIL_FROM=Core5 Academy <support@core5.co.in>
```

## 🛡️ **Security Notes**

### **Why App Passwords?**
- ✅ **More secure** than using main password
- ✅ **Revocable** individually
- ✅ **Limited access** to specific apps
- ✅ **No main password exposure**

### **Best Practices**
- ✅ **Never share** App Passwords
- ✅ **Store securely** in .env file
- ✅ **Never commit** to version control
- ✅ **Rotate regularly** for security

## 🚀 **Testing After Setup**

### **Expected Server Output**
```
✅ Email configuration loaded from environment variables
✅ Real email service initialized with secure credentials
📧 Sending from: support@core5.co.in
🔒 Credentials loaded from secure .env file
```

### **Test Email Sending**
```bash
node test-password-reset.js
```

### **Expected Test Output**
```
✅ Real email sent via secure Gmail SMTP
📱 Check your email inbox for the OTP
🔒 Credentials loaded from secure .env file
```

## 📞 **Troubleshooting**

### **"Invalid login" Error**
- Check 2-Step Verification is enabled
- Verify App Password is correct (16 characters)
- Ensure no spaces in App Password
- Try generating a new App Password

### **"Less secure app access"**
- App Passwords bypass this setting
- Ensure 2-Step Verification is ON
- Use App Password, not regular password

### **Still Not Working?**
1. Try a different App Password
2. Check Gmail account security settings
3. Consider using Outlook SMTP instead
4. Contact Google support if needed

## 🎯 **Quick Setup Summary**

| Action | Time | Result |
|--------|------|--------|
| Enable 2FA | 2 minutes | Security |
| Generate App Password | 1 minute | Access |
| Update .env | 30 seconds | Configuration |
| Restart Server | 30 seconds | Ready |

**Total Time: 4 minutes!** 🚀

## 🎉 **Success Indicators**

When properly configured:
- ✅ **Server starts** without email errors
- ✅ **Real emails** sent to your inbox
- ✅ **Beautiful HTML** email templates
- ✅ **Secure credentials** in .env file

**Your LMS will send real OTP emails to any address!** 📧✨
