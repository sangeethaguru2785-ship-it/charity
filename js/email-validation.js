(() => {
  "use strict";

  const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const EMPTY_MESSAGE = "Please enter your email address.";
  const ERROR_MESSAGE =
    "Enter a valid email address — for example, name@example.com.";
  const errorElements = new WeakMap();

  function getErrorElement(input) {
    if (errorElements.has(input)) return errorElements.get(input);

    let error = input.parentElement?.querySelector(".invalid-feedback");
    if (!error) error = input.closest(".auth-field")?.querySelector(".invalid-feedback");

    if (error) {
      error.classList.add("email-error");
    } else {
      error = document.createElement("p");
      error.className = "email-error";
      const newsletter = input.closest(".newsletter-form");
      if (newsletter) {
        newsletter.insertAdjacentElement("afterend", error);
      } else {
        (input.closest(".auth-field") || input.parentElement)?.appendChild(error);
      }
    }

    error.setAttribute("role", "alert");
    error.setAttribute("aria-live", "polite");
    errorElements.set(input, error);
    return error;
  }

  function setValidity(input, isValid, show, message) {
    input.setCustomValidity(isValid ? "" : message);
    input.setAttribute("aria-invalid", isValid ? "false" : "true");
    input.classList.toggle("is-invalid", !isValid && show);

    const error = getErrorElement(input);
    error.textContent = !isValid && show ? message : "";
    error.classList.toggle("is-visible", !isValid && show);

    const newsletter = input.closest(".newsletter-form");
    if (newsletter) newsletter.classList.toggle("has-email-error", !isValid && show);
  }

  function validate(input, show = true) {
    const value = input.value.trim();

    if (!value) {
      const isValid = !input.required;
      setValidity(input, isValid, show, EMPTY_MESSAGE);
      return isValid;
    }

    const isValid = EMAIL_PATTERN.test(value);
    setValidity(input, isValid, show, ERROR_MESSAGE);
    return isValid;
  }

  function init() {
    const inputs = Array.from(document.querySelectorAll('input[type="email"]'));

    inputs.forEach((input) => {
      const form = input.closest("form");
      if (form) form.noValidate = true;

      input.addEventListener("input", () => {
        if (input.dataset.emailTouched === "true") {
          validate(input);
        }
      });

      input.addEventListener("blur", () => {
        input.dataset.emailTouched = "true";
        validate(input, input.value.trim().length > 0 || input.required);
      });
    });

    document.addEventListener(
      "submit",
      (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;

        const formEmailInputs = Array.from(form.querySelectorAll('input[type="email"]'));
        if (!formEmailInputs.length) return;

        let firstInvalid = null;
        formEmailInputs.forEach((input) => {
          input.dataset.emailTouched = "true";
          if (!validate(input, true) && !firstInvalid) firstInvalid = input;
        });

        if (firstInvalid) {
          event.preventDefault();
          event.stopImmediatePropagation();
          firstInvalid.focus();
          return;
        }

        if (form.classList.contains("newsletter-form")) {
          event.preventDefault();
          event.stopImmediatePropagation();
          window.location.assign("404.html");
        }
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
