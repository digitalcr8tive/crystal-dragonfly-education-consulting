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

## Connect the contact form

1. Open `site-config.js`.
2. Add the business owner email to `businessEmail`, or add a dedicated form service URL to `contactFormEndpoint`.
3. Submit a test message from `contact.html`.
4. If using FormSubmit through `businessEmail`, confirm the owner email address after the first test submission.

The form is ready for GitHub Pages, but it needs a real recipient email or form endpoint before messages can reach the owner.

## Add business details later

Optional phone and service-area values are grouped in `site-config.js`. The current public layout intentionally does not publish placeholder contact details.
