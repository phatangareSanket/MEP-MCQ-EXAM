// Small dependency-free helpers shared across views.
"use strict";

const Utils = (() => {
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(s);
    });
  }

  function uid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  function formatDuration(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m ${sec}s`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  }

  function formatClock(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function percent(numerator, denominator) {
    if (!denominator) return 0;
    return Math.round((numerator / denominator) * 1000) / 10;
  }

  function shuffle(arr, rng) {
    const rand = rng || Math.random;
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sample(arr, n) {
    return shuffle(arr).slice(0, Math.min(n, arr.length));
  }

  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  function qs(params) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") sp.set(k, v);
    }
    const s = sp.toString();
    return s ? `?${s}` : "";
  }

  function parseQuery(queryString) {
    const sp = new URLSearchParams(queryString || "");
    const out = {};
    for (const [k, v] of sp.entries()) out[k] = v;
    return out;
  }

  // ---- toasts ----
  function toast(message, type = "info") {
    let root = document.getElementById("toast-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "toast-root";
      document.body.appendChild(root);
    }
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    root.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .2s";
      el.style.opacity = "0";
      setTimeout(() => el.remove(), 200);
    }, 3200);
  }

  // ---- confirm modal (returns a Promise<boolean>) ----
  function confirmDialog({ title, description, confirmLabel = "Confirm", destructive = true }) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
          <div class="modal-title">${escapeHtml(title)}</div>
          <div class="modal-desc">${escapeHtml(description)}</div>
          <div class="modal-footer">
            <button class="btn btn-outline" data-act="cancel">Cancel</button>
            <button class="btn ${destructive ? "btn-destructive" : ""}" data-act="ok">${escapeHtml(confirmLabel)}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      function close(result) {
        overlay.remove();
        resolve(result);
      }
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close(false);
      });
      overlay.querySelector('[data-act="cancel"]').addEventListener("click", () => close(false));
      overlay.querySelector('[data-act="ok"]').addEventListener("click", () => close(true));
    });
  }

  // ---- generic modal with custom body HTML; returns the overlay element for the caller to wire up ----
  function openModal(innerHtml) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${innerHtml}</div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    return overlay;
  }

  return {
    loadScript,
    uid,
    escapeHtml,
    formatDate,
    formatDuration,
    formatClock,
    percent,
    shuffle,
    sample,
    debounce,
    qs,
    parseQuery,
    toast,
    confirmDialog,
    openModal,
  };
})();
