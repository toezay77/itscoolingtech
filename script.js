
"use strict";

/* =====================================================
   ITSCOOLINGTECH
   Shared JavaScript for the five-page website
===================================================== */

/*
  BUSINESS CONFIGURATION

  Replace this placeholder with Dad's business WhatsApp
  number in international format.

  Nigerian example:
  08012345678 -> 2348012345678

  Use digits only: no + sign, spaces or hyphens.
*/

const WHATSAPP_NUMBER = "234XXXXXXXXXX";

/* =====================================================
   1. HELPER FUNCTIONS
===================================================== */

function getElement(selector, root = document) {
  return root.querySelector(selector);
}

function getElements(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/* =====================================================
   2. STATUS NOTIFICATIONS
===================================================== */

let notificationTimer;

function showNotice(message, kind = "info") {
  let notice = getElement("#site-notice");

  if (!notice) {
    notice = document.createElement("div");
    notice.id = "site-notice";
    notice.className = "site-notice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    notice.hidden = true;

    document.body.appendChild(notice);
  }

  notice.textContent = message;
  notice.dataset.kind = kind;
  notice.hidden = false;

  window.clearTimeout(notificationTimer);

  notificationTimer = window.setTimeout(() => {
    notice.hidden = true;
  }, 5500);
}

/* =====================================================
   3. WHATSAPP QUOTE ENQUIRIES
===================================================== */

function openWhatsApp(message) {
  const number = WHATSAPP_NUMBER.trim();

  // Do not create an invalid WhatsApp link.
  if (!/^\d{10,15}$/.test(number)) {
    showNotice(
      "WhatsApp is almost ready! Add Itscoolingtech's real " +
      "business number at the top of script.js first.",
      "error"
    );

    return;
  }

  const url =
    "https://wa.me/" +
    number +
    "?text=" +
    encodeURIComponent(message);

  // Open WhatsApp directly from the customer's click.
  window.open(url, "_blank", "noopener,noreferrer");
}

/* General quote and contact buttons */

getElements("[data-contact]").forEach((button) => {
  button.addEventListener("click", () => {
    openWhatsApp(
      "Hello Itscoolingtech! I'd like to enquire about your " +
      "air conditioning and HVAC services. Please help me with " +
      "the available options and a quote."
    );
  });
});
getElements("[data-service-enquiry]").forEach((button) => {
  button.addEventListener("click", () => {
    const serviceName = button.dataset.serviceEnquiry;

    openWhatsApp(
      "Hello Itscoolingtech! I'd like to enquire about " +
      serviceName +
      ". Please let me know the available options and how I can get a quote."
    );
  });
});
/* =====================================================
   4. MOBILE NAVIGATION
===================================================== */

const menuToggle = getElement("#menu-toggle");
const navigation = getElement("#nav-links");

function closeMenu() {
  if (!menuToggle || !navigation) {
    return;
  }

  navigation.classList.remove("open");
  menuToggle.classList.remove("is-open");

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}

if (menuToggle && navigation) {
  menuToggle.addEventListener("click", () => {
    const willOpen = !navigation.classList.contains("open");

    navigation.classList.toggle("open", willOpen);
    menuToggle.classList.toggle("is-open", willOpen);

    menuToggle.setAttribute(
      "aria-expanded",
      String(willOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      willOpen ? "Close navigation" : "Open navigation"
    );
  });

  // Close the menu after a customer selects a page.
  getElements("a", navigation).forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close the menu when the user clicks outside it.
  document.addEventListener("click", (event) => {
    if (
      navigation.classList.contains("open") &&
      !navigation.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  // Support the Escape key.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  // Reset the mobile menu at desktop width.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1050) {
      closeMenu();
    }
  });
}

/* =====================================================
   5. AUTOMATIC ACTIVE-PAGE NAVIGATION
===================================================== */

function highlightCurrentPage() {
  const pathname = window.location.pathname;
  const lastPart = pathname.split("/").filter(Boolean).pop();

  let currentFile = lastPart || "index.html";

  // A URL ending in a directory represents its index page.
  if (!currentFile.includes(".")) {
    currentFile = "index.html";
  }

  try {
    currentFile = decodeURIComponent(currentFile);
  } catch {
    // Keep the original name if decoding fails.
  }

  getElements(".navigation a").forEach((link) => {
    const rawHref = link.getAttribute("href") || "";

    // Ignore section-only links.
    if (!rawHref || rawHref.startsWith("#")) {
      return;
    }

    let linkFile = rawHref.split("#")[0].split("?")[0];

    if (!linkFile.includes("/")) {
      linkFile = linkFile || "index.html";
    } else {
      linkFile = linkFile.split("/").pop() || "index.html";
    }

    const matches =
      linkFile.toLowerCase() === currentFile.toLowerCase();

    if (matches) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

highlightCurrentPage();

/* =====================================================
   6. IMAGE FALLBACKS
===================================================== */

/*
  If a remote image fails to load, reveal the fallback
  included in that image's HTML section.
*/

function recoverImage(image) {
  if (!image || image.dataset.recovered === "true") {
    return;
  }

  image.dataset.recovered = "true";
  image.hidden = true;

  const frame = image.closest(".media-frame");
  const fallback = frame?.querySelector(".image-fallback");

  if (fallback) {
    fallback.hidden = false;
    return;
  }

  // If there is no existing fallback, create a safe one.
  if (frame) {
    const replacement = document.createElement("div");
    replacement.className = "image-fallback";

    const heading = document.createElement("strong");
    heading.textContent = image.alt || "Cooling solutions";

    const message = document.createElement("span");
    message.textContent = "Image temporarily unavailable.";

    replacement.append(heading, message);
    frame.appendChild(replacement);
  }
}

function setupImages() {
  getElements(".media-frame img").forEach((image) => {
    image.addEventListener("error", () => {
      recoverImage(image);
    });

    // Catch an image that failed before the listener was added.
    if (image.complete && image.naturalWidth === 0) {
      recoverImage(image);
    }
  });
}

setupImages();

/* =====================================================
   7. FOOTER COPYRIGHT YEAR
===================================================== */

getElements(".current-year").forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});

/* Backwards compatibility with a single year element. */

const oldYearElement = getElement("#current-year");

if (oldYearElement) {
  oldYearElement.textContent = String(new Date().getFullYear());
}

/* =====================================================
   8. OPTIONAL SCROLL REVEALS
===================================================== */

/*
  Animate elements gently as they appear on screen.
  If the browser does not support IntersectionObserver,
  the content remains visible without the animation.
*/

function setupScrollReveals() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (
    !("IntersectionObserver" in window) ||
    reduceMotion
  ) {
    return;
  }

  const selectors = [
    ".service-card",
    ".process-card",
    ".service-detail",
    ".project-card",
    ".faq-item",
    ".strip-item",
    ".value-card",
    ".contact-info-item"
  ];

  const elements = getElements(selectors.join(","));

  if (elements.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries, activeObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          activeObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -25px 0px"
    }
  );

  elements.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });
}

setupScrollReveals();

/* =====================================================
   9. INITIALISATION COMPLETE
===================================================== */

console.info(
  "Itscoolingtech website scripts loaded successfully."
);
