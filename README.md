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

The contact form sends submissions through Resend using a Netlify serverless function. The API key stays server-side — never exposed to the browser.

### Quick setup for the business owner

1. **Get a Resend API key** at https://resend.com/api-keys
2. **Deploy to Netlify** (one-click import from this repo)
3. **Add environment variables** in Netlify → Site settings → Environment variables:
   - `RESEND_API_KEY` — your Resend API key
   - `CONTACT_FORM_TO_EMAIL` — the email where inquiries should arrive
   - (optional) `CONTACT_FORM_FROM_EMAIL` — verified sending address for your domain
4. **Triggers a deploy** so Netlify picks up the new variables
5. **Submit a test message** from `contact.html` to confirm delivery

### How it works

```
contact.html form
  → POST to /.netlify/functions/contact
    → Resend API sends email to CONTACT_FORM_TO_EMAIL
      → redirects back to /contact.html?sent=true
```

### Fallback (no Netlify)

Edit `site-config.js` and set `businessEmail` to the owner's address. The form will route through FormSubmit instead. FormSubmit may require email confirmation after the first test submission.

## Add business details later

Optional phone and service-area values are grouped in `site-config.js`. The current public layout intentionally does not publish placeholder contact details.
