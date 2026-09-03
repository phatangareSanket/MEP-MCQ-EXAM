"use strict";

Views.admin = {
  async render(root) {
    const questions = await DB.getAll("questions");
    const reports = await DB.getAll("reports");
    const openReports = reports.filter((r) => r.status === "open").length;

    const disciplineCounts = DISCIPLINES.map((d) => ({ discipline: d, count: questions.filter((q) => q.discipline === d).length }));

    const cards = [
      { path: "/admin/questions", title: "Manage Questions", desc: "Search, edit, duplicate, and delete questions." },
      { path: "/admin/questions/new", title: "Add Question", desc: "Create a new question with full validation." },
      { path: "/admin/import", title: "Import Questions", desc: "Bulk import from CSV or JSON with validation and preview." },
      { path: "/admin/export", title: "Export Questions", desc: "Export the full bank or a filtered subset to CSV." },
      { path: "/admin/reports", title: "Reported Questions", desc: `${openReports} open report(s) to review.` },
    ];

    root.innerHTML = `
      <div class="container stack">
        <div>
          <h1 class="page-title">Admin Panel</h1>
          <p class="page-subtitle">${questions.length.toLocaleString()} questions in the bank. All data lives in this browser's local storage.</p>
        </div>
        <div class="grid grid-3">
          ${cards
            .map(
              (c) => `<div class="card" style="display:flex;flex-direction:column;">
                <div class="card-header"><div class="card-title">${c.title}</div><div class="card-desc">${c.desc}</div></div>
                <div class="card-body" style="margin-top:auto;"><a class="btn btn-block" href="#${c.path}">Open</a></div>
              </div>`
            )
            .join("")}
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title">Questions by Discipline</div></div>
          <div class="card-body grid grid-6">
            ${disciplineCounts.map((d) => `<div class="card" style="text-align:center;padding:12px;"><div class="font-bold" style="font-size:17px;">${d.count.toLocaleString()}</div><div class="text-sm text-muted">${d.discipline}</div></div>`).join("")}
          </div>
        </div>
      </div>`;
  },
};
