"use strict";

Views.bookmarks = {
  async render(root) {
    const bookmarks = (await DB.getAll("bookmarks")).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const questions = await Promise.all(bookmarks.map((b) => DB.get("questions", b.questionId)));
    const rows = bookmarks.map((b, i) => ({ bookmark: b, question: questions[i] })).filter((r) => r.question);

    root.innerHTML = `
      <div class="container-md stack">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 class="page-title">My Bookmarks</h1>
            <p class="page-subtitle">${rows.length} question(s) saved.</p>
          </div>
          <button class="btn" id="start-from-bookmarks" ${rows.length === 0 ? "disabled" : ""}>Start Exam from Bookmarks</button>
        </div>

        ${
          rows.length === 0
            ? `<div class="card"><div class="card-body empty-state"><p>No bookmarks yet. Bookmark questions while practicing or reviewing an exam.</p></div></div>`
            : `<div class="stack">
                ${rows
                  .map(
                    ({ bookmark, question: q }) => `
                  <div class="card">
                    <div class="card-body">
                      <div class="flex flex-wrap items-center gap-2 mb-2">
                        <span class="badge badge-outline">${Utils.escapeHtml(q.discipline)}</span>
                        <span class="badge badge-outline">${Utils.escapeHtml(q.topic)}</span>
                        <span class="badge badge-secondary">${Utils.escapeHtml(q.difficulty)}</span>
                        <span class="ml-auto text-sm text-muted" style="margin-left:auto;">Bookmarked ${Utils.formatDate(bookmark.createdAt)}</span>
                      </div>
                      <p class="font-medium">${Utils.escapeHtml(q.question)}</p>
                      <button class="btn btn-outline btn-sm mt-3" data-remove="${q.id}">★ Bookmarked (click to remove)</button>
                    </div>
                  </div>`
                  )
                  .join("")}
              </div>`
        }
      </div>`;

    root.querySelectorAll("[data-remove]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        await DB.remove("bookmarks", btn.dataset.remove);
        Views.bookmarks.render(root);
      })
    );

    const startBtn = root.querySelector("#start-from-bookmarks");
    if (startBtn) {
      startBtn.addEventListener("click", async () => {
        startBtn.disabled = true;
        try {
          const examId = await ExamEngine.startExam({
            title: "Bookmarked Questions Practice",
            discipline: "All MEP", topic: "All", difficulty: "All",
            questionCount: Math.min(rows.length, 50), mode: "practice",
            timeLimitMinutes: null, randomizeOptions: true, bookmarkedOnly: true, weakOnly: false,
          });
          Router.navigate(`/exam/${examId}`);
        } catch (e) {
          Utils.toast(e.message || "Could not start exam", "error");
          startBtn.disabled = false;
        }
      });
    }
  },
};
