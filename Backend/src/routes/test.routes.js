import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

/**
 * Test Email Configuration
 * GET /api/test/email-config
 * Shows current email settings (without exposing password)
 */
router.get("/email-config", (req, res) => {
  res.json({
    EMAIL_HOST: process.env.EMAIL_HOST || "NOT SET",
    EMAIL_PORT: process.env.EMAIL_PORT || "NOT SET",
    EMAIL_USER: process.env.EMAIL_USER || "NOT SET",
    EMAIL_PASS: process.env.EMAIL_PASS ? "SET (hidden)" : "NOT SET",
    EMAIL_FROM: process.env.EMAIL_FROM || "NOT SET",
    FRONTEND_URL: process.env.FRONTEND_URL || "NOT SET",
  });
});

/**
 * Test SMTP Connection
 * POST /api/test/smtp
 * Tests if SMTP server is reachable and credentials work
 */
router.post("/smtp", async (req, res) => {
  try {
    console.log("🔍 Testing SMTP connection...");

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify connection
    await transporter.verify();

    console.log("✅ SMTP connection successful!");

    res.json({
      success: true,
      message: "SMTP connection verified successfully!",
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
      },
    });
  } catch (error) {
    console.error("❌ SMTP connection failed:", error);

    res.status(500).json({
      success: false,
      message: "SMTP connection failed",
      error: error.message,
      errorCode: error.code,
      details: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        user: process.env.EMAIL_USER,
        hasPassword: !!process.env.EMAIL_PASS,
      },
      troubleshooting: getTroubleshootingHint(error.code),
    });
  }
});

/**
 * Send Test Email
 * POST /api/test/send-email
 * Body: { "to": "test@example.com" }
 */
router.post("/send-email", async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res
        .status(400)
        .json({ message: "Email 'to' address is required" });
    }

    console.log(`📤 Sending test email to ${to}...`);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const emailFrom =
      process.env.EMAIL_FROM || `"ICA Platform" <${process.env.EMAIL_USER}>`;

    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject: "Test Email from ICA Platform",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email Configuration is Working!</h2>
          <p>This is a test email from your ICA Platform backend.</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <hr/>
          <p style="color: #666; font-size: 12px;">
            If you received this email, your SMTP configuration is correct.
          </p>
        </div>
      `,
    });

    console.log(`✅ Test email sent! MessageId: ${info.messageId}`);

    res.json({
      success: true,
      message: "Test email sent successfully!",
      messageId: info.messageId,
      to,
      from: emailFrom,
    });
  } catch (error) {
    console.error("❌ Failed to send test email:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error: error.message,
      errorCode: error.code,
      troubleshooting: getTroubleshootingHint(error.code),
    });
  }
});

function getTroubleshootingHint(errorCode) {
  const hints = {
    EAUTH:
      "Authentication failed. Make sure you're using a Gmail App Password (not your regular password). Enable 2FA and generate an App Password in Google Account settings.",
    ETIMEDOUT:
      "Connection timeout. Port 587 might be blocked by Render. Try using port 465 with secure: true instead.",
    ECONNECTION:
      "Cannot connect to SMTP server. Check if EMAIL_HOST and EMAIL_PORT are correct.",
    ESOCKET:
      "Socket error. This usually means network connectivity issues or firewall blocking SMTP.",
    EENVELOPE:
      "Invalid email address format. Check EMAIL_FROM and recipient email addresses.",
    ENOTFOUND:
      "SMTP host not found. Check if EMAIL_HOST is spelled correctly (should be smtp.gmail.com for Gmail).",
  };

  return (
    hints[errorCode] ||
    "Check your email configuration settings. Make sure all EMAIL_* environment variables are set correctly."
  );
}

export default router;
