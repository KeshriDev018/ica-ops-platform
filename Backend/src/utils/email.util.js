export const sendSetPasswordEmail = async (email, link, role) => {
  try {
    const roleLabel = role.charAt(0) + role.slice(1).toLowerCase();

    console.log("📤 Sending email via Brevo REST API to:", email);
    console.log("🔑 API key loaded:", !!process.env.BREVO_API_KEY);

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL,
          name: process.env.BREVO_SENDER_NAME,
        },
        to: [{ email }],
        subject: `Set your password for your ${roleLabel} account`,
        htmlContent: `
          <h2>Welcome to ICA</h2>
          <p>Your ${roleLabel} account has been created.</p>
          <a href="${link}">Set your password</a>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Brevo error:", data);
      throw new Error(data.message || "Brevo email failed");
    }

    console.log("✅ Email sent successfully via Brevo REST API");
    return { success: true };
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    throw err;
  }
};
