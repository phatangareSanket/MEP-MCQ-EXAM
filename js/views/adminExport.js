"use strict";

Views.adminExport = {
  async render(root) {
    const state = { discipline: "All MEP", topic: "All", difficulty: "All" };
    const allQuestions = await DB.getAll("questions");

    const CSV_COLUMNS = ["id", "question", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "explanation", "discipline", "topic", "subtopic", "difficulty", "tags", "calculationBased", "source"];

    function matching() {
      let rows = allQuestions;
      if (state.discipline !== "All MEP") rows = rows.filter((q) => q.discipline === state.discipline);
      if (state.topic !== "All") rows = rows.filter((q) => q.topic === state.topic);
      if (state.difficulty !== "All") rows = rows.filter((q) => q.difficulty === state.difficulty);
      return rows;
    }

    function downloadCsv() {
      const rows = matching().map((q) => ({
        id: q.id, question: q.question, optionA: q.optionA, optionB: q.optionB, optionC: q.optionC, optionD: q.optionD,
        correctAnswer: q.correctAnswer, explanation: q.explanation, discipline: q.discipline, topic: q.topic,
        subtopic: q.subtopic, difficulty: q.difficulty, tags: (q.tags || []).join("|"), calculationBased: String(!!q.calculationBased), source: q.source || "",
      }));
      const csv = CSV.stringify(rows, CSV_COLUMNS);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mep-questions-export-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    function paint() {
      const count = matching().length;
      root.innerHTML = `
        <div class="container-sm stack">
          <div>
            <h1 class="page-title">Export Questions</h1>
            <p class="page-subtitle">Export all questions or a filtered subset to CSV.</p>
          </div>
          <div class="card">
            <div class="card-body stack">
              <div class="grid grid-3">
                <div class="field"><label>Discipline</label><select class="select" id="f-discipline">${DISCIPLINE_FILTER_OPTIONS.map((d) => `<option ${d === state.discipline ? "selected" : ""}>${Utils.escapeHtml(d)}</option>`).join("")}</select></div>
                <div class="field"><label>Topic</label><select class="select" id="f-topic">${["All", ...topicsFor(state.discipline)].map((t) => `<option ${t === state.topic ? "selected" : ""}>${Utils.escapeHtml(t)}</option>`).join("")}</select></div>
                <div class="field"><label>Difficulty</label><select class="select" id="f-difficulty">${DIFFICULTY_FILTER_OPTIONS.map((d) => `<option ${d === state.difficulty ? "selected" : ""}>${d}</option>`).join("")}</select></div>
              </div>
              <button class="btn" id="download-btn" style="align-self:flex-start;">Download CSV (${count.toLocaleString()} questions)</button>
            </div>
          </div>
        </div>`;

      root.querySelector("#f-discipline").addEventListener("change", (e) => { state.discipline = e.target.value; state.topic = "All"; paint(); });
      root.querySelector("#f-topic").addEventListener("change", (e) => (state.topic = e.target.value));
      root.querySelector("#f-difficulty").addEventListener("change", (e) => (state.difficulty = e.target.value));
      root.querySelector("#download-btn").addEventListener("click", downloadCsv);
    }

    paint();
  },
};
