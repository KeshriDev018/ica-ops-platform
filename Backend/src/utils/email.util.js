import nodemailer from "nodemailer";

export const sendSetPasswordEmail = async (email, link, role ) => {
  const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();
  // COACH -> Coach, ADMIN -> Admin

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ICA Ops" <${process.env.EMAIL_FROM}>`,
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

  console.log(`✅ Set-password email sent to ${email} (${roleLabel})`);
};
