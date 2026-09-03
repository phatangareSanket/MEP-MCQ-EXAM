"use strict";

Views.examStart = {
  async render(root, params, query) {
    const state = {
      discipline: query.discipline || "All MEP",
      topic: query.topic || "All",
      difficulty: query.difficulty || "All",
      questionCount: 25,
      mode: "practice",
      timeLimitMinutes: 60,
      randomizeOptions: true,
      bookmarkedOnly: false,
      weakOnly: false,
    };

    function topicOptions() {
      return ["All", ...topicsFor(state.discipline)];
    }

    function disciplineSelectHtml() {
      return DISCIPLINE_FILTER_OPTIONS.map((d) => `<option value="${Utils.escapeHtml(d)}" ${d === state.discipline ? "selected" : ""}>${Utils.escapeHtml(d)}</option>`).join("");
    }
    function topicSelectHtml() {
      return topicOptions().map((t) => `<option value="${Utils.escapeHtml(t)}" ${t === state.topic ? "selected" : ""}>${Utils.escapeHtml(t)}</option>`).join("");
    }
    function difficultySelectHtml() {
      return DIFFICULTY_FILTER_OPTIONS.map((d) => `<option value="${d}" ${d === state.difficulty ? "selected" : ""}>${d}</option>`).join("");
    }

    function paint() {
      root.innerHTML = `
        <div class="container-md stack">
          <div>
            <h1 class="page-title">Start Exam</h1>
            <p class="page-subtitle">Configure a custom exam from the 5,000-question MEP bank.</p>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">1. Choose your scope</div><div class="card-desc">Pick a discipline, topic, and difficulty — or leave broad to cover everything.</div></div>
            <div class="card-body grid grid-3">
              <div class="field"><label>Discipline</label><select class="select" id="f-discipline">${disciplineSelectHtml()}</select></div>
              <div class="field"><label>Topic</label><select class="select" id="f-topic">${topicSelectHtml()}</select></div>
              <div class="field"><label>Difficulty</label><select class="select" id="f-difficulty">${difficultySelectHtml()}</select></div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">2. Number of questions</div></div>
            <div class="card-body">
              <div class="chip-group" id="count-chips">
                ${QUESTION_COUNT_OPTIONS.map((n) => `<button type="button" class="chip ${state.questionCount === n ? "selected" : ""}" data-count="${n}">${n}</button>`).join("")}
                <button type="button" class="chip ${!QUESTION_COUNT_OPTIONS.includes(state.questionCount) ? "selected" : ""}" id="count-custom-btn">Custom</button>
                ${!QUESTION_COUNT_OPTIONS.includes(state.questionCount) ? `<input class="input" style="width:100px" type="number" min="1" max="200" id="count-custom-input" value="${state.questionCount}">` : ""}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><div class="card-title">3. Exam mode</div></div>
            <div class="card-body stack-sm">
              <div class="grid grid-3" id="mode-chips">
                ${EXAM_MODES.map(
                  (m) => `
                  <button type="button" class="card" data-mode="${m.value}" style="text-align:left;cursor:pointer;padding:14px;${state.mode === m.value ? "border-color:var(--primary);box-shadow:0 0 0 1px var(--primary);" : ""}">
                    <div class="font-medium">${m.label}</div>
                    <div class="text-sm text-muted">${m.description}</div>
                  </button>`
                ).join("")}
              </div>

              ${
                state.mode !== "practice"
                  ? `<div class="field"><label>Time limit</label><div class="chip-group" id="time-chips">${TIME_LIMIT_OPTIONS.map((t) => `<button type="button" class="chip ${state.timeLimitMinutes === t ? "selected" : ""}" data-time="${t}">${t} min</button>`).join("")}</div></div>`
                  : ""
              }

              <div class="switch-row">
                <div><div class="font-medium">Randomize answer choices</div><div class="text-sm text-muted">Shuffle option order for display each time.</div></div>
                <button type="button" class="switch ${state.randomizeOptions ? "on" : ""}" id="sw-randomize"></button>
              </div>
              <div class="switch-row">
                <div><div class="font-medium">Only bookmarked questions</div><div class="text-sm text-muted">Build this exam from your bookmarks only.</div></div>
                <button type="button" class="switch ${state.bookmarkedOnly ? "on" : ""}" id="sw-bookmarked"></button>
              </div>
              <div class="switch-row">
                <div><div class="font-medium">Only my weak topics</div><div class="text-sm text-muted">Topics where your accuracy so far is below 70%.</div></div>
                <button type="button" class="switch ${state.weakOnly ? "on" : ""}" id="sw-weak"></button>
              </div>
            </div>
          </div>

          <button class="btn btn-lg" id="start-btn">Start Exam</button>
        </div>`;

      root.querySelector("#f-discipline").addEventListener("change", (e) => {
        state.discipline = e.target.value;
        state.topic = "All";
        paint();
      });
      root.querySelector("#f-topic").addEventListener("change", (e) => (state.topic = e.target.value));
      root.querySelector("#f-difficulty").addEventListener("change", (e) => (state.difficulty = e.target.value));

      root.querySelectorAll("#count-chips [data-count]").forEach((btn) =>
        btn.addEventListener("click", () => {
          state.questionCount = Number(btn.dataset.count);
          paint();
        })
      );
      const customBtn = root.querySelector("#count-custom-btn");
      if (customBtn)
        customBtn.addEventListener("click", () => {
          state.questionCount = 30;
          paint();
        });
      const customInput = root.querySelector("#count-custom-input");
      if (customInput) customInput.addEventListener("input", (e) => (state.questionCount = Number(e.target.value) || 1));

      root.querySelectorAll("#mode-chips [data-mode]").forEach((btn) =>
        btn.addEventListener("click", () => {
          state.mode = btn.dataset.mode;
          paint();
        })
      );
      root.querySelectorAll("#time-chips [data-time]").forEach((btn) =>
        btn.addEventListener("click", () => {
          state.timeLimitMinutes = Number(btn.dataset.time);
          paint();
        })
      );

      function bindSwitch(id, key) {
        root.querySelector(id).addEventListener("click", () => {
          state[key] = !state[key];
          paint();
        });
      }
      bindSwitch("#sw-randomize", "randomizeOptions");
      bindSwitch("#sw-bookmarked", "bookmarkedOnly");
      bindSwitch("#sw-weak", "weakOnly");

      root.querySelector("#start-btn").addEventListener("click", async () => {
        const btn = root.querySelector("#start-btn");
        btn.disabled = true;
        btn.textContent = "Starting…";
        try {
          const titleParts = [state.discipline];
          if (state.topic !== "All") titleParts.push(state.topic);
          if (state.difficulty !== "All") titleParts.push(state.difficulty);
          const title = `${titleParts.join(" · ")} (${state.questionCount} Qs)`;
          const examId = await ExamEngine.startExam({ ...state, title });
          Router.navigate(`/exam/${examId}`);
        } catch (e) {
          Utils.toast(e.message || "Could not start exam", "error");
          btn.disabled = false;
          btn.textContent = "Start Exam";
        }
      });
    }

    paint();
  },
};
