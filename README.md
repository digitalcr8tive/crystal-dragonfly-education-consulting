# The Crystal Dragonfly Education Consulting

A responsive multi-page website for Crystal Green-Braswell's education consulting practice.

## Website pages

- `index.html`: Home and practice overview
- `about.html`: Biography, credentials, and consulting approach
- `services.html`: All five consulting services
- `faq.html`: Frequently asked questions
- `contact.html`: Contact form for client inquiries

## Preview locally

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4173`.

## Connect the contact form (Resend)

The contact form sends submissions through Resend's API directly. No backend or serverless platform required — works on any static host (GitHub Pages, Porkbun, etc.).

### Quick setup for the business owner

1. **Get a Resend API key** at https://resend.com/api-keys
   - For security, restrict the key to the site's domain in the Resend dashboard
2. **Verify your domain** in Resend (or use `onboarding@resend.dev` for testing)
3. **Open `site-config.js`** and fill in:
   - `resendApiKey` — your Resend API key
   - `toEmail` — the email where inquiries should arrive
   - (optional) `fromEmail` — a verified sending address for your domain
4. **Test** — submit the contact form and confirm the email arrives

### How it works

```
contact.html form submit
  → JavaScript fetch() to https://api.resend.com/emails
    → Resend delivers email to toEmail
      → form shows "Thank you" and resets
```

### Security note

The Resend API key is visible in the site's source code. Create a **domain-restricted key** in the Resend dashboard (Settings → API Keys → restrict to your domain) so the key can't be used from other sites.

## Add business details later

Optional phone and service-area values are grouped in `site-config.js`. The current public layout intentionally does not publish placeholder contact details.
