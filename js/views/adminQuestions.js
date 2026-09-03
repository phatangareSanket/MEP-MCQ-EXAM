"use strict";

Views.adminQuestions = {
  async render(root, params, query) {
    const state = {
      search: query.search || "",
      discipline: query.discipline || "All MEP",
      topic: query.topic || "All",
      difficulty: query.difficulty || "All",
      calc: query.calc || "all",
      page: Number(query.page) || 1,
    };
    const PAGE_SIZE = 50;
    let selected = new Set();

    let allQuestions = await DB.getAll("questions");

    function filtered() {
      let rows = allQuestions;
      if (state.discipline !== "All MEP") rows = rows.filter((q) => q.discipline === state.discipline);
      if (state.topic !== "All") rows = rows.filter((q) => q.topic === state.topic);
      if (state.difficulty !== "All") rows = rows.filter((q) => q.difficulty === state.difficulty);
      if (state.calc === "yes") rows = rows.filter((q) => q.calculationBased);
      if (state.calc === "no") rows = rows.filter((q) => !q.calculationBased);
      if (state.search.trim()) {
        const term = state.search.trim().toLowerCase();
        rows = rows.filter((q) => q.id === term || q.question.toLowerCase().includes(term) || q.topic.toLowerCase().includes(term));
      }
      return rows;
    }

    async function deleteIds(ids) {
      await DB.bulkRemove("questions", ids);
      allQuestions = allQuestions.filter((q) => !ids.includes(q.id));
      selected = new Set();
      Utils.toast(`Deleted ${ids.length} question(s)`, "success");
      paint();
    }

    async function duplicate(id) {
      const q = allQuestions.find((x) => x.id === id);
      if (!q) return;
      const copy = { ...q, id: Utils.uid(), question: `${q.question} (Copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      await DB.put("questions", copy);
      allQuestions.push(copy);
      Utils.toast("Question duplicated", "success");
      paint();
    }

    function paint() {
      const rows = filtered();
      const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
      state.page = Math.min(state.page, totalPages);
      const pageRows = rows.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
      const allSelectedOnPage = pageRows.length > 0 && pageRows.every((q) => selected.has(q.id));

      root.innerHTML = `
        <div class="container stack">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 class="page-title">Manage Questions</h1>
              <p class="page-subtitle">${rows.length.toLocaleString()} questions total.</p>
            </div>
            <div class="flex gap-2">
              <a class="btn btn-outline" href="#/admin/import">Import</a>
              <a class="btn btn-outline" href="#/admin/export">Export</a>
              <a class="btn" href="#/admin/questions/new">Add Question</a>
            </div>
          </div>

          <div class="card">
            <div class="card-body flex flex-wrap gap-2 items-center">
              <input class="input" style="max-width:240px;flex:1;" id="f-search" placeholder="Search…" value="${Utils.escapeHtml(state.search)}">
              <select class="select" style="width:auto;" id="f-discipline">${DISCIPLINE_FILTER_OPTIONS.map((d) => `<option ${d === state.discipline ? "selected" : ""}>${Utils.escapeHtml(d)}</option>`).join("")}</select>
              <select class="select" style="width:auto;" id="f-topic">${["All", ...topicsFor(state.discipline)].map((t) => `<option ${t === state.topic ? "selected" : ""}>${Utils.escapeHtml(t)}</option>`).join("")}</select>
              <select class="select" style="width:auto;" id="f-difficulty">${DIFFICULTY_FILTER_OPTIONS.map((d) => `<option ${d === state.difficulty ? "selected" : ""}>${d}</option>`).join("")}</select>
            </div>
          </div>

          ${
            selected.size > 0
              ? `<div class="card"><div class="card-body flex items-center justify-between"><span>${selected.size} selected</span><button class="btn btn-destructive btn-sm" id="bulk-delete">Delete Selected</button></div></div>`
              : ""
          }

          <div class="card table-wrap">
            <table class="data-table">
              <thead><tr>
                <th><input type="checkbox" id="select-all" ${allSelectedOnPage ? "checked" : ""}></th>
                <th>Question</th><th>Discipline</th><th>Topic</th><th>Difficulty</th><th style="text-align:right">Actions</th>
              </tr></thead>
              <tbody>
                ${pageRows
                  .map(
                    (q) => `<tr>
                    <td><input type="checkbox" data-select="${q.id}" ${selected.has(q.id) ? "checked" : ""}></td>
                    <td class="truncate" style="max-width:320px;" title="${Utils.escapeHtml(q.question)}">${Utils.escapeHtml(q.question)}</td>
                    <td><span class="badge badge-outline">${Utils.escapeHtml(q.discipline)}</span></td>
                    <td class="truncate" style="max-width:160px;">${Utils.escapeHtml(q.topic)}</td>
                    <td><span class="badge badge-secondary">${q.difficulty}</span></td>
                    <td style="text-align:right;white-space:nowrap;">
                      <a class="btn btn-ghost btn-icon" href="#/admin/questions/${q.id}/edit" title="Edit">✎</a>
                      <button class="btn btn-ghost btn-icon" data-dup="${q.id}" title="Duplicate">⧉</button>
                      <button class="btn btn-ghost btn-icon" data-del="${q.id}" title="Delete">🗑</button>
                    </td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-muted">Showing ${rows.length === 0 ? 0 : (state.page - 1) * PAGE_SIZE + 1}–${Math.min(state.page * PAGE_SIZE, rows.length)} of ${rows.length}</span>
            <div class="flex items-center gap-2">
              <button class="btn btn-outline btn-sm" id="page-prev" ${state.page <= 1 ? "disabled" : ""}>Prev</button>
              <span class="text-muted">Page ${state.page} of ${totalPages}</span>
              <button class="btn btn-outline btn-sm" id="page-next" ${state.page >= totalPages ? "disabled" : ""}>Next</button>
            </div>
          </div>
        </div>`;

      root.querySelector("#f-search").addEventListener("input", Utils.debounce((e) => { state.search = e.target.value; state.page = 1; paint(); }, 250));
      root.querySelector("#f-discipline").addEventListener("change", (e) => { state.discipline = e.target.value; state.topic = "All"; state.page = 1; paint(); });
      root.querySelector("#f-topic").addEventListener("change", (e) => { state.topic = e.target.value; state.page = 1; paint(); });
      root.querySelector("#f-difficulty").addEventListener("change", (e) => { state.difficulty = e.target.value; state.page = 1; paint(); });

      const prevBtn = root.querySelector("#page-prev");
      if (prevBtn) prevBtn.addEventListener("click", () => { state.page--; paint(); });
      const nextBtn = root.querySelector("#page-next");
      if (nextBtn) nextBtn.addEventListener("click", () => { state.page++; paint(); });

      root.querySelector("#select-all").addEventListener("change", (e) => {
        pageRows.forEach((q) => (e.target.checked ? selected.add(q.id) : selected.delete(q.id)));
        paint();
      });
      root.querySelectorAll("[data-select]").forEach((cb) =>
        cb.addEventListener("change", (e) => {
          if (e.target.checked) selected.add(cb.dataset.select);
          else selected.delete(cb.dataset.select);
          paint();
        })
      );

      const bulkDeleteBtn = root.querySelector("#bulk-delete");
      if (bulkDeleteBtn)
        bulkDeleteBtn.addEventListener("click", async () => {
          const ok = await Utils.confirmDialog({ title: "Delete selected questions?", description: `This will permanently delete ${selected.size} question(s). This cannot be undone.` });
          if (ok) deleteIds(Array.from(selected));
        });

      root.querySelectorAll("[data-dup]").forEach((btn) => btn.addEventListener("click", () => duplicate(btn.dataset.dup)));
      root.querySelectorAll("[data-del]").forEach((btn) =>
        btn.addEventListener("click", async () => {
          const ok = await Utils.confirmDialog({ title: "Delete this question?", description: "This will permanently delete the question. This cannot be undone." });
          if (ok) deleteIds([btn.dataset.del]);
        })
      );
    }

    paint();
  },
};
