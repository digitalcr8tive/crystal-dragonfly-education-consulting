window.CRYSTAL_DRAGONFLY_CONFIG = {
  // The Netlify serverless function that forwards form data via Resend.
  // Set to a full https:// URL if using a different backend.
  contactFormEndpoint: "/.netlify/functions/contact",

  // Optional: fallback email for FormSubmit if the Resend endpoint is unavailable.
  // FormSubmit may require the owner to confirm the email address after the first test submission.
  businessEmail: "",

  // This optional value can be added when the business details are ready.
  businessPhone: "",
  serviceArea: "Arkansas and virtual consultations",
};
