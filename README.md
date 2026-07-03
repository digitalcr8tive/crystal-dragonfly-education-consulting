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

## Activate Resend email delivery

GitHub Pages hosts the public website, but a server-side function is required to keep the Resend API key private. The secure function is included at `api/contact.js` and is ready to deploy through Vercel.

1. Import this GitHub repository into Vercel.
2. Add these Production environment variables in Vercel:
   - `RESEND_API_KEY`: API key from the Resend dashboard.
   - `CONTACT_TO_EMAIL`: business owner's recipient email.
   - `RESEND_FROM_EMAIL`: verified sender, such as `The Crystal Dragonfly <inquiries@updates.example.com>`.
   - `ALLOWED_ORIGINS`: optional comma-separated additional origins. The public GitHub Pages origin is already allowed.
   - The same names are listed in `.env.example` for reference. Never commit real values.
3. Verify the sending domain in Resend by adding the SPF and DKIM records it provides.
4. Deploy the Vercel project.
5. Copy the deployed URL into `contactFormEndpoint` in `site-config.js`, ending in `/api/contact`.
6. Submit a test message from `contact.html` and confirm it appears in the Resend logs and the recipient inbox.

Do not place `RESEND_API_KEY` or `CONTACT_TO_EMAIL` in `site-config.js`; that file is public. Until the endpoint URL and environment variables are added, the form remains safely disabled instead of losing submissions.

## Add business details later

Optional phone and service-area values are grouped in `site-config.js`. The current public layout intentionally does not publish placeholder contact details.
