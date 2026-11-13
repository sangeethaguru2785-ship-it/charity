(() => {
  const page = document.body.dataset.authPage || "login";
  const form = document.querySelector("[data-auth-form]");
  const roleInputs = [...document.querySelectorAll('input[name="role"]')];
  const roleNoteText = document.getElementById("roleNoteText");
  const submitButton = document.getElementById("authSubmit");

  const deriveNameFromEmail = (email) => {
    const localPart = String(email || "").split("@")[0].split("+")[0];
    const words = localPart
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);

    if (!words.length) return "Member";

    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const roleNotes = {
    admin: {
      login: "Use your Stackly admin credentials to manage campaigns, donations and volunteers.",
      signup: "Admin accounts are reviewed by a Stackly coordinator before workspace access is granted."
    },
    donor: {
      login: "Sign in to track your giving, download receipts and follow the campaigns you support.",
      signup: "Create a donor account to manage donations, save payment details and download receipts."
    }
  };

  const getSelectedRole = () => {
    const selected = roleInputs.find((input) => input.checked);
    return selected ? selected.value : "donor";
  };

  const syncRoleNote = () => {
    if (!roleNoteText) return;
    const role = getSelectedRole();
    roleNoteText.textContent = roleNotes[role]?.[page] || roleNotes.donor[page];
  };

  roleInputs.forEach((input) => {
    input.addEventListener("change", syncRoleNote);
  });

  syncRoleNote();

  document.querySelectorAll("[data-password-toggle]").forEach((button) => {
    const target = document.getElementById(button.dataset.passwordToggle);
    if (!target) return;

    button.addEventListener("click", () => {
      const shouldShow = target.type === "password";
      target.type = shouldShow ? "text" : "password";
      button.setAttribute("aria-label", shouldShow ? "Hide password" : "Show password");
      button.setAttribute("aria-pressed", String(shouldShow));

      const icon = button.querySelector("i");
      if (icon) {
        icon.className = shouldShow ? "bi bi-eye-slash" : "bi bi-eye";
      }
    });
  });

  const password = document.getElementById("signupPassword") || document.getElementById("loginPassword");
  const confirmPassword = document.getElementById("signupConfirmPassword");
  const strength = document.getElementById("passwordStrength");
  const strengthHint = document.getElementById("passwordHint");

  const getPasswordScore = (value) => {
    if (!value) return 0;

    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9\s]/.test(value)) score += 1;

    return Math.min(score, 4);
  };

  const strengthMessages = [
    "Use 8+ characters with a mix of letters, numbers and symbols.",
    "Weak password — add more characters.",
    "Fair password — add a number or symbol.",
    "Good password — nearly there.",
    "Strong password — your account is well protected."
  ];

  const updateStrength = () => {
    if (!password || !strength) return;

    const score = getPasswordScore(password.value);
    strength.dataset.score = String(score);

    if (strengthHint) {
      strengthHint.textContent = strengthMessages[score];
    }
  };

  const PASSWORD_MESSAGE =
    "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";

  const passwordTests = {
    length: (value) => value.length >= 8,
    uppercase: (value) => /[A-Z]/.test(value),
    lowercase: (value) => /[a-z]/.test(value),
    number: (value) => /\d/.test(value),
    special: (value) => /[^A-Za-z0-9\s]/.test(value)
  };

  const passwordRulesList = password
    ? document.querySelector(`[data-password-rules="${password.id}"]`)
    : null;
  const passwordField = password?.closest(".auth-field");
  const passwordFeedback = passwordField?.querySelector(".invalid-feedback");

  const updatePasswordRules = (value) => {
    if (!passwordRulesList) return;

    passwordRulesList.querySelectorAll("[data-rule]").forEach((item) => {
      const test = passwordTests[item.dataset.rule];
      const isMet = Boolean(test && test(value));
      item.classList.toggle("is-met", isMet);
      item.classList.toggle("is-unmet", !isMet && value.length > 0);

      const icon = item.querySelector("i");
      if (icon) icon.className = isMet ? "bi bi-check-circle-fill" : "bi bi-circle";
    });
  };

  const validatePassword = (showError = true) => {
    if (!password) return true;

    const value = password.value;
    const isValid = Object.values(passwordTests).every((test) => test(value));
    const message = value ? PASSWORD_MESSAGE : "Please enter your password.";

    password.setCustomValidity(isValid ? "" : message);
    updatePasswordRules(value);

    if (passwordRulesList) {
      passwordRulesList.classList.toggle("has-error", !isValid && showError);
    }

    if (passwordFeedback) {
      passwordFeedback.textContent = message;
    }

    return isValid;
  };

  const validateConfirmPassword = () => {
    if (!confirmPassword) return true;

    if (password && confirmPassword.value && confirmPassword.value !== password.value) {
      confirmPassword.setCustomValidity("Passwords do not match.");
      return false;
    }

    confirmPassword.setCustomValidity("");
    return true;
  };

  if (password) {
    updatePasswordRules(password.value);

    password.addEventListener("input", () => {
      updateStrength();
      validatePassword(form?.classList.contains("was-validated") ?? false);
      if (confirmPassword?.value) {
        validateConfirmPassword();
      }
    });
  }

  if (confirmPassword) {
    confirmPassword.addEventListener("input", validateConfirmPassword);
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const passwordValid = validatePassword(true);
      validateConfirmPassword();

      if (!passwordValid || !form.checkValidity()) {
        form.classList.add("was-validated");
        const firstInvalid = form.querySelector(":invalid");
        firstInvalid?.focus();
        return;
      }

      const role = getSelectedRole();
      const isSignup = page === "signup";
      const email = form.querySelector('input[type="email"]')?.value.trim() || "";
      const name = deriveNameFromEmail(email);

      try {
        localStorage.setItem("stacklyUser", JSON.stringify({ name, email, role }));
      } catch (error) {
        // Storage can be unavailable in private browsing; the dashboard falls back to its defaults.
      }

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span>${isSignup ? "Creating account…" : "Signing in…"}</span>`;
      }

      window.setTimeout(() => {
        window.location.href = role === "admin" ? "admin-dashboard.html" : "donor-dashboard.html";
      }, 700);
    });
  }
})();
