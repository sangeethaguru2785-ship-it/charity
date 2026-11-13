/* =========================================================
   Stackly — Charity & Non-Profit Theme
   GSAP animations & interactions (multipage)
   ========================================================= */
(() => {
  "use strict";

  /* Bail out gracefully if GSAP failed to load */
  if (typeof window.gsap === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------------------------------------------------------
     Toast
  --------------------------------------------------------- */
  let toastTimer;
  function showToast(message, icon = "bi-check-circle-fill") {
    const toast = $("#siteToast");
    if (!toast) return;
    $("#toastMsg").textContent = message;
    $("#toastIcon").className = "bi " + icon;
    gsap.killTweensOf(toast);
    gsap.set(toast, { visibility: "visible" });
    gsap.fromTo(
      toast,
      { y: 130, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }
    );
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      gsap.to(toast, {
        y: 130,
        autoAlpha: 0,
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => gsap.set(toast, { visibility: "hidden" }),
      });
    }, 3800);
  }

  /* ---------------------------------------------------------
     Image fallback (resilience if an image ever fails to load)
  --------------------------------------------------------- */
  function initImageFallback() {
    $$("img").forEach((img) => {
      img.addEventListener("error", function onError() {
        img.removeEventListener("error", onError);
        img.src = "images/photo-1543269865-cbf427effbad-1920x1080.webp";
      });
    });
  }

  /* ---------------------------------------------------------
     Home hero entrance choreography (index only)
  --------------------------------------------------------- */
  function heroIntro() {
    if (!document.querySelector(".hero")) return;
    if (REDUCED) return;

    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".hero .eyebrow", { y: 26, autoAlpha: 0, duration: 0.7 })
      .from(".hero-title .word", { yPercent: 118, duration: 1.05, stagger: 0.09 }, "-=0.35")
      .from(".hero-sub", { y: 34, autoAlpha: 0, duration: 0.8 }, "-=0.6")
      .from(".hero-actions > *", { y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.12 }, "-=0.5")
      .from(".hero-stats .h-stat", { y: 26, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, "-=0.45")
      .from(".collage-main", { clipPath: "inset(100% 0% 0% 0%)", duration: 1.1 }, 0.25)
      .from(".collage-main img", { scale: 1.35, duration: 1.15, ease: "power3.out" }, 0.25)
      .from(".float-card", { scale: 0.5, autoAlpha: 0, duration: 0.8, ease: "back.out(1.8)", stagger: 0.15 }, 1)
      .from(".rotating-badge", { scale: 0, autoAlpha: 0, duration: 0.8, ease: "back.out(1.9)" }, 1.15);

    /* Count-up hero stats on load — synced with their reveal, no scroll needed */
    $$(".hero-stats [data-count]").forEach((el, i) => {
      const target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const prefix = el.dataset.prefix || "";
      const obj = { v: 0 };
      tl.to(
        obj,
        {
          v: target,
          duration: 2.2,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = prefix + formatNumber(obj.v, decimals);
          },
          onComplete: () => {
            el.textContent = prefix + formatNumber(target, decimals);
          },
        },
        1.9 + i * 0.15
      );
    });

    /* Gentle infinite float on the glass cards */
    gsap.to(".float-card", {
      y: -12,
      duration: 2.6,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.4,
      delay: 2.6,
    });

    /* Spinning circular badge */
    gsap.to(".rotating-badge svg", {
      rotation: 360,
      duration: 16,
      ease: "none",
      repeat: -1,
    });

    /* Scroll parallax inside the hero */
    gsap.to(".collage", {
      yPercent: -9,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero-copy", {
      yPercent: 14,
      autoAlpha: 0.35,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".blob-emerald", {
      yPercent: 26,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".blob-gold", {
      yPercent: -22,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* ---------------------------------------------------------
     Inner-page hero entrance (generic, attribute driven)
     [data-hero]      → staggered fade-up
     [data-hero-clip] → clip-path image reveal
     [data-hero-pop]  → pop-in floating cards
  --------------------------------------------------------- */
  function pageHeroIntro() {
    const hero = document.querySelector(".page-hero");
    if (!hero || REDUCED) return;

    const els = $$("[data-hero]", hero);
    if (els.length) {
      gsap.from(els, {
        y: 42,
        autoAlpha: 0,
        duration: 0.85,
        ease: "power3.out",
        stagger: 0.11,
        delay: 0.1,
      });
    }

    $$("[data-hero-clip]", hero).forEach((el) => {
      gsap.from(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.05, ease: "power3.out", delay: 0.2 });
      const img = el.querySelector("img");
      if (img) gsap.from(img, { scale: 1.28, duration: 1.25, ease: "power3.out", delay: 0.2 });
    });

    $$("[data-hero-pop]", hero).forEach((el, i) => {
      gsap.from(el, {
        scale: 0.5,
        autoAlpha: 0,
        duration: 0.75,
        ease: "back.out(1.8)",
        delay: 0.75 + i * 0.14,
      });
    });

    /* Gentle float for glass cards inside page heroes */
    const floats = $$(".page-hero .float-card", hero);
    if (floats.length) {
      gsap.to(floats, {
        y: -10,
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: 0.4,
        delay: 2.2,
      });
    }
  }

  /* ---------------------------------------------------------
     Navbar — scroll state, mobile collapse close
  --------------------------------------------------------- */
  function initNavbar() {
    const nav = $("#siteNav");
    if (!nav) return;

    window.addEventListener(
      "scroll",
      () => {
        nav.classList.toggle("nav-scrolled", window.scrollY > 40);
      },
      { passive: true }
    );

    $$("#siteNav a").forEach((link) =>
      link.addEventListener("click", () => {
        const collapseEl = nav.querySelector(".navbar-collapse");
        if (collapseEl && collapseEl.classList.contains("show")) {
          bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
        }
      })
    );
  }

  /* ---------------------------------------------------------
     Top scroll progress bar
  --------------------------------------------------------- */
  function initScrollProgress() {
    const bar = $("#scrollProgress");
    if (!bar || REDUCED) return;
    gsap.to(bar, {
      scaleX: 1,
      ease: "none",
      transformOrigin: "left center",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });
  }

  /* ---------------------------------------------------------
     Infinite marquee — speeds up with scroll velocity
  --------------------------------------------------------- */
  function initMarquee() {
    const track = $("#marqueeTrack");
    if (!track || REDUCED) return;
    const tween = gsap.to(track, { xPercent: -50, duration: 26, ease: "none", repeat: -1 });
    ScrollTrigger.create({
      onUpdate: (self) => {
        const boost = Math.min(Math.abs(self.getVelocity()) / 900, 3.5);
        gsap.to(tween, { timeScale: 1 + boost, duration: 0.4, overwrite: true });
      },
    });
  }

  /* ---------------------------------------------------------
     Generic scroll reveals + batched card staggers
  --------------------------------------------------------- */
  function initReveals() {
    if (REDUCED) return;

    $$("[data-reveal]").forEach((el) => {
      const type = el.dataset.reveal || "up";
      const delay = parseFloat(el.dataset.delay || 0);
      const from = { autoAlpha: 0, duration: 0.95, ease: "power3.out", delay };
      if (type === "up") from.y = 56;
      if (type === "down") from.y = -56;
      if (type === "left") from.x = -64;
      if (type === "right") from.x = 64;
      if (type === "zoom") from.scale = 0.9;
      if (type === "clip") from.clipPath = "inset(0 0 100% 0)";
      gsap.from(el, {
        ...from,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    });

    ScrollTrigger.batch("[data-stagger]", {
      start: "top 90%",
      once: true,
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 64,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
        }),
    });
  }

  /* ---------------------------------------------------------
     Animated counters
  --------------------------------------------------------- */
  function formatNumber(v, decimals) {
    return decimals
      ? v.toFixed(decimals)
      : Math.round(v).toLocaleString("en-US");
  }

  function initCounters() {
    $$("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const prefix = el.dataset.prefix || "";
      if (REDUCED) {
        el.textContent = prefix + formatNumber(target, decimals);
        return;
      }
      /* Hero stats are above the fold — animated by heroIntro() on load instead */
      if (el.closest(".hero")) return;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 2.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
        onUpdate: () => {
          el.textContent = prefix + formatNumber(obj.v, decimals);
        },
        onComplete: () => {
          el.textContent = prefix + formatNumber(target, decimals);
        },
      });
    });
  }

  /* ---------------------------------------------------------
     Progress bars
  --------------------------------------------------------- */
  function initProgressBars() {
    $$(".progress-fill").forEach((bar) => {
      const target = parseFloat(bar.dataset.progress || "0");
      if (REDUCED) {
        bar.style.width = target + "%";
        return;
      }
      gsap.fromTo(
        bar,
        { width: "0%" },
        {
          width: target + "%",
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: { trigger: bar, start: "top 92%", once: true },
        }
      );
    });
  }

  /* ---------------------------------------------------------
     Parallax decorations
  --------------------------------------------------------- */
  function initParallax() {
    if (REDUCED) return;
    $$("[data-speed]").forEach((el) => {
      const speed = parseFloat(el.dataset.speed || "0.1");
      gsap.to(el, {
        yPercent: speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("section") || el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    });
  }

  /* ---------------------------------------------------------
     Testimonial slider
  --------------------------------------------------------- */
  function initTestimonials() {
    const stage = $("#testimonialStage");
    if (!stage) return;
    const slides = $$(".testimonial-slide", stage);
    const dotsWrap = $("#testimonialDots");
    if (slides.length < 2 || !dotsWrap) return;

    let index = 0;
    let busy = false;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "t-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
      dot.addEventListener("click", () => go(i));
      dotsWrap.appendChild(dot);
    });
    const dots = $$(".t-dot", dotsWrap);

    function go(next) {
      if (busy || next === index) return;
      busy = true;
      setTimeout(() => (busy = false), 650);

      const dir = next > index ? 1 : -1;
      const current = slides[index];
      const upcoming = slides[next];
      index = next;

      dots.forEach((d, i) => d.classList.toggle("active", i === index));

      if (REDUCED) {
        current.classList.remove("is-active");
        upcoming.classList.add("is-active");
        return;
      }

      gsap.to(current, {
        autoAlpha: 0,
        x: -56 * dir,
        duration: 0.38,
        ease: "power2.in",
        onComplete: () => {
          current.classList.remove("is-active");
          gsap.set(current, { clearProps: "all" });
          upcoming.classList.add("is-active");
          gsap.from(upcoming, {
            autoAlpha: 0,
            x: 56 * dir,
            duration: 0.55,
            ease: "power3.out",
          });
        },
      });
    }

    function autoPlay() {
      if (REDUCED) return;
      clearInterval(timer);
      timer = setInterval(() => go((index + 1) % slides.length), 6500);
    }

    $("#testiPrev").addEventListener("click", () => go((index - 1 + slides.length) % slides.length));
    $("#testiNext").addEventListener("click", () => go((index + 1) % slides.length));

    stage.addEventListener("mouseenter", () => clearInterval(timer));
    stage.addEventListener("mouseleave", autoPlay);

    autoPlay();
  }

  /* ---------------------------------------------------------
     Gallery + lightbox (filter aware)
  --------------------------------------------------------- */
  function initGallery() {
    const grid = $("#galleryGrid");
    const lightbox = $("#lightbox");
    if (!grid || !lightbox) return;

    let items = $$(".gallery-item", grid)
      .filter((fig) => !fig.classList.contains("d-none"))
      .map((fig) => ({
        src: fig.dataset.full || fig.querySelector("img").src,
        caption: fig.dataset.caption || "",
      }));

    window.addEventListener("stackly:filter", () => {
      items = $$(".gallery-item", grid)
        .filter((fig) => !fig.classList.contains("d-none"))
        .map((fig) => ({
          src: fig.dataset.full || fig.querySelector("img").src,
          caption: fig.dataset.caption || "",
        }));
      if (current >= items.length) current = 0;
    });

    const img = $("#lightboxImg");
    const caption = $("#lightboxCaption");
    let current = 0;

    function render() {
      img.src = items[current].src;
      img.alt = items[current].caption;
      caption.textContent = items[current].caption;
    }

    function open(i) {
      current = i;
      render();
      document.body.style.overflow = "hidden";
      if (!REDUCED) {
        gsap.fromTo(lightbox, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35 });
        gsap.fromTo(img, { scale: 0.94, y: 16 }, { scale: 1, y: 0, duration: 0.5, ease: "power3.out" });
      } else {
        gsap.set(lightbox, { autoAlpha: 1 });
      }
    }

    function close() {
      const done = () => {
        gsap.set(lightbox, { autoAlpha: 0 });
        document.body.style.overflow = "";
      };
      if (!REDUCED) gsap.to(lightbox, { autoAlpha: 0, duration: 0.3, onComplete: done });
      else done();
    }

    function step(d) {
      current = (current + d + items.length) % items.length;
      render();
      if (!REDUCED) {
        gsap.fromTo(img, { autoAlpha: 0, x: 44 * d }, { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out" });
      }
    }

    $$(".gallery-item", grid).forEach((fig, i) => {
      fig.addEventListener("click", () => {
        const visible = $$(".gallery-item", grid).indexOf(fig);
        open(visible < 0 ? 0 : visible);
      });
      fig.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const visible = $$(".gallery-item", grid).indexOf(fig);
          open(visible < 0 ? 0 : visible);
        }
      });
    });

    $("#lightboxClose").addEventListener("click", close);
    $("#lightboxPrev").addEventListener("click", () => step(-1));
    $("#lightboxNext").addEventListener("click", () => step(1));
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", (e) => {
      if (getComputedStyle(lightbox).visibility === "hidden") return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  /* ---------------------------------------------------------
     Donation widget
  --------------------------------------------------------- */
  function initDonation() {
    const widget = $("#donationWidget");
    if (!widget) return;

    const impact = {
      10: "provides 20 warm meals for children in need",
      25: "gives a family clean drinking water for a month",
      50: "sends a child to school with supplies for a full term",
      100: "funds a mobile health check-up for 15 mothers",
    };

    let amount = 25;
    let freq = "once";

    const chips = $$(".amount-grid button", widget);
    const custom = $("#customAmount");
    const impactLine = $("#impactLine");
    const donateBtn = $("#donateBtn");
    const freqToggle = $("#freqToggle");

    function render() {
      donateBtn.innerHTML =
        "Donate $" + amount + (freq === "monthly" ? " monthly " : " now ") +
        '<i class="bi bi-arrow-right"></i>';
      const txt =
        impact[amount] || "powers critical relief wherever it is needed most";
      impactLine.innerHTML =
        '<i class="bi bi-heart-fill"></i> <strong>$' + amount + "</strong> " +
        txt + (freq === "monthly" ? " — every single month" : "");
    }

    chips.forEach((chip) =>
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        amount = parseInt(chip.dataset.amount, 10);
        if (custom) custom.value = "";
        render();
        if (!REDUCED) {
          gsap.fromTo(impactLine, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out" });
        }
      })
    );

    if (custom) {
      custom.addEventListener("input", () => {
        const v = parseFloat(custom.value);
        if (v > 0) {
          amount = Math.round(v * 100) / 100;
          chips.forEach((c) => c.classList.remove("active"));
          render();
        }
      });
    }

    $$("button", freqToggle).forEach((btn) =>
      btn.addEventListener("click", () => {
        $$("button", freqToggle).forEach((b) => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        freq = btn.dataset.freq;
        freqToggle.classList.toggle("monthly", freq === "monthly");
        render();
      })
    );

    donateBtn.addEventListener("click", () => {
      showToast(
        "Thank you! Preparing your $" + amount + " " +
          (freq === "monthly" ? "monthly " : "") + "donation…",
        "bi-heart-fill"
      );
      if (!REDUCED) {
        gsap.fromTo(donateBtn, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" });
      }
    });

    /* Tier shortcut buttons (donate page) — set amount + focus widget */
    $$("[data-tier]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const v = parseInt(btn.dataset.tier, 10);
        if (!v) return;
        amount = v;
        chips.forEach((c) => c.classList.toggle("active", parseInt(c.dataset.amount, 10) === v));
        if (custom) custom.value = "";
        render();
        widget.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "center" });
        if (!REDUCED) {
          gsap.fromTo(impactLine, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out" });
        }
      });
    });

    render();
  }

  /* ---------------------------------------------------------
     Newsletter (demo submit)
  --------------------------------------------------------- */
  function initNewsletter() {
    const form = $("#newsletterForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("Welcome aboard — kindness is incoming to your inbox!", "bi-heart-fill");
      form.reset();
    });
  }

  /* ---------------------------------------------------------
     Contact / volunteer forms (demo submit + validation)
  --------------------------------------------------------- */
  function initForms() {
    ["#contactForm", "#volunteerForm"].forEach((sel) => {
      const form = $(sel);
      if (!form) return;
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          return;
        }
        form.classList.remove("was-validated");
        window.location.href = "404.html";
      });
    });
  }

  /* ---------------------------------------------------------
     Filterable grids (gallery / causes)
  --------------------------------------------------------- */
  function initFilters() {
    $$("[data-filter-bar]").forEach((bar) => {
      const scope = document.querySelector(bar.dataset.filterBar);
      if (!scope) return;
      const items = $$(".filterable", scope);
      const buttons = $$("button[data-filter]", bar);

      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const f = btn.dataset.filter;
          buttons.forEach((b) => {
            const on = b === btn;
            b.classList.toggle("active", on);
            b.setAttribute("aria-pressed", on ? "true" : "false");
          });
          items.forEach((item) => {
            const show = f === "all" || item.dataset.category === f;
            if (show) {
              item.classList.remove("d-none");
              if (!REDUCED) {
                gsap.fromTo(
                  item,
                  { autoAlpha: 0, scale: 0.94, y: 16 },
                  { autoAlpha: 1, scale: 1, y: 0, duration: 0.5, ease: "power2.out" }
                );
              }
            } else {
              item.classList.add("d-none");
            }
          });
          window.dispatchEvent(new CustomEvent("stackly:filter"));
          ScrollTrigger.refresh();
        });
      });
    });
  }

  /* ---------------------------------------------------------
     Countdown (events hero)
  --------------------------------------------------------- */
  function initCountdown() {
    const el = $("[data-countdown]");
    if (!el) return;
    const target = new Date(el.dataset.countdown).getTime();
    if (isNaN(target)) return;

    const d = $("[data-cd-d]", el);
    const h = $("[data-cd-h]", el);
    const m = $("[data-cd-m]", el);
    const s = $("[data-cd-s]", el);
    const pad = (n) => String(n).padStart(2, "0");

    function tick() {
      const diff = Math.max(0, target - Date.now());
      if (d) d.textContent = pad(Math.floor(diff / 864e5));
      if (h) h.textContent = pad(Math.floor(diff / 36e5) % 24);
      if (m) m.textContent = pad(Math.floor(diff / 6e4) % 60);
      if (s) s.textContent = pad(Math.floor(diff / 1e3) % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---------------------------------------------------------
     Magnetic buttons
  --------------------------------------------------------- */
  function initMagnetic() {
    if (REDUCED) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    $$(".btn-magnetic").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.22, y: y * 0.3, duration: 0.4, ease: "power3.out" });
      });
      btn.addEventListener("mouseleave", () =>
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" })
      );
    });
  }

  /* ---------------------------------------------------------
     Back to top + scroll ring
  --------------------------------------------------------- */
  function initBackToTop() {
    const btn = $("#backToTop");
    if (!btn) return;
    const fill = btn.querySelector(".ring-fill");
    const C = 2 * Math.PI * 19;

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (fill) fill.style.strokeDashoffset = C * (1 - p);
      btn.classList.toggle("visible", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" })
    );
  }

  /* ---------------------------------------------------------
     Boot
  --------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    initImageFallback();
    initNavbar();
    initScrollProgress();
    initMarquee();
    initBackToTop();
    initGallery();
    initDonation();
    initNewsletter();
    initForms();
    initFilters();
    initCountdown();

    heroIntro();
    pageHeroIntro();
    initReveals();
    initCounters();
    initProgressBars();
    initParallax();
    initTestimonials();
    initMagnetic();
    ScrollTrigger.refresh();
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
