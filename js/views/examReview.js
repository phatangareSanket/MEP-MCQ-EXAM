"use strict";

Views.examReview = {
  async render(root, params, query) {
    const examId = params.id;
    const filter = query.filter;
    const exam = await DB.get("exams", examId);
    if (!exam) {
      root.innerHTML = `<div class="empty-state"><h2>Exam not found</h2></div>`;
      return;
    }
    if (!exam.completedAt) {
      Router.navigate(`/exam/${examId}`);
      return;
    }

    let eqs = (await DB.getAllByIndex("examQuestions", "examId", examId)).sort((a, b) => a.order - b.order);
    const questions = await Promise.all(eqs.map((e) => DB.get("questions", e.questionId)));
    const byId = new Map(questions.filter(Boolean).map((q) => [q.id, q]));
    const bookmarks = await DB.getAll("bookmarks");
    const bookmarkedIds = new Set(bookmarks.map((b) => b.questionId));

    if (filter === "incorrect") eqs = eqs.filter((e) => e.isCorrect === false);
    if (filter === "unanswered") eqs = eqs.filter((e) => e.selectedAnswer === null);

    function rowHtml(eq) {
      const meta = byId.get(eq.questionId);
      if (!meta) return "";
      const options = { A: eq.optionA, B: eq.optionB, C: eq.optionC, D: eq.optionD };
      const statusBadge =
        eq.isCorrect === true
          ? `<span class="badge badge-success">Correct</span>`
          : eq.isCorrect === false
          ? `<span class="badge badge-destructive">Incorrect</span>`
          : `<span class="badge badge-outline">Unanswered</span>`;

      const optionsHtml = Object.entries(options)
        .map(([letter, text]) => {
          let cls = "";
          if (letter === meta.correctAnswer) cls = "correct";
          else if (letter === eq.selectedAnswer) cls = "incorrect";
          const tag = letter === eq.selectedAnswer ? ' <span class="text-sm text-muted">(your answer)</span>' : letter === meta.correctAnswer ? ' <span class="text-sm text-muted">(correct answer)</span>' : "";
          return `<div class="option-tile ${cls}" style="cursor:default;"><strong>${letter}.</strong>&nbsp;${Utils.escapeHtml(text)}${tag}</div>`;
        })
        .join("");

      return `
        <div class="card">
          <div class="card-body">
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <span class="badge badge-outline">${Utils.escapeHtml(meta.discipline)}</span>
              <span class="badge badge-outline">${Utils.escapeHtml(meta.topic)}</span>
              <span class="badge badge-secondary">${Utils.escapeHtml(meta.difficulty)}</span>
              ${statusBadge}
            </div>
            <p class="font-medium">${eq.order}. ${Utils.escapeHtml(meta.question)}</p>
            <div class="stack-sm mt-3">${optionsHtml}</div>
            <div class="card mt-3" style="padding:12px;background:var(--secondary);border:none;">
              <p class="font-medium">Explanation</p>
              <p class="text-muted mt-1">${Utils.escapeHtml(meta.explanation)}</p>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <button class="btn btn-outline btn-sm" data-bookmark="${meta.id}">${bookmarkedIds.has(meta.id) ? "★ Bookmarked" : "☆ Bookmark"}</button>
              <a class="btn btn-outline btn-sm" href="#/bank?topic=${encodeURIComponent(meta.topic)}">Practice Similar Questions</a>
            </div>
          </div>
        </div>`;
    }

    root.innerHTML = `
      <div class="container-md stack">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 class="page-title">Review — ${Utils.escapeHtml(exam.title)}</h1>
            <p class="page-subtitle">${eqs.length} question(s) shown.</p>
          </div>
          <div class="flex gap-2">
            <a class="btn ${!filter ? "" : "btn-outline"} btn-sm" href="#/exam/${examId}/review">All</a>
            <a class="btn ${filter === "incorrect" ? "" : "btn-outline"} btn-sm" href="#/exam/${examId}/review?filter=incorrect">Incorrect</a>
            <a class="btn ${filter === "unanswered" ? "" : "btn-outline"} btn-sm" href="#/exam/${examId}/review?filter=unanswered">Unanswered</a>
          </div>
        </div>
        <div class="stack">${eqs.map(rowHtml).join("") || '<div class="empty-state">No questions match this filter.</div>'}</div>
      </div>`;

    root.querySelectorAll("[data-bookmark]").forEach((btn) =>
      btn.addEventListener("click", async () => {
        const qid = btn.dataset.bookmark;
        const existing = await DB.get("bookmarks", qid);
        if (existing) {
          await DB.remove("bookmarks", qid);
          btn.textContent = "☆ Bookmark";
        } else {
          await DB.put("bookmarks", { questionId: qid, createdAt: new Date().toISOString() });
          btn.textContent = "★ Bookmarked";
        }
      })
    );
  },
};
