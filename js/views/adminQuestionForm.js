"use strict";

Views.adminQuestionForm = {
  async render(root, params) {
    const editId = params.id || null;
    const existing = editId ? await DB.get("questions", editId) : null;
    if (editId && !existing) {
      root.innerHTML = `<div class="empty-state"><h2>Question not found</h2></div>`;
      return;
    }

    const allQuestions = await DB.getAll("questions");

    const model = existing
      ? { ...existing, tagsInput: (existing.tags || []).join(", ") }
      : {
          question: "", optionA: "", optionB: "", optionC: "", optionD: "",
          correctAnswer: "A", explanation: "", discipline: "Electrical", topic: "",
          subtopic: "", difficulty: "Basic", tagsInput: "", calculationBased: false, source: "",
        };

    function normalize(s) {
      return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    }
    function jaccard(a, b) {
      const setA = new Set(normalize(a));
      const setB = new Set(normalize(b));
      if (setA.size === 0 || setB.size === 0) return 0;
      let intersection = 0;
      for (const w of setA) if (setB.has(w)) intersection++;
      const union = new Set([...setA, ...setB]).size;
      return intersection / union;
    }
    function findDuplicates(text) {
      if (text.trim().length < 10) return [];
      return allQuestions
        .filter((q) => q.id !== editId)
        .map((q) => ({ q, sim: jaccard(text, q.question) }))
        .filter((r) => r.sim >= 0.5)
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 5);
    }

    function paint() {
      const topics = topicsFor(model.discipline);
      root.innerHTML = `
        <div class="container-md stack">
          <div>
            <h1 class="page-title">${editId ? "Edit Question" : "Add Question"}</h1>
            ${editId ? `<p class="page-subtitle">ID: ${editId}</p>` : ""}
          </div>

          <div class="card">
            <div class="card-body stack">
              <div class="field">
                <label>Question</label>
                <textarea class="textarea" id="f-question" rows="3">${Utils.escapeHtml(model.question)}</textarea>
                <div id="dup-warning"></div>
                <div id="err-question" class="error-text"></div>
              </div>
              <div class="grid grid-2">
                ${["A", "B", "C", "D"]
                  .map(
                    (l) => `<div class="field"><label>Option ${l}</label><input class="input" id="f-option${l}" value="${Utils.escapeHtml(model["option" + l])}"></div>`
                  )
                  .join("")}
              </div>
              <div id="err-options" class="error-text"></div>
              <div class="field">
                <label>Correct Answer</label>
                <div class="flex gap-3">
                  ${["A", "B", "C", "D"].map((l) => `<label class="radio-row"><input type="radio" name="correct" value="${l}" ${model.correctAnswer === l ? "checked" : ""}> ${l}</label>`).join("")}
                </div>
              </div>
              <div class="field">
                <label>Explanation</label>
                <textarea class="textarea" id="f-explanation" rows="3">${Utils.escapeHtml(model.explanation)}</textarea>
                <div id="err-explanation" class="error-text"></div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body grid grid-2">
              <div class="field"><label>Discipline</label><select class="select" id="f-discipline">${DISCIPLINES.map((d) => `<option ${d === model.discipline ? "selected" : ""}>${Utils.escapeHtml(d)}</option>`).join("")}</select></div>
              <div class="field"><label>Topic</label><input class="input" id="f-topic" list="topic-list" value="${Utils.escapeHtml(model.topic)}"><datalist id="topic-list">${topics.map((t) => `<option value="${Utils.escapeHtml(t)}">`).join("")}</datalist><div id="err-topic" class="error-text"></div></div>
              <div class="field"><label>Subtopic</label><input class="input" id="f-subtopic" value="${Utils.escapeHtml(model.subtopic)}"></div>
              <div class="field"><label>Difficulty</label><select class="select" id="f-difficulty">${DIFFICULTIES.map((d) => `<option ${d === model.difficulty ? "selected" : ""}>${d}</option>`).join("")}</select></div>
              <div class="field"><label>Tags (comma-separated)</label><input class="input" id="f-tags" value="${Utils.escapeHtml(model.tagsInput)}" placeholder="cables, calculation, protection"></div>
              <div class="field"><label>Source (optional)</label><input class="input" id="f-source" value="${Utils.escapeHtml(model.source || "")}" placeholder="e.g. NBC 2026"></div>
              <div class="switch-row" style="grid-column:1 / -1;">
                <div><div class="font-medium">Calculation-based</div><div class="text-sm text-muted">Mark if this question requires numeric calculation.</div></div>
                <button type="button" class="switch ${model.calculationBased ? "on" : ""}" id="sw-calc"></button>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button class="btn" id="save-btn">${editId ? "Save Changes" : "Create Question"}</button>
            <button class="btn btn-outline" id="cancel-btn">Cancel</button>
          </div>
        </div>`;

      const qField = root.querySelector("#f-question");
      qField.addEventListener("blur", () => {
        const dups = findDuplicates(qField.value);
        const box = root.querySelector("#dup-warning");
        if (dups.length === 0) {
          box.innerHTML = "";
          return;
        }
        box.innerHTML = `<div class="card mt-2" style="padding:10px;border-color:var(--warning);background:var(--warning-bg);">
          <p class="font-medium">Possible duplicate found.</p>
          <ul style="margin:4px 0 0 18px;padding:0;font-size:12.5px;">${dups.map((d) => `<li>${Utils.escapeHtml(d.q.question.slice(0, 100))}…</li>`).join("")}</ul>
          <p class="text-sm mt-1">You can still save if this is genuinely different.</p>
        </div>`;
      });

      root.querySelector("#sw-calc").addEventListener("click", (e) => {
        model.calculationBased = !model.calculationBased;
        e.target.classList.toggle("on", model.calculationBased);
      });
      root.querySelector("#cancel-btn").addEventListener("click", () => history.back());
      root.querySelector("#f-discipline").addEventListener("change", (e) => {
        model.discipline = e.target.value;
        model.topic = "";
        paint();
      });

      root.querySelector("#save-btn").addEventListener("click", async () => {
        const values = {
          question: root.querySelector("#f-question").value.trim(),
          optionA: root.querySelector("#f-optionA").value.trim(),
          optionB: root.querySelector("#f-optionB").value.trim(),
          optionC: root.querySelector("#f-optionC").value.trim(),
          optionD: root.querySelector("#f-optionD").value.trim(),
          correctAnswer: root.querySelector('input[name="correct"]:checked').value,
          explanation: root.querySelector("#f-explanation").value.trim(),
          discipline: root.querySelector("#f-discipline").value,
          topic: root.querySelector("#f-topic").value.trim(),
          subtopic: root.querySelector("#f-subtopic").value.trim(),
          difficulty: root.querySelector("#f-difficulty").value,
          tags: root.querySelector("#f-tags").value.split(",").map((t) => t.trim()).filter(Boolean),
          calculationBased: model.calculationBased,
          source: root.querySelector("#f-source").value.trim() || null,
        };

        let hasError = false;
        root.querySelector("#err-question").textContent = "";
        root.querySelector("#err-options").textContent = "";
        root.querySelector("#err-explanation").textContent = "";
        root.querySelector("#err-topic").textContent = "";

        if (values.question.length < 10) {
          root.querySelector("#err-question").textContent = "Question must be at least 10 characters.";
          hasError = true;
        }
        const opts = [values.optionA, values.optionB, values.optionC, values.optionD];
        if (opts.some((o) => !o)) {
          root.querySelector("#err-options").textContent = "All four options are required.";
          hasError = true;
        } else if (new Set(opts.map((o) => o.toLowerCase())).size < 4) {
          root.querySelector("#err-options").textContent = "All four options must be different from each other.";
          hasError = true;
        }
        if (values.explanation.length < 10) {
          root.querySelector("#err-explanation").textContent = "Explanation must be at least 10 characters.";
          hasError = true;
        }
        if (!values.topic) {
          root.querySelector("#err-topic").textContent = "Topic is required.";
          hasError = true;
        }
        if (hasError) return;

        const now = new Date().toISOString();
        const record = editId
          ? { ...existing, ...values, updatedAt: now }
          : { id: Utils.uid(), ...values, createdAt: now, updatedAt: now };

        await DB.put("questions", record);
        Utils.toast(editId ? "Question updated" : "Question created", "success");
        Router.navigate("/admin/questions");
      });
    }

    paint();
  },
};
