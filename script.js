const config = window.CRYSTAL_DRAGONFLY_CONFIG || {};
const navToggle = document.querySelector("[data-nav-toggle]");
const navigation = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");

function closeNavigation() {
  if (!navToggle || !navigation) return;
  navigation.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.querySelector(".sr-only").textContent = "Open navigation";
  document.body.classList.remove("nav-open");
}

navToggle?.addEventListener("click", () => {
  const opening = !navigation.classList.contains("open");
  navigation.classList.toggle("open", opening);
  navToggle.setAttribute("aria-expanded", String(opening));
  navToggle.querySelector(".sr-only").textContent = opening ? "Close navigation" : "Open navigation";
  document.body.classList.toggle("nav-open", opening);
});

navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeNavigation();
});

window.addEventListener("scroll", () => header?.classList.toggle("is-scrolled", window.scrollY > 12), { passive: true });

const currentPage = document.body.dataset.page;
const currentPageLink = currentPage ? navigation?.querySelector(`[data-nav-page="${currentPage}"]`) : null;
if (currentPageLink) {
  currentPageLink.classList.add("active");
  currentPageLink.setAttribute("aria-current", "page");
}

const sectionLinks = [...document.querySelectorAll('.primary-nav a[href^="#"]:not(.button)')];
const sections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    sectionLinks.forEach((link) => {
      const selected = link.getAttribute("href") === `#${visible.target.id}`;
      link.classList.toggle("active", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }, { rootMargin: "-20% 0px -68%", threshold: [0, 0.15, 0.5] });
  sections.forEach((section) => sectionObserver.observe(section));
}

const contactDetails = document.querySelector("[data-contact-details]");
const businessEmail = String(config.businessEmail || "").trim();
const businessPhone = String(config.businessPhone || "").trim();
if (contactDetails && (businessEmail || businessPhone)) {
  if (businessEmail && businessEmail.includes("@")) {
    const emailLink = document.createElement("a");
    emailLink.href = `mailto:${businessEmail}`;
    emailLink.textContent = businessEmail;
    contactDetails.append(emailLink);
  }
  if (businessPhone) {
    const phoneLink = document.createElement("a");
    phoneLink.href = `tel:${businessPhone.replace(/[^+\d]/g, "")}`;
    phoneLink.textContent = businessPhone;
    contactDetails.append(phoneLink);
  }
  contactDetails.hidden = contactDetails.children.length === 0;
}

const serviceArea = String(config.serviceArea || "").trim();
const serviceAreaElement = document.querySelector("[data-service-area]");
if (serviceArea && serviceAreaElement) serviceAreaElement.textContent = serviceArea;

const contactForm = document.querySelector("[data-contact-form]");
const contactStatus = document.querySelector("[data-contact-status]");
const resendApiKey = String(config.resendApiKey || "").trim();
const toEmail = String(config.toEmail || "").trim();
const fromEmail = String(config.fromEmail || "").trim() || "Crystal Dragonfly <onboarding@resend.dev>";

if (contactForm) {
  const resendReady = resendApiKey && toEmail && toEmail.includes("@");

  if (resendReady || (businessEmail && businessEmail.includes("@"))) {
    if (contactStatus) contactStatus.textContent = "Your message will be sent to the business owner for follow-up.";

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target;
      const data = new FormData(form);

      if (resendReady) {
        if (contactStatus) contactStatus.textContent = "Sending…";

        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [toEmail],
              subject: data.get("_subject") || "New inquiry from The Crystal Dragonfly website",
              reply_to: data.get("email") || undefined,
              html: [
                "<h2>New Contact Form Inquiry</h2>",
                "<table style='border-collapse:collapse;width:100%;max-width:600px'>",
                `<tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold'>Name</td><td style='padding:8px;border:1px solid #ddd'>${data.get("name") || "—"}</td></tr>`,
                `<tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold'>Email</td><td style='padding:8px;border:1px solid #ddd'>${data.get("email") || "—"}</td></tr>`,
                `<tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold'>Phone</td><td style='padding:8px;border:1px solid #ddd'>${data.get("phone") || "—"}</td></tr>`,
                `<tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold'>Service Interest</td><td style='padding:8px;border:1px solid #ddd'>${data.get("service_interest") || "—"}</td></tr>`,
                `<tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold'>Preferred Contact</td><td style='padding:8px;border:1px solid #ddd'>${data.get("preferred_contact_method") || "—"}</td></tr>`,
                `<tr><td style='padding:8px;border:1px solid #ddd;font-weight:bold'>Message</td><td style='padding:8px;border:1px solid #ddd'>${data.get("message") || ""}</td></tr>`,
                "</table>",
              ].join(""),
            }),
          });

          if (response.ok) {
            if (contactStatus) contactStatus.textContent = "Thank you. Your message has been sent.";
            form.reset();
          } else {
            const err = await response.json().catch(() => ({}));
            console.error("Resend error:", err);
            if (contactStatus) contactStatus.textContent = "Failed to send. Please try again or email directly.";
          }
        } catch (error) {
          console.error("Resend error:", error);
          if (contactStatus) contactStatus.textContent = "Failed to send. Please try again or email directly.";
        }
      } else {
        // Fallback: FormSubmit via businessEmail
        form.action = `https://formsubmit.co/${encodeURIComponent(businessEmail)}`;
        form.submit();
      }
    });
  } else {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (contactStatus) contactStatus.textContent = "Add the owner email or Resend API key in site-config.js before this form can send messages.";
    });
  }

  if (new URLSearchParams(window.location.search).get("sent") === "true" && contactStatus) {
    contactStatus.textContent = "Thank you. Your message has been sent.";
  }
}

document.querySelectorAll(".faq-list details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

const yearElement = document.querySelector("[data-year]");
if (yearElement) yearElement.textContent = new Date().getFullYear();

window.addEventListener("load", () => {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
});
