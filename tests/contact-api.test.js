import test from "node:test";
import assert from "node:assert/strict";
import { OPTIONS, POST, validateSubmission } from "../api/contact.js";

test("validates a complete inquiry", () => {
  const result = validateSubmission({
    name: "Jordan Lee",
    email: "jordan@example.com",
    service_interest: "Educational Planning",
    message: "I would like help reviewing options.",
  });

  assert.equal(result.ok, true);
  assert.equal(result.spam, false);
  assert.equal(result.submission.serviceInterest, "Educational Planning");
});

test("rejects missing required values", () => {
  const result = validateSubmission({ email: "invalid" });
  assert.equal(result.ok, false);
});

test("accepts honeypot submissions without sending", () => {
  const result = validateSubmission({ _honey: "spam" });
  assert.equal(result.ok, true);
  assert.equal(result.spam, true);
});

test("allows preflight requests from the public site", async () => {
  const response = OPTIONS(new Request("https://example.vercel.app/api/contact", {
    method: "OPTIONS",
    headers: { origin: "https://digitalcr8tive.github.io" },
  }));

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "https://digitalcr8tive.github.io");
});

test("returns a configuration error without Resend secrets", async () => {
  const response = await POST(new Request("https://example.vercel.app/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://digitalcr8tive.github.io" },
    body: JSON.stringify({
      name: "Jordan Lee",
      email: "jordan@example.com",
      service_interest: "Educational Planning",
      message: "I would like help reviewing options.",
    }),
  }));

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ok: false, error: "Email delivery is not configured yet." });
});

test("sends a validated inquiry to the configured recipient", { concurrency: false }, async () => {
  const originalFetch = globalThis.fetch;
  const originalEnvironment = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  };
  let resendRequest;

  process.env.RESEND_API_KEY = "re_test_key";
  process.env.CONTACT_TO_EMAIL = "owner@example.com";
  process.env.RESEND_FROM_EMAIL = "The Crystal Dragonfly <inquiries@updates.example.com>";
  globalThis.fetch = async (url, options) => {
    resendRequest = { url, options };
    return new Response(JSON.stringify({ id: "email_123" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };

  try {
    const response = await POST(new Request("https://example.vercel.app/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://digitalcr8tive.github.io" },
      body: JSON.stringify({
        name: "Jordan Lee",
        email: "jordan@example.com",
        service_interest: "Educational Planning",
        preferred_contact_method: "Email",
        message: "I would like help reviewing options.",
      }),
    }));

    const emailPayload = JSON.parse(resendRequest.options.body);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, id: "email_123" });
    assert.equal(resendRequest.url, "https://api.resend.com/emails");
    assert.deepEqual(emailPayload.to, ["owner@example.com"]);
    assert.equal(emailPayload.reply_to, "jordan@example.com");
    assert.match(emailPayload.subject, /Educational Planning/);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
