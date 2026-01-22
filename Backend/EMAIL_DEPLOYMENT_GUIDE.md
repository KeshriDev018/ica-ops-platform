# Email Configuration for Render Deployment

## Problem: Emails Work Locally But Not on Render

When deploying to Render, emails may fail or keep buffering due to network restrictions, missing environment variables, or timeout issues.

## ✅ Solutions Implemented

### 1. **Connection Pooling**

- Reuses email connections instead of creating new ones for each email
- Reduces connection overhead and prevents timeout issues

### 2. **Timeout Configuration**

```javascript
connectionTimeout: 10000; // 10 seconds
greetingTimeout: 10000; // 10 seconds
socketTimeout: 10000; // 10 seconds
```

### 3. **Better Error Handling**

- Detailed error logging for debugging
- Specific messages for connection, authentication, and socket errors

### 4. **TLS Configuration**

```javascript
tls: {
  rejectUnauthorized: false; // Accept self-signed certificates
}
```

## 🔧 Render Environment Variables Checklist

Make sure these are set in your Render dashboard:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com  # (NEW - fallback to EMAIL_USER if not set)
```

## 📧 Gmail Configuration (Recommended)

### Step 1: Enable 2-Factor Authentication

1. Go to Google Account Settings
2. Security → 2-Step Verification
3. Enable it

### Step 2: Generate App Password

1. Go to Google Account → Security
2. Search for "App passwords"
3. Select "Mail" and "Other (Custom name)"
4. Name it "ICA Platform" or "Render Deployment"
5. Copy the 16-character password
6. Use this as `EMAIL_PASS` in Render

⚠️ **Never use your regular Gmail password!**

## 🔍 Debugging on Render

### Check Render Logs

Look for these error messages:

**Connection Timeout:**

```
🔴 Connection timeout - Check if SMTP port is accessible from Render
```

**Solution:** Verify EMAIL_HOST and EMAIL_PORT are correct

**Authentication Failed:**

```
🔴 Authentication failed - Check EMAIL_USER and EMAIL_PASS env variables
```

**Solution:** Regenerate App Password and update in Render

**Socket Error:**

```
🔴 Socket error - Network connectivity issue
```

**Solution:** Try using port 465 with `secure: true` instead

## 🛠️ Alternative SMTP Providers

If Gmail doesn't work on Render, try these:

### SendGrid (Free tier: 100 emails/day)

```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Mailgun (Free tier: 5,000 emails/month)

```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASS=your-mailgun-password
```

### AWS SES (Free tier: 62,000 emails/month)

```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-aws-smtp-username
EMAIL_PASS=your-aws-smtp-password
```

## 🚀 Testing Email on Render

### Method 1: Via Render Shell

```bash
# In Render Dashboard → Shell
node -e "require('./src/utils/email.util.js').sendSetPasswordEmail('test@example.com', 'https://test.com', 'COACH')"
```

### Method 2: Add Test Endpoint (Development Only)

```javascript
// In your routes file
router.post("/test-email", async (req, res) => {
  try {
    await sendSetPasswordEmail(req.body.email, "https://test.com", "COACH");
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 📊 Common Issues & Solutions

| Issue                          | Cause                | Solution                                           |
| ------------------------------ | -------------------- | -------------------------------------------------- |
| Buffering forever              | Connection timeout   | Increase timeout values, check firewall            |
| Auth error                     | Wrong credentials    | Regenerate App Password                            |
| Port blocked                   | ISP/host restriction | Try port 465 (SSL) or alternative provider         |
| No error, no email             | Gmail blocking       | Check Gmail "Less secure apps" or use App Password |
| Works locally, fails on Render | Missing env vars     | Double-check all EMAIL\_\* variables in Render     |

## ✨ Best Practices

1. **Always use App Passwords** - Never regular passwords
2. **Set connection timeouts** - Prevent infinite buffering
3. **Use connection pooling** - Better performance
4. **Log errors properly** - Easy debugging
5. **Have fallback providers** - In case one fails
6. **Test on staging first** - Before production deployment

## 🔐 Security Notes

- Never commit `.env` file to Git
- Rotate email passwords regularly
- Use different emails for dev/staging/production
- Monitor email sending logs for suspicious activity
- Set rate limits to prevent abuse

## 📝 Render Deployment Steps

1. Push updated code to GitHub
2. Set all EMAIL\_\* environment variables in Render Dashboard
3. Deploy
4. Check logs for email confirmation messages
5. Test by creating a coach/admin account
6. Verify email received

## Need Help?

If emails still don't work after following this guide:

1. Check Render logs for specific error codes
2. Verify all environment variables are set correctly
3. Try a different SMTP provider (SendGrid/Mailgun)
4. Contact Render support if network issues persist
