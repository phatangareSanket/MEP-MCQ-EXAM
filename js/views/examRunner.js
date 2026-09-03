"use strict";

Views.examRunner = {
  timerHandle: null,

  destroy() {
    if (this.timerHandle) clearInterval(this.timerHandle);
    this.timerHandle = null;
  },

  async render(root, params) {
    const examId = params.id;
    const data = await ExamEngine.getExamData(examId);
    if (!data) {
      root.innerHTML = `<div class="empty-state"><h2>Exam not found</h2><a class="btn mt-3" href="#/exam/start">Start a new exam</a></div>`;
      return;
    }
    if (data.exam.completedAt) {
      Router.navigate(`/exam/${examId}/result`);
      return;
    }

    const exam = data.exam;
    const questions = data.questions;
    let index = 0;
    const revealed = {}; // examQuestionId -> {correctAnswer, isCorrect}
    const optionOrderCache = {};
    let submitting = false;
    let navOpen = false;

    const totalSeconds = exam.timeLimitMinutes ? exam.timeLimitMinutes * 60 : null;
    let remaining = totalSeconds !== null ? Math.max(0, totalSeconds - Math.floor((Date.now() - new Date(exam.startedAt).getTime()) / 1000)) : null;

    const self = this;

    function seededShuffle(arr, seed) {
      let h = 0;
      for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
      const rand = () => {
        h = (Math.imul(h ^ (h >>> 15), 1 | h) + 0x6d2b79f5) | 0;
        return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
      };
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function optionOrder(q) {
      if (!optionOrderCache[q.examQuestionId]) {
        optionOrderCache[q.examQuestionId] = exam.randomizeOptions ? seededShuffle(["A", "B", "C", "D"], q.examQuestionId) : ["A", "B", "C", "D"];
      }
      return optionOrderCache[q.examQuestionId];
    }

    async function selectAnswer(q, letter) {
      q.selectedAnswer = letter;
      await ExamEngine.saveAnswer(q.examQuestionId, { selectedAnswer: letter });
      if (exam.mode === "practice") {
        revealed[q.examQuestionId] = { correctAnswer: q.correctAnswer, isCorrect: letter === q.correctAnswer };
      }
      paint();
    }

    async function clearAnswer(q) {
      q.selectedAnswer = null;
      await ExamEngine.saveAnswer(q.examQuestionId, { selectedAnswer: null });
      delete revealed[q.examQuestionId];
      paint();
    }

    async function toggleMark(q) {
      q.markedForReview = !q.markedForReview;
      await ExamEngine.saveAnswer(q.examQuestionId, { markedForReview: q.markedForReview });
      paint();
    }

    async function doSubmit() {
      if (submitting) return;
      submitting = true;
      try {
        await ExamEngine.submitExam(examId);
        self.destroy();
        Router.navigate(`/exam/${examId}/result`);
      } catch (e) {
        Utils.toast(e.message || "Could not submit exam", "error");
        submitting = false;
      }
    }

    function statusFor(q, i) {
      if (i === index) return "current";
      if (q.markedForReview) return "marked";
      if (q.selectedAnswer) return "answered";
      return "";
    }

    function navigatorHtml() {
      return `<div class="qnav-grid">${questions
        .map((q, i) => `<button type="button" class="qnav-btn ${statusFor(q, i)}" data-idx="${i}">${i + 1}</button>`)
        .join("")}</div>`;
    }

    function bindNavigator(container) {
      container.querySelectorAll("[data-idx]").forEach((btn) =>
        btn.addEventListener("click", () => {
          index = Number(btn.dataset.idx);
          navOpen = false;
          paint();
        })
      );
    }

    function paint() {
      const q = questions[index];
      const answeredCount = questions.filter((x) => x.selectedAnswer).length;
      const markedCount = questions.filter((x) => x.markedForReview).length;
      const unansweredCount = questions.length - answeredCount;
      const rev = revealed[q.examQuestionId];
      const isPractice = exam.mode === "practice";

      const optionsHtml = optionOrder(q)
        .map((letter) => {
          const text = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD }[letter];
          const selected = q.selectedAnswer === letter;
          let cls = "";
          if (rev) {
            if (letter === rev.correctAnswer) cls = "correct";
            else if (selected) cls = "incorrect";
          } else if (selected) cls = "selected";
          return `<button type="button" class="option-tile ${cls}" data-letter="${letter}" ${rev ? "disabled" : ""}>
            <strong>${letter}.</strong>&nbsp;${Utils.escapeHtml(text)}
          </button>`;
        })
        .join("");

      root.innerHTML = `
        <div class="container stack">
          <div class="card">
            <div class="card-body flex items-center justify-between flex-wrap gap-2">
              <div class="flex items-center gap-2">
                <button class="btn btn-ghost btn-icon mobile-menu-btn" id="qnav-open">${icon("menu")}</button>
                <div>
                  <div class="font-medium">Question ${index + 1} of ${questions.length}</div>
                  <div class="text-sm text-muted">${Utils.escapeHtml(exam.title)}</div>
                </div>
              </div>
              ${remaining !== null ? `<span class="badge ${remaining < 60 ? "badge-destructive" : "badge-secondary"}" style="font-size:14px;padding:6px 10px;">${Utils.formatClock(remaining)}</span>` : `<span class="badge badge-outline">Practice Mode</span>`}
            </div>
          </div>

          <div style="display:grid;grid-template-columns:220px 1fr;gap:16px;" id="runner-grid">
            <div id="nav-panel" class="card" style="height:fit-content;padding:16px;">
              <div class="font-medium mb-2">Questions</div>
              ${navigatorHtml()}
              <div class="stack-sm mt-3 text-sm text-muted">
                <div><span class="legend-dot" style="background:var(--success)"></span> Answered (${answeredCount})</div>
                <div><span class="legend-dot" style="background:var(--warning)"></span> Marked (${markedCount})</div>
                <div><span class="legend-dot" style="background:var(--input)"></span> Unanswered (${unansweredCount})</div>
              </div>
            </div>

            <div class="stack">
              <div class="card">
                <div class="card-body">
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span class="badge badge-outline">${Utils.escapeHtml(q.discipline)}</span>
                    <span class="badge badge-outline">${Utils.escapeHtml(q.topic)}</span>
                    <span class="badge badge-secondary">${Utils.escapeHtml(q.difficulty)}</span>
                  </div>
                  <p class="font-medium" style="font-size:15px;line-height:1.6;">${Utils.escapeHtml(q.question)}</p>
                  <div class="stack-sm mt-4" id="options-list">${optionsHtml}</div>

                  ${
                    isPractice && rev
                      ? `<div class="card mt-4" style="padding:14px;border-color:${rev.isCorrect ? "var(--success)" : "var(--destructive)"};">
                          <p class="font-medium">${rev.isCorrect ? "Correct!" : `Incorrect — correct answer is ${rev.correctAnswer}`}</p>
                          <p class="text-muted mt-1">${Utils.escapeHtml(q.explanation || "")}</p>
                        </div>`
                      : ""
                  }

                  <div class="flex flex-wrap gap-2 mt-4">
                    <button class="btn btn-outline btn-sm" id="btn-bookmark">☆ Bookmark</button>
                    <button class="btn btn-outline btn-sm" id="btn-report">⚑ Report Question</button>
                    <button class="btn ${q.markedForReview ? "btn-secondary" : "btn-outline"} btn-sm" id="btn-mark">${q.markedForReview ? "Unmark Review" : "Mark for Review"}</button>
                    <button class="btn btn-outline btn-sm" id="btn-clear" ${!q.selectedAnswer ? "disabled" : ""}>Clear Answer</button>
                  </div>
                </div>
              </div>

              <div class="card">
                <div class="card-body flex items-center justify-between gap-2">
                  <button class="btn btn-outline" id="btn-prev" ${index === 0 ? "disabled" : ""}>Previous</button>
                  <div class="flex gap-2">
                    ${index < questions.length - 1 ? `<button class="btn" id="btn-next">Next</button>` : ""}
                    <button class="btn btn-destructive" id="btn-submit">Submit Exam</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sidebar-backdrop" id="qnav-backdrop" style="${navOpen ? "display:block" : ""}"></div>
      `;

      if (window.innerWidth <= 900) {
        const navPanel = root.querySelector("#nav-panel");
        navPanel.style.display = navOpen ? "block" : "none";
        navPanel.style.position = navOpen ? "fixed" : "static";
        if (navOpen) {
          navPanel.style.cssText += "position:fixed;bottom:0;left:0;right:0;top:auto;z-index:60;border-radius:14px 14px 0 0;max-height:70vh;overflow-y:auto;";
        }
        root.querySelector("#runner-grid").style.gridTemplateColumns = "1fr";
      }

      bindNavigator(root.querySelector("#nav-panel"));

      root.querySelectorAll("#options-list [data-letter]").forEach((btn) =>
        btn.addEventListener("click", () => selectAnswer(q, btn.dataset.letter))
      );

      root.querySelector("#btn-clear").addEventListener("click", () => clearAnswer(q));
      root.querySelector("#btn-mark").addEventListener("click", () => toggleMark(q));
      root.querySelector("#btn-prev").addEventListener("click", () => {
        index = Math.max(0, index - 1);
        paint();
      });
      const nextBtn = root.querySelector("#btn-next");
      if (nextBtn) nextBtn.addEventListener("click", () => { index = Math.min(questions.length - 1, index + 1); paint(); });

      root.querySelector("#btn-submit").addEventListener("click", async () => {
        const ok = await Utils.confirmDialog({
          title: "Submit this exam?",
          description: `You have answered ${answeredCount} of ${questions.length} questions${unansweredCount > 0 ? ` (${unansweredCount} unanswered)` : ""}. This cannot be undone.`,
          confirmLabel: "Submit Exam",
        });
        if (ok) doSubmit();
      });

      root.querySelector("#qnav-open").addEventListener("click", () => {
        navOpen = true;
        paint();
      });
      const backdrop = root.querySelector("#qnav-backdrop");
      if (backdrop) backdrop.addEventListener("click", () => { navOpen = false; paint(); });

      root.querySelector("#btn-bookmark").addEventListener("click", async () => {
        const existing = await DB.get("bookmarks", q.questionId);
        if (existing) {
          await DB.remove("bookmarks", q.questionId);
          Utils.toast("Removed bookmark", "info");
        } else {
          await DB.put("bookmarks", { questionId: q.questionId, createdAt: new Date().toISOString() });
          Utils.toast("Bookmarked", "success");
        }
      });
      root.querySelector("#btn-report").addEventListener("click", () => openReportModal(q.questionId));
    }

    function openReportModal(questionId) {
      const overlay = Utils.openModal(`
        <div class="modal-title">Report a question</div>
        <div class="modal-desc">Tell us what's wrong — a typo, an incorrect answer, an unclear option, etc.</div>
        <textarea class="textarea mt-3" id="report-reason" rows="4" placeholder="Describe the issue…"></textarea>
        <div class="modal-footer">
          <button class="btn btn-outline" id="report-cancel">Cancel</button>
          <button class="btn" id="report-submit">Submit Report</button>
        </div>`);
      overlay.querySelector("#report-cancel").addEventListener("click", () => overlay.remove());
      overlay.querySelector("#report-submit").addEventListener("click", async () => {
        const reason = overlay.querySelector("#report-reason").value.trim();
        if (reason.length < 3) return Utils.toast("Please describe the issue.", "error");
        await DB.put("reports", { id: Utils.uid(), questionId, reason, status: "open", createdAt: new Date().toISOString() });
        Utils.toast("Thanks — this question has been flagged for review.", "success");
        overlay.remove();
      });
    }

    if (remaining !== null) {
      this.timerHandle = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          clearInterval(this.timerHandle);
          Utils.toast("Time's up — submitting your exam.", "info");
          doSubmit();
          return;
        }
        const badge = root.querySelector(".badge-secondary, .badge-destructive");
        if (badge) {
          badge.textContent = Utils.formatClock(remaining);
          badge.classList.toggle("badge-destructive", remaining < 60);
          badge.classList.toggle("badge-secondary", remaining >= 60);
        }
      }, 1000);
    }

    paint();
  },
};
