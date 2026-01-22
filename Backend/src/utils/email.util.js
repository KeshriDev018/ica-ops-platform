import nodemailer from "nodemailer";

// Create reusable transporter (connection pooling)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // use STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates (some hosts need this)
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 10,
  });
};

let transporter;

// Get or create transporter instance
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

export const sendSetPasswordEmail = async (email, link, role) => {
  try {
    const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();
    // COACH -> Coach, ADMIN -> Admin

    console.log(`📤 Attempting to send email to ${email} (${roleLabel})`);

    const mailTransporter = getTransporter();

    // Handle EMAIL_FROM - could be just email or "Name <email>" format
    const emailFrom =
      process.env.EMAIL_FROM || `"ICA Platform" <${process.env.EMAIL_USER}>`;

    console.log(`📧 Email config - From: ${emailFrom}, To: ${email}`);

    const info = await mailTransporter.sendMail({
      from: emailFrom,
      to: email,
      subject: `Set your password for your ${roleLabel} account`,
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to ICA</h2>

        <p>Hello,</p>

        <p>
          Your <strong>${roleLabel}</strong> account has been created.
        </p>

        <p>
          Please click the button below to set your password:
        </p>

        <p style="margin: 20px 0;">
          <a
            href="${link}"
            style="
              background-color: #2563eb;
              color: #ffffff;
              padding: 10px 16px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;
            "
          >
            Set Your Password
          </a>
        </p>

        <p>
          If the button does not work, copy and paste this link into your browser:
        </p>

        <p style="word-break: break-all;">
          ${link}
        </p>

        <p style="margin-top: 20px;">
          This link will expire in <strong>24 hours</strong>.
        </p>

        <p>
          — ICA Team
        </p>
      </div>
    `,
    });

    console.log(`✅ Email sent successfully! MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    console.error(`Error code: ${error.code}`);
    console.error(`Full error:`, error);

    // Log specific error details for debugging on Render
    if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
      console.error(
        "🔴 Connection timeout - Check if SMTP port is accessible from Render",
      );
      console.error(
        "💡 Try using port 465 with secure: true instead of port 587",
      );
    } else if (error.code === "EAUTH") {
      console.error(
        "🔴 Authentication failed - Check EMAIL_USER and EMAIL_PASS env variables",
      );
      console.error(
        "💡 Make sure you're using Gmail App Password, not regular password",
      );
    } else if (error.code === "ESOCKET") {
      console.error("🔴 Socket error - Network connectivity issue");
      console.error("💡 Render might be blocking SMTP connections");
    }

    throw new Error(`Email sending failed: ${error.message}`);
  }
};
