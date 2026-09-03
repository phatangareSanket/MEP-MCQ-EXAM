"use strict";

Views.adminReports = {
  async render(root) {
    const reports = (await DB.getAll("reports")).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const questions = await Promise.all(reports.map((r) => DB.get("questions", r.questionId)));

    async function setStatus(id, status) {
      const r = await DB.get("reports", id);
      r.status = status;
      await DB.put("reports", r);
      Utils.toast(`Report marked ${status}`, "success");
      Views.adminReports.render(root);
    }

    root.innerHTML = `
      <div class="container-md stack">
        <div>
          <h1 class="page-title">Reported Questions</h1>
          <p class="page-subtitle">Your own flagged issues with question content.</p>
        </div>
        ${
          reports.length === 0
            ? `<div class="card"><div class="card-body empty-state">No reports yet.</div></div>`
            : `<div class="stack">
                ${reports
                  .map((r, i) => {
                    const q = questions[i];
                    const statusBadge = r.status === "open" ? "badge-warning" : r.status === "resolved" ? "badge-success" : "badge-secondary";
                    return `<div class="card"><div class="card-body stack-sm">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="badge ${statusBadge}">${r.status}</span>
                        ${q ? `<span class="badge badge-outline">${Utils.escapeHtml(q.discipline)}</span><span class="badge badge-outline">${Utils.escapeHtml(q.topic)}</span>` : ""}
                        <span class="text-sm text-muted" style="margin-left:auto;">${Utils.formatDate(r.createdAt)}</span>
                      </div>
                      <p class="font-medium">${q ? Utils.escapeHtml(q.question) : "(question deleted)"}</p>
                      <p class="card" style="padding:10px;background:var(--secondary);border:none;">${Utils.escapeHtml(r.reason)}</p>
                      ${
                        r.status === "open"
                          ? `<div class="flex gap-2"><button class="btn btn-outline btn-sm" data-resolve="${r.id}">Resolve</button><button class="btn btn-ghost btn-sm" data-dismiss="${r.id}">Dismiss</button></div>`
                          : ""
                      }
                    </div></div>`;
                  })
                  .join("")}
              </div>`
        }
      </div>`;

    root.querySelectorAll("[data-resolve]").forEach((btn) => btn.addEventListener("click", () => setStatus(btn.dataset.resolve, "resolved")));
    root.querySelectorAll("[data-dismiss]").forEach((btn) => btn.addEventListener("click", () => setStatus(btn.dataset.dismiss, "dismissed")));
  },
};
