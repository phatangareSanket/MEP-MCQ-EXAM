// App shell + hash router. No framework — plain DOM + template strings.
"use strict";

// Populated by the view scripts (js/views/*.js), each doing `Views.name = {...}`.
// Must be declared here, before any view script runs.
const Views = {};

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { path: "/exam/start", label: "Start Exam", icon: "play-circle" },
  { path: "/practice", label: "Practice", icon: "book-open-check" },
  { path: "/bank", label: "Question Bank", icon: "library" },
  { path: "/bookmarks", label: "Bookmarks", icon: "bookmark" },
  { path: "/performance", label: "Performance", icon: "line-chart" },
  { path: "/history", label: "Exam History", icon: "history" },
  { path: "/admin", label: "Admin", icon: "shield-check" },
];

// Minimal inline-SVG icon set (kept tiny; only the glyphs actually used).
const ICONS = {
  "layout-dashboard": '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  "play-circle": '<circle cx="12" cy="12" r="9"/><polygon points="10,8 16,12 10,16"/>',
  "book-open-check": '<path d="M2 5c3-1 6-1 9 1v13c-3-2-6-2-9-1z"/><path d="M22 5c-3-1-6-1-9 1v13c3-2 6-2 9-1z"/><path d="M15 12l2 2 4-4"/>',
  library: '<path d="M4 3h4v18H4z"/><path d="M12 3h4v18h-4z"/><path d="M20 7l2 14-4 .6L16 8z"/>',
  bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  "line-chart": '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l4 2"/>',
  "shield-check": '<path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
};

function icon(name, cls = "icon") {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

const Router = (() => {
  const routes = [];
  let currentView = null;

  function register(path, view) {
    routes.push({ path, view });
  }

  function matchRoute(path) {
    for (const r of routes) {
      const parts = r.path.split("/").filter(Boolean);
      const pathParts = path.split("/").filter(Boolean);
      if (parts.length !== pathParts.length) continue;
      const params = {};
      let ok = true;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].startsWith(":")) params[parts[i].slice(1)] = decodeURIComponent(pathParts[i]);
        else if (parts[i] !== pathParts[i]) {
          ok = false;
          break;
        }
      }
      if (ok) return { view: r.view, params };
    }
    return null;
  }

  function parseHash() {
    const hash = location.hash.slice(1) || "/dashboard";
    const [path, queryString] = hash.split("?");
    return { path: path || "/dashboard", query: Utils.parseQuery(queryString) };
  }

  async function render() {
    const { path, query } = parseHash();
    const match = matchRoute(path);

    highlightNav(path);

    const root = document.getElementById("view-root");
    if (currentView && typeof currentView.destroy === "function") {
      try { currentView.destroy(); } catch (e) { console.error(e); }
    }
    currentView = null;

    if (!match) {
      root.innerHTML = `<div class="empty-state"><h2>Page not found</h2></div>`;
      return;
    }
    root.innerHTML = `<div class="empty-state text-muted">Loading…</div>`;
    try {
      currentView = match.view;
      await match.view.render(root, match.params, query);
    } catch (err) {
      console.error(err);
      root.innerHTML = `<div class="card"><div class="card-body"><p class="text-destructive font-medium">Something went wrong rendering this page.</p><p class="text-sm text-muted mt-2">${Utils.escapeHtml(err.message || String(err))}</p></div></div>`;
    }
  }

  function navigate(path) {
    location.hash = "#" + path;
  }

  function highlightNav(path) {
    document.querySelectorAll(".nav-link").forEach((el) => {
      const p = el.getAttribute("data-path");
      const active = p === "/dashboard" ? path === "/dashboard" : path === p || path.startsWith(p + "/");
      el.classList.toggle("active", active);
    });
  }

  function init() {
    window.addEventListener("hashchange", render);
    render();
  }

  return { register, navigate, init };
})();

function buildShell() {
  const sidebarNav = NAV_ITEMS.map(
    (item) => `<a class="nav-link" href="#${item.path}" data-path="${item.path}">${icon(item.icon)}<span>${item.label}</span></a>`
  ).join("");

  document.body.innerHTML = `
    <div class="app-shell">
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">${icon("play-circle", "icon")}</div>
          <strong>MEP Exam</strong>
        </div>
        <nav class="sidebar-nav">${sidebarNav}</nav>
        <div style="padding:12px;font-size:11px;color:var(--muted-foreground);border-top:1px solid var(--border);">
          Runs entirely in your browser.<br>No account, no server.
        </div>
      </aside>
      <div class="main-col">
        <header class="topbar">
          <button class="btn btn-ghost btn-icon mobile-menu-btn" id="mobile-menu-btn" aria-label="Open menu">${icon("menu")}</button>
          <div class="flex-1"></div>
          <button class="btn btn-ghost btn-icon" id="theme-toggle" aria-label="Toggle theme">${icon("moon")}</button>
        </header>
        <main class="view-root" id="view-root"></main>
      </div>
    </div>
  `;

  document.querySelectorAll(".nav-link").forEach((el) => {
    el.addEventListener("click", () => {
      document.getElementById("sidebar").classList.remove("open");
      document.getElementById("sidebar-backdrop").classList.remove("open");
    });
  });

  document.getElementById("mobile-menu-btn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.add("open");
    document.getElementById("sidebar-backdrop").classList.add("open");
  });
  document.getElementById("sidebar-backdrop").addEventListener("click", () => {
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebar-backdrop").classList.remove("open");
  });

  setupTheme();
}

function setupTheme() {
  const stored = localStorage.getItem("theme");
  if (stored) document.documentElement.setAttribute("data-theme", stored);
  updateThemeIcon();

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateThemeIcon();
  });
}

function updateThemeIcon() {
  const current = document.documentElement.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.innerHTML = icon(current === "dark" ? "sun" : "moon");
}

async function bootstrap() {
  buildShell();

  const loadingRoot = document.getElementById("view-root");
  loadingRoot.innerHTML = `<div class="empty-state"><div class="skeleton" style="width:220px;height:16px;"></div><p class="mt-2">Preparing your question bank…</p></div>`;

  try {
    // The bundled bank is a ~4MB script — only fetch/parse it on the very
    // first load (or if local storage was cleared); subsequent loads skip
    // straight to reading from IndexedDB.
    if (!SeedLoader.alreadySeededFastPath()) {
      loadingRoot.innerHTML = `<div class="empty-state"><p>Loading the default 5,000-question bank (first run only)…</p></div>`;
      await Utils.loadScript("data/seed-questions.js");
    }
    await SeedLoader.ensureSeeded((done, total) => {
      loadingRoot.innerHTML = `<div class="empty-state"><p>Loading question bank… ${done} / ${total}</p></div>`;
    });
  } catch (e) {
    console.error("Seeding failed", e);
    Utils.toast("Could not load the default question bank — you can still import your own via Admin → Import.", "error");
  }

  Router.register("/dashboard", Views.dashboard);
  Router.register("/exam/start", Views.examStart);
  Router.register("/exam/:id/result", Views.examResult);
  Router.register("/exam/:id/review", Views.examReview);
  Router.register("/exam/:id", Views.examRunner);
  Router.register("/practice", Views.practice);
  Router.register("/bank", Views.bank);
  Router.register("/bookmarks", Views.bookmarks);
  Router.register("/performance", Views.performance);
  Router.register("/history", Views.history);
  Router.register("/admin", Views.admin);
  Router.register("/admin/questions/new", Views.adminQuestionForm);
  Router.register("/admin/questions/:id/edit", Views.adminQuestionForm);
  Router.register("/admin/questions", Views.adminQuestions);
  Router.register("/admin/import", Views.adminImport);
  Router.register("/admin/export", Views.adminExport);
  Router.register("/admin/reports", Views.adminReports);

  Router.init();
}

document.addEventListener("DOMContentLoaded", bootstrap);
