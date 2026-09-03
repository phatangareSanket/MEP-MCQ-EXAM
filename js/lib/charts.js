// Lightweight, dependency-free "charts" built from plain HTML/CSS bars.
// Single sequential hue for magnitude series (accuracy %), per the project's
// data-viz convention: one color per measure, not one color per category.
"use strict";

const Charts = (() => {
  function barList(items) {
    // items: [{ name, value (0-100), sublabel? }]
    if (!items.length) return `<div class="empty-state">Not enough data yet.</div>`;
    return items
      .map(
        (it) => `
      <div class="chart-bar-row">
        <div class="chart-bar-label truncate" title="${Utils.escapeHtml(it.name)}">${Utils.escapeHtml(it.name)}</div>
        <div class="chart-bar-track"><div class="chart-bar-fill" style="width:${Math.max(2, it.value)}%"></div></div>
        <div class="chart-bar-value">${it.value}%</div>
      </div>`
      )
      .join("");
  }

  function ratioBar(attempted, remaining) {
    const total = attempted + remaining || 1;
    const pct = Math.round((attempted / total) * 100);
    return `
      <div class="progress" style="height:16px;">
        <span style="width:${pct}%"></span>
      </div>
      <div class="flex justify-between mt-2 text-sm text-muted">
        <span><span class="legend-dot" style="background:var(--primary)"></span> Attempted (${attempted})</span>
        <span><span class="legend-dot" style="background:var(--secondary);border:1px solid var(--border)"></span> Remaining (${remaining})</span>
      </div>`;
  }

  function sparkline(values) {
    // values: [{ name, value (0-100) }] rendered as a simple inline bar strip
    if (!values.length) return `<div class="empty-state">No completed exams yet.</div>`;
    const bars = values
      .map(
        (v) => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;min-width:0;">
        <div style="width:100%;display:flex;align-items:flex-end;height:80px;">
          <div style="width:100%;background:var(--primary);border-radius:4px 4px 0 0;height:${Math.max(4, v.value)}%"></div>
        </div>
        <div class="text-sm text-muted truncate" style="max-width:100%;" title="${Utils.escapeHtml(v.name)}">${v.value}%</div>
      </div>`
      )
      .join("");
    return `<div style="display:flex;align-items:flex-end;gap:8px;">${bars}</div>`;
  }

  return { barList, ratioBar, sparkline };
})();
