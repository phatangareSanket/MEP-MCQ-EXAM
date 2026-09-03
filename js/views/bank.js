"use strict";

Views.bank = {
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

    const allQuestions = await DB.getAll("questions");
    const bookmarks = await DB.getAll("bookmarks");
    const bookmarkedIds = new Set(bookmarks.map((b) => b.questionId));

    function filtered() {
      let rows = allQuestions;
      if (state.discipline !== "All MEP") rows = rows.filter((q) => q.discipline === state.discipline);
      if (state.topic !== "All") rows = rows.filter((q) => q.topic === state.topic);
      if (state.difficulty !== "All") rows = rows.filter((q) => q.difficulty === state.difficulty);
      if (state.calc === "yes") rows = rows.filter((q) => q.calculationBased);
      if (state.calc === "no") rows = rows.filter((q) => !q.calculationBased);
      if (state.search.trim()) {
        const term = state.search.trim().toLowerCase();
        rows = rows.filter((q) => q.id === term || q.question.toLowerCase().includes(term) || q.topic.toLowerCase().includes(term) || (q.tags || []).some((t) => t.toLowerCase().includes(term)));
      }
      return rows;
    }

    async function toggleBookmark(id, btn) {
      if (bookmarkedIds.has(id)) {
        await DB.remove("bookmarks", id);
        bookmarkedIds.delete(id);
        btn.textContent = "☆ Bookmark";
      } else {
        await DB.put("bookmarks", { questionId: id, createdAt: new Date().toISOString() });
        bookmarkedIds.add(id);
        btn.textContent = "★ Bookmarked";
      }
    }

    function paint() {
      const rows = filtered();
      const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
      state.page = Math.min(state.page, totalPages);
      const pageRows = rows.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

      root.innerHTML = `
        <div class="container-md stack">
          <div>
            <h1 class="page-title">Question Bank</h1>
            <p class="page-subtitle">Search and browse the full MEP question bank (${rows.length.toLocaleString()} matching).</p>
          </div>

          <div class="card">
            <div class="card-body flex flex-wrap gap-2 items-center">
              <input class="input" style="max-width:260px;flex:1;" id="f-search" placeholder="Search question, topic, tag, or ID…" value="${Utils.escapeHtml(state.search)}">
              <select class="select" style="width:auto;" id="f-discipline">${DISCIPLINE_FILTER_OPTIONS.map((d) => `<option ${d === state.discipline ? "selected" : ""}>${Utils.escapeHtml(d)}</option>`).join("")}</select>
              <select class="select" style="width:auto;" id="f-topic">${["All", ...topicsFor(state.discipline)].map((t) => `<option ${t === state.topic ? "selected" : ""}>${Utils.escapeHtml(t)}</option>`).join("")}</select>
              <select class="select" style="width:auto;" id="f-difficulty">${DIFFICULTY_FILTER_OPTIONS.map((d) => `<option ${d === state.difficulty ? "selected" : ""}>${d}</option>`).join("")}</select>
              <select class="select" style="width:auto;" id="f-calc">
                <option value="all" ${state.calc === "all" ? "selected" : ""}>All Questions</option>
                <option value="yes" ${state.calc === "yes" ? "selected" : ""}>Calculation-Based</option>
                <option value="no" ${state.calc === "no" ? "selected" : ""}>Conceptual</option>
              </select>
            </div>
          </div>

          <div class="stack">
            ${
              pageRows.length === 0
                ? `<div class="card"><div class="card-body empty-state">No questions match these filters.</div></div>`
                : pageRows
                    .map(
                      (q) => `
                <div class="card">
                  <div class="card-body">
                    <div class="flex flex-wrap gap-2 mb-2">
                      <span class="badge badge-outline">${Utils.escapeHtml(q.discipline)}</span>
                      <span class="badge badge-outline">${Utils.escapeHtml(q.topic)}</span>
                      <span class="badge badge-secondary">${Utils.escapeHtml(q.difficulty)}</span>
                      ${q.calculationBased ? `<span class="badge badge-warning">Calculation</span>` : ""}
                    </div>
                    <p class="font-medium">${Utils.escapeHtml(q.question)}</p>
                    <div class="grid grid-2 mt-3 text-sm text-muted">
                      <span>A. ${Utils.escapeHtml(q.optionA)}</span><span>B. ${Utils.escapeHtml(q.optionB)}</span>
                      <span>C. ${Utils.escapeHtml(q.optionC)}</span><span>D. ${Utils.escapeHtml(q.optionD)}</span>
                    </div>
                    <button class="btn btn-outline btn-sm mt-3" data-bookmark="${q.id}">${bookmarkedIds.has(q.id) ? "★ Bookmarked" : "☆ Bookmark"}</button>
                  </div>
                </div>`
                    )
                    .join("")
            }
          </div>

          ${
            rows.length > 0
              ? `<div class="flex items-center justify-between text-sm">
                  <span class="text-muted">Showing ${(state.page - 1) * PAGE_SIZE + 1}–${Math.min(state.page * PAGE_SIZE, rows.length)} of ${rows.length}</span>
                  <div class="flex items-center gap-2">
                    <button class="btn btn-outline btn-sm" id="page-prev" ${state.page <= 1 ? "disabled" : ""}>Prev</button>
                    <span class="text-muted">Page ${state.page} of ${totalPages}</span>
                    <button class="btn btn-outline btn-sm" id="page-next" ${state.page >= totalPages ? "disabled" : ""}>Next</button>
                  </div>
                </div>`
              : ""
          }
        </div>`;

      root.querySelector("#f-search").addEventListener(
        "input",
        Utils.debounce((e) => {
          state.search = e.target.value;
          state.page = 1;
          paint();
        }, 250)
      );
      root.querySelector("#f-discipline").addEventListener("change", (e) => { state.discipline = e.target.value; state.topic = "All"; state.page = 1; paint(); });
      root.querySelector("#f-topic").addEventListener("change", (e) => { state.topic = e.target.value; state.page = 1; paint(); });
      root.querySelector("#f-difficulty").addEventListener("change", (e) => { state.difficulty = e.target.value; state.page = 1; paint(); });
      root.querySelector("#f-calc").addEventListener("change", (e) => { state.calc = e.target.value; state.page = 1; paint(); });

      const prevBtn = root.querySelector("#page-prev");
      if (prevBtn) prevBtn.addEventListener("click", () => { state.page--; paint(); });
      const nextBtn = root.querySelector("#page-next");
      if (nextBtn) nextBtn.addEventListener("click", () => { state.page++; paint(); });

      root.querySelectorAll("[data-bookmark]").forEach((btn) => btn.addEventListener("click", () => toggleBookmark(btn.dataset.bookmark, btn)));
    }

    paint();
  },
};
