/* =========================================================
   Stackly — Dashboard interactions
   Sidebar, Chart.js visualisations, small UI helpers
   ========================================================= */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Logged-in user
  --------------------------------------------------------- */
  const STORAGE_KEY = "stacklyUser";

  const deriveNameFromEmail = (email) => {
    const localPart = String(email || "").split("@")[0].split("+")[0];
    const words = localPart
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean);

    if (!words.length) return "";

    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getNameInitials = (name) => {
    const words = name.split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  function initLoggedInUser() {
    let storedUser = null;

    try {
      storedUser = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (error) {
      return;
    }

    if (!storedUser) return;

    const name = (storedUser.name || deriveNameFromEmail(storedUser.email)).trim();
    if (!name) return;

    const firstName = name.split(/\s+/)[0];
    const initials = getNameInitials(name);

    $$(".dash-user strong, .dash-profile-meta strong").forEach((element) => {
      element.textContent = name;
    });

    if (initials) {
      $$(".dash-user .avatar, .dash-profile .avatar").forEach((element) => {
        element.textContent = initials;
      });
    }

    $$("#adminWelcomeTitle, #donorWelcomeTitle").forEach((title) => {
      const emphasis = title.querySelector("em");
      if (emphasis) emphasis.textContent = firstName;
    });
  }

  initLoggedInUser();

  /* ---------------------------------------------------------
     Responsive sidebar
  --------------------------------------------------------- */
  const sidebar = $("#dashSidebar");
  const overlay = $("#dashOverlay");
  const menuBtn = $("#dashMenuBtn");
  const closeBtn = $("#sidebarClose");
  const mobileQuery = window.matchMedia("(max-width: 991.98px)");

  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add("is-open");
    overlay?.classList.add("is-visible");
    document.body.classList.add("no-scroll");
    menuBtn?.setAttribute("aria-expanded", "true");
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove("is-open");
    overlay?.classList.remove("is-visible");
    document.body.classList.remove("no-scroll");
    menuBtn?.setAttribute("aria-expanded", "false");
  }

  menuBtn?.addEventListener("click", () => {
    if (sidebar?.classList.contains("is-open")) closeSidebar();
    else openSidebar();
  });
  closeBtn?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);

  $$(".dash-nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      $$(".dash-nav-link").forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
      if (mobileQuery.matches) closeSidebar();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebar();
  });

  mobileQuery.addEventListener("change", (event) => {
    if (!event.matches) closeSidebar();
  });

  /* ---------------------------------------------------------
     Lightweight toast
  --------------------------------------------------------- */
  const toast = $("#dashToast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    const messageEl = $("span", toast);
    if (messageEl) messageEl.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  $$("[data-dash-toast]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(button.dataset.dashToast || "Done");
    });
  });

  /* ---------------------------------------------------------
     Charts
  --------------------------------------------------------- */
  if (typeof window.Chart === "undefined") return;

  Chart.defaults.font.family = "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif";
  Chart.defaults.color = "#5f6f68";
  Chart.defaults.animation.duration = REDUCED ? 0 : 850;
  Chart.defaults.animation.easing = "easeOutQuart";
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Chart.defaults.plugins.legend.labels.boxHeight = 8;
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.tooltip.backgroundColor = "#0e3b2e";
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
  Chart.defaults.plugins.tooltip.titleFont = { weight: "700", size: 12 };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
  Chart.defaults.plugins.tooltip.displayColors = false;

  const money = (value) => "$" + Number(value).toLocaleString("en-US");
  const charts = {};

  const centerText = {
    id: "centerText",
    afterDraw(chart, _args, options) {
      if (!options || !options.text) return;
      const area = chart.chartArea;
      if (!area) return;
      const ctx = chart.ctx;
      const x = (area.left + area.right) / 2;
      const y = (area.top + area.bottom) / 2;

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = options.color || "#17251f";
      ctx.font = "600 26px Fraunces, Georgia, serif";
      ctx.fillText(options.text, x, y - (options.sub ? 9 : 0));
      if (options.sub) {
        ctx.fillStyle = "#5f6f68";
        ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(options.sub, x, y + 15);
      }
      ctx.restore();
    },
  };
  Chart.register(centerText);

  function areaGradient(chart, from, to) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return from;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, from);
    gradient.addColorStop(1, to);
    return gradient;
  }

  function gridConfig() {
    return {
      color: "rgba(14, 59, 46, 0.07)",
      drawTicks: false,
    };
  }

  function createChart(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    const chart = new Chart(canvas, config);
    charts[id] = chart;
    return chart;
  }

  function bindRangeTabs(chartId, ranges) {
    const chart = charts[chartId];
    if (!chart) return;
    const group = document.querySelector(`[data-range-target="${chartId}"]`);
    if (!group) return;
    const buttons = $$(".dash-tab", group);

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const range = ranges[button.dataset.range];
        if (!range) return;
        buttons.forEach((item) => item.classList.toggle("active", item === button));
        chart.data.labels = range.labels;
        chart.data.datasets[0].data = range.data;
        chart.update();
      });
    });
  }

  /* ---------------------------------------------------------
     Admin dashboard charts
  --------------------------------------------------------- */
  function initAdminCharts() {
    const donationRanges = {
      7: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        data: [4200, 6800, 5100, 9200, 7400, 11200, 8600],
      },
      30: {
        labels: ["Oct 18", "Oct 23", "Oct 28", "Nov 2", "Nov 7", "Nov 12"],
        data: [12400, 16800, 14200, 21400, 19600, 24800],
      },
      12: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        data: [32000, 36500, 34800, 41200, 38900, 45600, 43800, 50100, 47600, 52900, 58400, 62100],
      },
    };

    createChart("adminDonationChart", {
      type: "line",
      data: {
        labels: donationRanges[30].labels,
        datasets: [
          {
            label: "Donations",
            data: donationRanges[30].data,
            borderColor: "#17836a",
            borderWidth: 3,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#17836a",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
            backgroundColor: (context) =>
              areaGradient(context.chart, "rgba(23, 131, 106, 0.28)", "rgba(23, 131, 106, 0.01)"),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => " " + money(context.parsed.y),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: gridConfig(),
            border: { display: false },
            ticks: {
              font: { size: 11 },
              callback: (value) => (value >= 1000 ? "$" + value / 1000 + "k" : "$" + value),
            },
          },
        },
      },
    });
    bindRangeTabs("adminDonationChart", donationRanges);

    createChart("adminCampaignChart", {
      type: "bar",
      data: {
        labels: ["Clean water", "Education", "Mobile health", "Zero hunger", "Animal rescue"],
        datasets: [
          {
            label: "Raised",
            data: [18420, 14200, 9800, 12300, 6400],
            backgroundColor: "#17836a",
            borderRadius: 6,
            borderSkipped: false,
          },
          {
            label: "Goal",
            data: [25500, 20000, 15000, 18000, 10000],
            backgroundColor: "#e5ece8",
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
            align: "end",
            labels: { font: { size: 10 } },
          },
          tooltip: {
            callbacks: {
              label: (context) => " " + context.dataset.label + ": " + money(context.parsed.x),
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: gridConfig(),
            border: { display: false },
            ticks: {
              font: { size: 10 },
              callback: (value) => (value >= 1000 ? "$" + value / 1000 + "k" : "$" + value),
            },
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 10 } },
          },
        },
      },
    });

    createChart("adminDonorChart", {
      type: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          {
            label: "New donors",
            data: [180, 220, 260, 310, 340, 390, 420, 460, 510, 540, 590, 640],
            borderColor: "#f0a833",
            borderWidth: 3,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#f0a833",
            pointBorderWidth: 2,
            pointRadius: 3.5,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
            backgroundColor: (context) =>
              areaGradient(context.chart, "rgba(240, 168, 51, 0.25)", "rgba(240, 168, 51, 0.01)"),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => " " + context.parsed.y.toLocaleString("en-US") + " new donors",
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: gridConfig(),
            border: { display: false },
            ticks: { font: { size: 11 } },
          },
        },
      },
    });
  }

  /* ---------------------------------------------------------
     Donor dashboard charts
  --------------------------------------------------------- */
  function initDonorCharts() {
    const historyRanges = {
      6: {
        labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
        data: [50, 75, 60, 120, 90, 140],
      },
      12: {
        labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
        data: [40, 60, 50, 80, 70, 110, 90, 130, 100, 150, 120, 170],
      },
      all: {
        labels: ["2023", "2024", "2025", "2026"],
        data: [280, 460, 760, 1240],
      },
    };

    createChart("donorHistoryChart", {
      type: "line",
      data: {
        labels: historyRanges[12].labels,
        datasets: [
          {
            label: "Your donations",
            data: historyRanges[12].data,
            borderColor: "#17836a",
            borderWidth: 3,
            pointBackgroundColor: "#fff",
            pointBorderColor: "#17836a",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
            backgroundColor: (context) =>
              areaGradient(context.chart, "rgba(23, 131, 106, 0.28)", "rgba(23, 131, 106, 0.01)"),
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => " " + money(context.parsed.y),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: gridConfig(),
            border: { display: false },
            ticks: {
              font: { size: 11 },
              callback: (value) => "$" + value,
            },
          },
        },
      },
    });
    bindRangeTabs("donorHistoryChart", historyRanges);

    createChart("donorDistributionChart", {
      type: "doughnut",
      data: {
        labels: ["Clean water", "Education", "Healthcare", "Food support"],
        datasets: [
          {
            data: [420, 340, 280, 200],
            backgroundColor: ["#17836a", "#f0a833", "#2d7dd2", "#d65a7a"],
            hoverBackgroundColor: ["#126b57", "#d98f16", "#2467ad", "#b84360"],
            borderWidth: 0,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 14,
              font: { size: 10 },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => " " + context.label + ": " + money(context.parsed),
            },
          },
          centerText: {
            text: "$1,240",
            sub: "Total given",
            color: "#17251f",
          },
        },
      },
    });
  }

  const dashboard = document.body.dataset.dashboard;
  if (dashboard === "admin") initAdminCharts();
  if (dashboard === "donor") initDonorCharts();
})();
