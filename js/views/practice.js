"use strict";

Views.practice = {
  async render(root) {
    const state = { discipline: "All MEP", topic: "All", difficulty: "All", questionCount: 20, weakOnly: false };

    function paint() {
      root.innerHTML = `
        <div class="container-sm stack">
          <div>
            <h1 class="page-title">Practice</h1>
            <p class="page-subtitle">Untimed practice with instant feedback after every question.</p>
          </div>
          <div class="card">
            <div class="card-body stack">
              <div class="grid grid-3">
                <div class="field"><label>Discipline</label><select class="select" id="f-discipline">${DISCIPLINE_FILTER_OPTIONS.map((d) => `<option ${d === state.discipline ? "selected" : ""}>${Utils.escapeHtml(d)}</option>`).join("")}</select></div>
                <div class="field"><label>Topic</label><select class="select" id="f-topic">${["All", ...topicsFor(state.discipline)].map((t) => `<option ${t === state.topic ? "selected" : ""}>${Utils.escapeHtml(t)}</option>`).join("")}</select></div>
                <div class="field"><label>Difficulty</label><select class="select" id="f-difficulty">${DIFFICULTY_FILTER_OPTIONS.map((d) => `<option ${d === state.difficulty ? "selected" : ""}>${d}</option>`).join("")}</select></div>
              </div>
              <div class="field">
                <label>Number of questions</label>
                <div class="chip-group">${QUESTION_COUNT_OPTIONS.filter((n) => n <= 50).map((n) => `<button type="button" class="chip ${state.questionCount === n ? "selected" : ""}" data-count="${n}">${n}</button>`).join("")}</div>
              </div>
              <button type="button" class="chip ${state.weakOnly ? "selected" : ""}" id="weak-toggle" style="align-self:flex-start;">Practice my weak topics only</button>
              <button class="btn btn-lg" id="start-btn" style="align-self:flex-start;">Start Practice</button>
            </div>
          </div>
        </div>`;

      root.querySelector("#f-discipline").addEventListener("change", (e) => {
        state.discipline = e.target.value;
        state.topic = "All";
        paint();
      });
      root.querySelector("#f-topic").addEventListener("change", (e) => (state.topic = e.target.value));
      root.querySelector("#f-difficulty").addEventListener("change", (e) => (state.difficulty = e.target.value));
      root.querySelectorAll("[data-count]").forEach((btn) => btn.addEventListener("click", () => { state.questionCount = Number(btn.dataset.count); paint(); }));
      root.querySelector("#weak-toggle").addEventListener("click", () => { state.weakOnly = !state.weakOnly; paint(); });

      root.querySelector("#start-btn").addEventListener("click", async () => {
        const btn = root.querySelector("#start-btn");
        btn.disabled = true;
        try {
          const title = `Practice: ${state.discipline}${state.topic !== "All" ? " · " + state.topic : ""} (${state.questionCount} Qs)`;
          const examId = await ExamEngine.startExam({
            ...state, title, mode: "practice", timeLimitMinutes: null, randomizeOptions: true, bookmarkedOnly: false,
          });
          Router.navigate(`/exam/${examId}`);
        } catch (e) {
          Utils.toast(e.message || "Could not start practice", "error");
          btn.disabled = false;
        }
      });
    }
    paint();
  },
};
