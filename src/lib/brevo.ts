// src/lib/brevo.ts
export async function sendBrevoEmail({
  toEmail,
  toName,
  subject,
  htmlContent,
}: {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
}) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY is missing in environment variables!");
    return { success: false, error: "API Key missing" };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        // Sender MUST be the exact verified email on Brevo dashboard
        sender: { name: "CatchBuddy Support", email: "support@catchbuddy.in" },
        to: [{ email: toEmail, name: toName }],
        subject,
        htmlContent,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Brevo API Error Response:", data);
      return { success: false, error: data.message || "Brevo dispatch failed" };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Brevo Email Exception:", error);
    return { success: false, error: error.message };
  }
}