"use strict";

Views.adminImport = {
  async render(root) {
    let validRows = [];
    let errorRows = [];
    let fileName = null;
    let importResult = null;

    function validateRow(raw, rowNum) {
      const errors = [];
      const question = (raw.question || "").trim();
      const optionA = (raw.optionA || "").trim();
      const optionB = (raw.optionB || "").trim();
      const optionC = (raw.optionC || "").trim();
      const optionD = (raw.optionD || "").trim();
      const correctAnswer = (raw.correctAnswer || "").trim().toUpperCase();
      const explanation = (raw.explanation || "").trim();
      const discipline = (raw.discipline || "").trim();
      const topic = (raw.topic || "").trim();
      const difficulty = (raw.difficulty || "").trim();

      if (question.length < 10) errors.push("question must be at least 10 characters");
      if (!optionA) errors.push("optionA is required");
      if (!optionB) errors.push("optionB is required");
      if (!optionC) errors.push("optionC is required");
      if (!optionD) errors.push("optionD is required");
      if (!["A", "B", "C", "D"].includes(correctAnswer)) errors.push("correctAnswer must be A, B, C, or D");
      if (explanation.length < 10) errors.push("explanation must be at least 10 characters");
      if (!DISCIPLINES.includes(discipline)) errors.push(`discipline must be one of: ${DISCIPLINES.join(", ")}`);
      if (!topic) errors.push("topic is required");
      if (!DIFFICULTIES.includes(difficulty)) errors.push("difficulty must be Basic, Intermediate, or Advanced");

      if (errors.length) return { row: rowNum, message: errors.join("; ") };

      const tagsRaw = raw.tags;
      const tags = Array.isArray(tagsRaw) ? tagsRaw : String(tagsRaw || "").split("|").map((t) => t.trim()).filter(Boolean);
      const calculationBased = raw.calculationBased === true || String(raw.calculationBased).toLowerCase() === "true";

      return {
        data: {
          question, optionA, optionB, optionC, optionD, correctAnswer, explanation,
          discipline, topic, subtopic: (raw.subtopic || "").trim(), difficulty, tags, calculationBased,
          source: raw.source ? String(raw.source).trim() : null,
        },
      };
    }

    function handleParsedRows(rows) {
      validRows = [];
      errorRows = [];
      rows.forEach((raw, i) => {
        const result = validateRow(raw, i + 2);
        if (result.data) validRows.push(result.data);
        else errorRows.push(result);
      });
      importResult = null;
      paint();
    }

    async function handleFile(file) {
      fileName = file.name;
      const text = await file.text();
      if (file.name.toLowerCase().endsWith(".json")) {
        try {
          const parsed = JSON.parse(text);
          const arr = Array.isArray(parsed) ? parsed : parsed.questions;
          if (!Array.isArray(arr)) throw new Error("JSON must be an array of questions (or {questions: [...]})");
          handleParsedRows(arr);
        } catch (e) {
          Utils.toast(`Could not parse JSON: ${e.message}`, "error");
        }
      } else {
        try {
          const rows = CSV.parse(text);
          handleParsedRows(rows);
        } catch (e) {
          Utils.toast(`Could not parse CSV: ${e.message}`, "error");
        }
      }
    }

    async function confirmImport() {
      const btn = root.querySelector("#confirm-import");
      btn.disabled = true;
      btn.textContent = "Importing…";
      const now = new Date().toISOString();
      const records = validRows.map((r) => ({ id: Utils.uid(), ...r, createdAt: now, updatedAt: now }));
      await DB.bulkPut("questions", records);
      importResult = { inserted: records.length, total: validRows.length + errorRows.length };
      Utils.toast(`Imported ${records.length} questions`, "success");
      paint();
    }

    function paint() {
      root.innerHTML = `
        <div class="container-md stack">
          <div>
            <h1 class="page-title">Import Questions</h1>
            <p class="page-subtitle">Upload a CSV or JSON file to bulk-add questions to the bank.</p>
          </div>

          <div class="card">
            <div class="card-body flex flex-wrap items-center gap-3">
              <input type="file" class="input" accept=".csv,.json" id="file-input" style="max-width:280px;">
              <a class="btn btn-outline" href="assets/sample-questions-template.csv" download>Download Sample CSV Template</a>
            </div>
            ${fileName ? `<div class="card-body" style="padding-top:0;"><p class="text-sm text-muted">Loaded: ${Utils.escapeHtml(fileName)}</p></div>` : ""}
          </div>

          ${
            errorRows.length > 0
              ? `<div class="card" style="border-color:var(--destructive);">
                  <div class="card-body">
                    <p class="font-medium text-destructive">${errorRows.length} row(s) have errors and will be skipped</p>
                    <ul style="max-height:160px;overflow-y:auto;font-size:12.5px;margin:8px 0 0 18px;padding:0;color:var(--muted-foreground);">
                      ${errorRows.slice(0, 50).map((e) => `<li>Row ${e.row}: ${Utils.escapeHtml(e.message)}</li>`).join("")}
                    </ul>
                  </div>
                </div>`
              : ""
          }

          ${
            validRows.length > 0
              ? `<div class="card">
                  <div class="card-body stack">
                    <div class="flex items-center justify-between">
                      <p><span class="badge badge-success">${validRows.length} valid</span> ${errorRows.length > 0 ? `<span class="badge badge-destructive">${errorRows.length} invalid</span>` : ""}</p>
                      <button class="btn" id="confirm-import">Confirm Import (${validRows.length})</button>
                    </div>
                    <div class="table-wrap" style="max-height:360px;overflow-y:auto;">
                      <table class="data-table">
                        <thead><tr><th>Question</th><th>Discipline</th><th>Topic</th><th>Difficulty</th><th>Correct</th></tr></thead>
                        <tbody>${validRows.slice(0, 100).map((r) => `<tr><td class="truncate" style="max-width:260px;">${Utils.escapeHtml(r.question)}</td><td>${Utils.escapeHtml(r.discipline)}</td><td>${Utils.escapeHtml(r.topic)}</td><td>${r.difficulty}</td><td>${r.correctAnswer}</td></tr>`).join("")}</tbody>
                      </table>
                    </div>
                    ${validRows.length > 100 ? `<p class="text-sm text-muted">Showing first 100 of ${validRows.length} rows.</p>` : ""}
                  </div>
                </div>`
              : ""
          }

          ${
            importResult
              ? `<div class="card"><div class="card-body"><p class="font-medium">Import complete: ${importResult.inserted} of ${importResult.total} inserted.</p></div></div>`
              : ""
          }
        </div>`;

      root.querySelector("#file-input").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
      });
      const confirmBtn = root.querySelector("#confirm-import");
      if (confirmBtn) confirmBtn.addEventListener("click", confirmImport);
    }

    paint();
  },
};
