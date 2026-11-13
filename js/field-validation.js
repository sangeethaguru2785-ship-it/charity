(() => {
  "use strict";

  const SELECTOR = '[data-validate="name"], [data-validate="digits"]';
  const NAME_PATTERN = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
  const DIGIT_PATTERN = /^\d+$/;
  const MESSAGES = {
    name: "Only letters (A-Z) and spaces are allowed - no numbers or special characters.",
    digits: "Only digits (0-9) are allowed - no letters or special characters.",
    nameRequired: "Please enter your name.",
    digitsRequired: "Please enter a number."
  };
  const errorElements = new WeakMap();

  const modeOf = (input) => input.dataset.validate;

  function getErrorElement(input) {
    if (errorElements.has(input)) return errorElements.get(input);

    let error = input.parentElement?.querySelector(".invalid-feedback");
    if (!error) error = input.closest(".auth-field")?.querySelector(".invalid-feedback");

    if (error) {
      error.classList.add("field-error");
    } else {
      error = document.createElement("p");
      error.className = "field-error";
      const amountGrid = input.closest(".amount-grid");
      if (amountGrid) {
        amountGrid.insertAdjacentElement("afterend", error);
      } else {
        (input.closest(".auth-field") || input.parentElement)?.appendChild(error);
      }
    }

    error.setAttribute("role", "alert");
    error.setAttribute("aria-live", "polite");
    errorElements.set(input, error);
    return error;
  }

  function setError(input, message, blockSubmit) {
    const error = getErrorElement(input);
    error.textContent = message;
    error.classList.add("is-visible");
    input.classList.add("is-invalid");
    input.setAttribute("aria-invalid", "true");
    input.setCustomValidity(blockSubmit ? message : "");
  }

  function clearError(input) {
    const error = getErrorElement(input);
    error.textContent = "";
    error.classList.remove("is-visible");
    input.classList.remove("is-invalid");
    input.setAttribute("aria-invalid", "false");
    input.setCustomValidity("");
  }

  function sanitizeValue(input) {
    const raw = input.value;
    const mode = modeOf(input);
    const cleaned =
      mode === "name"
        ? raw.replace(/[^A-Za-z ]/g, "").replace(/ {2,}/g, " ")
        : raw.replace(/\D/g, "");

    if (raw === cleaned) return false;

    const caret = input.selectionStart ?? raw.length;
    const before = raw.slice(0, caret);
    const cleanedBefore =
      mode === "name"
        ? before.replace(/[^A-Za-z ]/g, "").replace(/ {2,}/g, " ")
        : before.replace(/\D/g, "");

    input.value = cleaned;
    try {
      input.setSelectionRange(cleanedBefore.length, cleanedBefore.length);
    } catch (_) {
      return true;
    }
    return true;
  }

  function validate(input) {
    const mode = modeOf(input);
    const value = input.value.trim();

    if (!value) {
      if (input.required) {
        setError(input, mode === "name" ? MESSAGES.nameRequired : MESSAGES.digitsRequired, true);
        return false;
      }
      clearError(input);
      return true;
    }

    if (!(mode === "name" ? NAME_PATTERN : DIGIT_PATTERN).test(value)) {
      setError(input, MESSAGES[mode], true);
      return false;
    }

    if (mode === "digits" && input.type === "number" && input.min) {
      const min = Number(input.min);
      if (Number.isFinite(min) && Number(value) < min) {
        setError(input, `Enter a number of ${min} or more.`, true);
        return false;
      }
    }

    clearError(input);
    return true;
  }

  function init() {
    const inputs = Array.from(document.querySelectorAll(SELECTOR));

    inputs.forEach((input) => {
      input.addEventListener("input", () => {
        const rejected = sanitizeValue(input);
        if (rejected) {
          input.dataset.rejected = "true";
          setError(input, MESSAGES[modeOf(input)], false);
          return;
        }

        if (input.dataset.rejected === "true") {
          input.dataset.rejected = "false";
        }

        if (input.dataset.touched === "true" || input.value.trim()) {
          validate(input);
        } else {
          clearError(input);
        }
      });

      input.addEventListener("blur", () => {
        input.dataset.touched = "true";
        if (modeOf(input) === "name") {
          input.value = input.value.replace(/ {2,}/g, " ").trim();
        }
        validate(input);
      });
    });

    document.addEventListener(
      "submit",
      (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;

        const fields = Array.from(form.querySelectorAll(SELECTOR));
        if (!fields.length) return;

        let firstInvalid = null;
        fields.forEach((input) => {
          input.dataset.touched = "true";
          if (modeOf(input) === "name") {
            input.value = input.value.replace(/ {2,}/g, " ").trim();
          }
          if (!validate(input) && !firstInvalid) firstInvalid = input;
        });

        if (firstInvalid) {
          event.preventDefault();
          event.stopImmediatePropagation();
          firstInvalid.focus();
        }
      },
      true
    );

    document.addEventListener(
      "click",
      (event) => {
        const donateBtn = event.target.closest("#donateBtn");
        if (!donateBtn) return;

        const customAmount = document.getElementById("customAmount");
        if (!customAmount || !customAmount.value.trim()) return;

        if (!validate(customAmount)) {
          event.preventDefault();
          event.stopImmediatePropagation();
          customAmount.focus();
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
