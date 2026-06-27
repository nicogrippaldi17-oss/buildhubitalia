/* ===============================
   BUILD HUB — Main JavaScript
   =============================== */

document.addEventListener("DOMContentLoaded", function () {
  // ----- SCROLL REVEAL -----
  const revealElements = document.querySelectorAll(
    ".reveal, .reveal-left, .reveal-right, .reveal-stagger"
  );

  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  // Stagger children
  document.querySelectorAll(".reveal-stagger").forEach(function (parent) {
    const children = parent.children;
    for (let i = 0; i < children.length; i++) {
      const staggerObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              staggerObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      staggerObserver.observe(children[i]);
    }
  });

  // ----- STATS COUNTER -----
  const statNumbers = document.querySelectorAll(".stat-number");
  if (statNumbers.length > 0) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute("data-target"), 10);
            const suffix = el.getAttribute("data-suffix") || "";
            animateCounter(el, target, suffix);
            counterObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(function (el) {
      const text = el.textContent.trim();
      const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(num)) {
        el.setAttribute("data-target", num);
        // Extract suffix (any non-digit character after number)
        const match = text.match(/[^0-9]+$/);
        if (match) el.setAttribute("data-suffix", match[0]);
      }
      el.textContent = "0";
      counterObserver.observe(el);
    });
  }

  function animateCounter(el, target, suffix) {
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    let current = 0;
    const timer = setInterval(function () {
      current += step;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(timer);
      } else {
        el.textContent = current + suffix;
      }
    }, 16);
  }

  // ----- CONTACT FORM -----
  const contactForm = document.getElementById("contactForm");
  const lang = document.documentElement.lang || "it";
  const texts = lang === "en"
      ? { required: "Required", invalidEmail: "Invalid email", tooShort: "Message must be at least 10 characters", sending: "Sending...", sendBtn: "Request a consultation" }
      : { required: "Campo obbligatorio", invalidEmail: "Email non valida", tooShort: "Il messaggio deve contenere almeno 10 caratteri", sending: "Invio...", sendBtn: "Richiedi una consulenza" };
    const successMsg = document.getElementById("formSuccess");
    const errorBanner = document.getElementById("formError");
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const spinner = submitBtn ? submitBtn.querySelector(".spinner") : null;
    const btnText = submitBtn ? submitBtn.querySelector(".btn-text") : null;

    // Live validation
    contactForm.querySelectorAll("input, textarea").forEach(function (field) {
      field.addEventListener("blur", function () {
        validateField(field);
      });
      field.addEventListener("input", function () {
        if (field.classList.contains("error")) {
          validateField(field);
        }
      });
    });

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Reset
      if (errorBanner) errorBanner.classList.remove("show");
      if (successMsg) successMsg.classList.remove("show");

      // Validate all
      const fields = contactForm.querySelectorAll(
        "input[required], textarea[required]"
      );
      let valid = true;
      fields.forEach(function (field) {
        if (!validateField(field)) valid = false;
      });

      // Privacy checkbox
      const privacy = document.getElementById("privacy");
      if (privacy && !privacy.checked) {
        valid = false;
        privacy.closest(".form-group").querySelector(".error-text").style.display =
          "block";
      }

      if (!valid) return;

      // Submit to Netlify
      if (submitBtn) submitBtn.disabled = true;
      if (spinner) spinner.classList.add("show");
      if (btnText) btnText.textContent = texts.sending;

      var formData = new FormData(contactForm);
      var encoded = new URLSearchParams(formData).toString();

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encoded
      })
      .then(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.classList.remove("show");
        if (btnText) btnText.textContent = texts.sendBtn;
        if (successMsg) {
          successMsg.classList.add("show");
          contactForm.style.display = "none";
        }
      })
      .catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (spinner) spinner.classList.remove("show");
        if (btnText) btnText.textContent = texts.sendBtn;
        if (errorBanner) errorBanner.classList.add("show");
      });
    });
  }

  function validateField(field) {
    const errorEl = field
      .closest(".form-group")
      ?.querySelector(".error-text");
    if (!errorEl) return true;

    let valid = true;
    let message = "";

    if (field.hasAttribute("required") && !field.value.trim()) {
      valid = false;
      message = texts.required;
    } else if (field.type === "email" && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value.trim())) {
        valid = false;
        message = texts.invalidEmail;
      }
    } else if (
      field.id === "messaggio" &&
      field.value.trim().length < 10 &&
      field.value.trim().length > 0
    ) {
      valid = false;
      message = texts.tooShort;
    }

    field.classList.toggle("error", !valid);
    errorEl.textContent = message;
    errorEl.style.display = valid ? "none" : "block";
    return valid;
  }
});
