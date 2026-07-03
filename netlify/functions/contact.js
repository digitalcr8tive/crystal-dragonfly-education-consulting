const { Resend } = require("resend");

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = process.env.CONTACT_FORM_TO_EMAIL;
const FROM_EMAIL =
  process.env.CONTACT_FORM_FROM_EMAIL ||
  "Crystal Dragonfly <onboarding@resend.dev>";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable");
    return {
      statusCode: 500,
      body: "Server configuration error: missing API key.",
    };
  }

  if (!TO_EMAIL) {
    console.error("Missing CONTACT_FORM_TO_EMAIL environment variable");
    return {
      statusCode: 500,
      body: "Server configuration error: missing recipient email.",
    };
  }

  const body = new URLSearchParams(event.body);
  const name = body.get("name") || "Not provided";
  const email = body.get("email") || "Not provided";
  const phone = body.get("phone") || "Not provided";
  const serviceInterest = body.get("service_interest") || "Not provided";
  const preferredContact = body.get("preferred_contact_method") || "Email";
  const message = body.get("message") || "No message";

  const html = `
<h2>New Contact Form Inquiry</h2>
<table style="border-collapse:collapse;width:100%;max-width:600px">
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${name}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${email}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${phone}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Service Interest</td><td style="padding:8px;border:1px solid #ddd">${serviceInterest}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Preferred Contact</td><td style="padding:8px;border:1px solid #ddd">${preferredContact}</td></tr>
  <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Message</td><td style="padding:8px;border:1px solid #ddd">${message}</td></tr>
</table>
  `.trim();

  const text = `
New Contact Form Inquiry

Name: ${name}
Email: ${email}
Phone: ${phone}
Service Interest: ${serviceInterest}
Preferred Contact: ${preferredContact}

Message:
${message}
  `.trim();

  try {
    const resend = new Resend(RESEND_API_KEY);

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: body.get("_subject") || "New inquiry from The Crystal Dragonfly website",
      html,
      text,
      reply_to: email,
    });

    return {
      statusCode: 302,
      headers: {
        Location: `${event.headers.referer || "/contact.html"}?sent=true`,
      },
      body: "",
    };
  } catch (error) {
    console.error("Resend send error:", error);
    return {
      statusCode: 500,
      body: "Failed to send message. Please try again or email directly.",
    };
  }
};
