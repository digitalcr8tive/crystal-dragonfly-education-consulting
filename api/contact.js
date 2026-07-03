const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_ALLOWED_ORIGINS = [
  "https://digitalcr8tive.github.io",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:4175",
  "http://localhost:4173",
  "http://localhost:4175",
];

function configuredOrigins() {
  const customOrigins = String(process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...customOrigins]);
}

function corsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    Vary: "Origin",
  };
  if (origin && configuredOrigins().has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

function clean(value, maximumLength) {
  return String(value || "").trim().slice(0, maximumLength);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function validateSubmission(input) {
  const submission = {
    name: clean(input.name, 120),
    email: clean(input.email, 254).toLowerCase(),
    phone: clean(input.phone, 40),
    serviceInterest: clean(input.serviceInterest || input.service_interest, 120),
    preferredContactMethod: clean(input.preferredContactMethod || input.preferred_contact_method, 80),
    message: clean(input.message, 5000),
    website: clean(input.website || input._honey, 200),
  };

  if (submission.website) return { ok: true, spam: true, submission };

  const missing = ["name", "email", "serviceInterest", "message"].filter((field) => !submission[field]);
  if (missing.length) return { ok: false, error: "Please complete every required field." };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(submission.email)) return { ok: false, error: "Please enter a valid email address." };

  return { ok: true, spam: false, submission };
}

function emailContent(submission) {
  const rows = [
    ["Name", submission.name],
    ["Email", submission.email],
    ["Phone", submission.phone || "Not provided"],
    ["Service interest", submission.serviceInterest],
    ["Preferred contact method", submission.preferredContactMethod || "Not provided"],
  ];

  const htmlRows = rows
    .map(([label, value]) => `<tr><th align="left" style="padding:8px 12px;border-bottom:1px solid #d8e3ea;color:#123550;">${escapeHtml(label)}</th><td style="padding:8px 12px;border-bottom:1px solid #d8e3ea;">${escapeHtml(value)}</td></tr>`)
    .join("");

  const textRows = rows.map(([label, value]) => `${label}: ${value}`).join("\n");

  return {
    html: `<div style="font-family:Arial,sans-serif;color:#1b3142;line-height:1.6;"><h1 style="color:#123550;font-size:24px;">New website inquiry</h1><table style="border-collapse:collapse;width:100%;max-width:640px;">${htmlRows}</table><h2 style="color:#123550;font-size:18px;margin-top:24px;">Message</h2><p style="white-space:pre-wrap;">${escapeHtml(submission.message)}</p></div>`,
    text: `New website inquiry\n\n${textRows}\n\nMessage:\n${submission.message}`,
  };
}

export function OPTIONS(request) {
  const origin = request.headers.get("origin") || "";
  if (origin && !configuredOrigins().has(origin)) return jsonResponse({ ok: false }, 403, origin);
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request) {
  const origin = request.headers.get("origin") || "";
  if (!configuredOrigins().has(origin)) return jsonResponse({ ok: false, error: "Origin not allowed." }, 403, origin);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 25000) return jsonResponse({ ok: false, error: "Request is too large." }, 413, origin);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid form request." }, 400, origin);
  }

  const validation = validateSubmission(payload || {});
  if (!validation.ok) return jsonResponse({ ok: false, error: validation.error }, 400, origin);
  if (validation.spam) return jsonResponse({ ok: true }, 200, origin);

  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const recipient = String(process.env.CONTACT_TO_EMAIL || "").trim();
  const sender = String(process.env.RESEND_FROM_EMAIL || "").trim();
  if (!apiKey || !recipient || !sender) {
    return jsonResponse({ ok: false, error: "Email delivery is not configured yet." }, 503, origin);
  }

  const content = emailContent(validation.submission);
  const resendResponse = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `website-contact/${crypto.randomUUID()}`,
      "User-Agent": "CrystalDragonflyWebsite/1.0",
    },
    body: JSON.stringify({
      from: sender,
      to: [recipient],
      reply_to: validation.submission.email,
      subject: `Website inquiry: ${validation.submission.serviceInterest}`,
      html: content.html,
      text: content.text,
      tags: [{ name: "source", value: "website-contact" }],
    }),
  });

  const resendResult = await resendResponse.json().catch(() => ({}));
  if (!resendResponse.ok) {
    console.error("Resend delivery failed", resendResponse.status, resendResult);
    return jsonResponse({ ok: false, error: "The message could not be sent. Please try again shortly." }, 502, origin);
  }

  return jsonResponse({ ok: true, id: resendResult.id }, 200, origin);
}
