# Quick Setup for Real Email Delivery

## 🚀 **3 Simple Steps to Send OTP to Real Emails**

### **Step 1: Enable Gmail App Password**
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Go to: https://myaccount.google.com/apppasswords
4. Select "Mail" app
5. Select "Other device (Custom name)"
6. Enter: "Core5 Academy LMS"
7. Click "Generate"
8. Copy the 16-character password (without spaces)

### **Step 2: Update Email Configuration**
Edit the file: `server/.env.email`

Replace these lines:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

With your actual credentials:
```env
EMAIL_USER=your-real-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # Your 16-char app password
```

### **Step 3: Restart Server**
```bash
# Stop current server
taskkill /F /IM node.exe

# Start server with new email config
cd server
node server.js
```

## 📧 **Verify It's Working**

You should see in server console:
```
✅ Real email service initialized with Gmail SMTP
📧 Sending from: your-email@gmail.com
```

When you test OTP, you'll see:
```
✅ Real email sent via Gmail SMTP
📱 Check your email inbox for the OTP
```

## 🎯 **Test It Now**

1. Open: http://localhost:5174
2. Click "Forgot Password?"
3. Enter YOUR real email address
4. Check YOUR email inbox for the OTP
5. Enter OTP in separate digit boxes

## 🔧 **If You Use Other Email Providers**

### **Outlook/Hotmail**
```env
EMAIL_SERVICE=outlook
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-app-password
```

### **Yahoo**
```env
EMAIL_SERVICE=yahoo
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

## 🎉 **Success!**

Once configured, your LMS will send OTP codes to ANY real email address!

**Current Status**: Using test email service (Ethereal)
**After Setup**: Will use your real Gmail account

## 📞 **Need Help?**

The system automatically falls back if email fails:
1. Try real Gmail first
2. Falls back to Ethereal test service
3. Falls back to mock service (console only)

**You're 3 minutes away from real email delivery!** 🚀
