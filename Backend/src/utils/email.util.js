import * as brevo from "@getbrevo/brevo";

// Initialize Brevo API client
let apiInstance = null;

const getBrevoClient = () => {
  if (!apiInstance) {
    apiInstance = new brevo.TransactionalEmailsApi();
    
    // Set API key
    apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;
    
    console.log("📧 Brevo email client initialized", {
      senderEmail: process.env.BREVO_SENDER_EMAIL,
      senderName: process.env.BREVO_SENDER_NAME,
      hasApiKey: !!process.env.BREVO_API_KEY,
    });
  }
  return apiInstance;
};

export const sendSetPasswordEmail = async (email, link, role) => {
  try {
    const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();
    // COACH -> Coach, ADMIN -> Admin

    console.log(`📤 Attempting to send email to ${email} (${roleLabel})`);

    const client = getBrevoClient();

    // Prepare email data
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.sender = {
      name: process.env.BREVO_SENDER_NAME || "ICA Platform",
      email: process.env.BREVO_SENDER_EMAIL
    };
    
    sendSmtpEmail.to = [{ email: email }];
    
    sendSmtpEmail.subject = `Set your password for your ${roleLabel} account`;
    
    sendSmtpEmail.htmlContent = `
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
    `;

    console.log(`📧 Email config - From: ${sendSmtpEmail.sender.email}, To: ${email}`);

    // Send email via Brevo
    const data = await client.sendTransacEmail(sendSmtpEmail);
    
    console.log(`✅ Email sent successfully via Brevo! MessageId: ${data.messageId}`);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    
    // Log Brevo-specific error details
    if (error.response) {
      console.error(`❌ Brevo API Error: ${error.response.statusCode}`);
      console.error(`Error details:`, error.response.body);
      
      if (error.response.statusCode === 401) {
        console.error("🔴 Authentication failed - Check BREVO_API_KEY");
      } else if (error.response.statusCode === 400) {
        console.error("🔴 Bad request - Check email format or sender verification");
        console.error("💡 Verify sender email at https://app.brevo.com/settings/sender");
      }
    } else {
      console.error(`Full error:`, error);
    }

    throw new Error(`Email sending failed: ${error.message}`);
  }
};
