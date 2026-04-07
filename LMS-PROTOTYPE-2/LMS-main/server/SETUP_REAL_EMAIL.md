# Setup Real Email Delivery for OTP

## 🎯 **Goal**
Send OTP codes to real email addresses (Gmail, Outlook, etc.) instead of test services.

## 📧 **Step 1: Configure Gmail SMTP**

### **Option A: Using Gmail (Recommended)**

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" app
   - Select "Other device (Custom name)"
   - Enter: "Core5 Academy LMS"
   - Click "Generate"
   - Copy the 16-character password (without spaces)

3. **Configure Email Settings**
   - Open: `server/.env.email`
   - Update with your credentials:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   EMAIL_FROM=Core5 Academy <noreply@core5academy.com>
   ```

### **Option B: Using Outlook/Hotmail**

1. **Generate App Password** for Microsoft account
2. **Configure Email Settings**:
   ```env
   EMAIL_SERVICE=outlook
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=Core5 Academy <noreply@core5academy.com>
   ```

### **Option C: Using Other SMTP**

1. **Get SMTP credentials** from your email provider
2. **Configure Email Settings**:
   ```env
   EMAIL_SERVICE=custom
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-password
   EMAIL_FROM=Core5 Academy <noreply@core5academy.com>
   ```

## 🔧 **Step 2: Restart Server**

```bash
# Stop current server
taskkill /F /IM node.exe

# Start server with new email config
cd server
node server.js
```

## 📊 **Step 3: Verify Email Service**

### **Check Server Console**
You should see:
```
✅ Email configuration loaded from .env.email
✅ Real email service initialized with Gmail SMTP
📧 Sending from: your-email@gmail.com
```

### **Test OTP Sending**
```bash
# Test with your real email
node test-password-reset.js
```

You should see:
```
✅ Real email sent via Gmail SMTP
📱 Check your email inbox for the OTP
```

## 🚀 **Step 4: Test Complete Flow**

1. **Open**: http://localhost:5174
2. **Click**: "Forgot Password?"
3. **Enter**: Your real email address
4. **Check**: Your email inbox for OTP
5. **Enter**: OTP in separate digit boxes
6. **Complete**: Password reset

## 📱 **Email Template Preview**

The system sends beautiful HTML emails with:
- ✅ **Core5 Academy branding**
- ✅ **Large, clear OTP display**
- ✅ **Expiration time (1 minute)**
- ✅ **Security notice**
- ✅ **Professional design**

## 🔒 **Security Notes**

### **Important Security Practices**
- ✅ **Never commit** `.env.email` to version control
- ✅ **Use App Passwords** (not your main password)
- ✅ **Enable 2FA** on your email account
- ✅ **Monitor email sending** for abuse

### **Rate Limiting**
- ✅ **50 requests per minute** per IP
- ✅ **60-second cooldown** between OTP requests
- ✅ **Maximum 5 attempts** per OTP
- ✅ **1-minute OTP expiry**

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **"Authentication failed" Error**
- Check email/password in `.env.email`
- Ensure 2FA is enabled on Gmail
- Use App Password (not regular password)

#### **"Email not sending" Error**
- Verify SMTP credentials
- Check firewall/network settings
- Ensure email provider allows SMTP

#### **"Email going to spam"**
- Check SPF/DKIM records for domain
- Verify sender email address
- Monitor spam folder

### **Fallback Options**
If real email fails, system automatically falls back to:
1. **Ethereal test service** (preview URLs)
2. **Mock service** (console logging)

## 📋 **Configuration Examples**

### **Gmail Configuration**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=myapp@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM=Core5 Academy <myapp@gmail.com>
```

### **Outlook Configuration**
```env
EMAIL_SERVICE=outlook
EMAIL_USER=myapp@outlook.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Core5 Academy <myapp@outlook.com>
```

### **Custom SMTP Configuration**
```env
EMAIL_SERVICE=custom
EMAIL_USER=myapp@mydomain.com
EMAIL_PASS=your-smtp-password
EMAIL_FROM=Core5 Academy <myapp@mydomain.com>
```

## 🎉 **Success Indicators**

When properly configured, you'll see:
- ✅ **Real email service initialized** message
- ✅ **Gmail SMTP** connection successful
- ✅ **Emails arriving** in your inbox
- ✅ **Beautiful HTML email** template
- ✅ **OTP working** in password reset flow

## 🚀 **Ready for Production**

Once configured with real email credentials:
- **Users receive actual emails**
- **Professional email templates**
- **Reliable delivery**
- **Production-ready OTP system**

**Your LMS will now send OTP codes to any real email address!** 🎉
