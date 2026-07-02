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
const contactEndpoint = String(config.contactFormEndpoint || "").trim();

function isValidEndpoint(value) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

if (contactForm) {
  let formActionConfigured = false;

  if (isValidEndpoint(contactEndpoint)) {
    contactForm.action = contactEndpoint;
    formActionConfigured = true;
  } else if (businessEmail && businessEmail.includes("@")) {
    contactForm.action = `https://formsubmit.co/${encodeURIComponent(businessEmail)}`;
    formActionConfigured = true;
  }

  if (formActionConfigured) {
    const redirectUrl = `${window.location.origin}${window.location.pathname}?sent=true`;
    contactForm.insertAdjacentHTML("beforeend", `<input type="hidden" name="_next" value="${redirectUrl}">`);
    if (contactStatus) contactStatus.textContent = "Your message will be sent to the business owner for follow-up.";
  } else {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (contactStatus) contactStatus.textContent = "Add the owner email or form endpoint in site-config.js before this form can send messages.";
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
