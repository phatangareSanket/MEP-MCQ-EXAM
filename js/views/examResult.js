"use strict";

Views.examResult = {
  async render(root, params) {
    const examId = params.id;
    const exam = await DB.get("exams", examId);
    if (!exam) {
      root.innerHTML = `<div class="empty-state"><h2>Exam not found</h2></div>`;
      return;
    }
    if (!exam.completedAt) {
      Router.navigate(`/exam/${examId}`);
      return;
    }

    const eqs = await DB.getAllByIndex("examQuestions", "examId", examId);
    const questions = await Promise.all(eqs.map((e) => DB.get("questions", e.questionId)));
    const byId = new Map(questions.filter(Boolean).map((q) => [q.id, q]));

    const byDiscipline = new Map();
    for (const eq of eqs) {
      const meta = byId.get(eq.questionId);
      const key = meta ? meta.discipline : "Unknown";
      const entry = byDiscipline.get(key) || { correct: 0, total: 0 };
      entry.total++;
      if (eq.isCorrect) entry.correct++;
      byDiscipline.set(key, entry);
    }

    const total = exam.totalQuestions;
    const correct = exam.correctCount || 0;
    const incorrect = exam.incorrectCount || 0;
    const unanswered = exam.unansweredCount || 0;
    const scorePct = Utils.percent(correct, total);
    const timeTakenSec = Math.max(0, Math.floor((new Date(exam.completedAt).getTime() - new Date(exam.startedAt).getTime()) / 1000));

    root.innerHTML = `
      <div class="container-md stack">
        <div class="card">
          <div class="card-body text-center" style="padding:40px 20px;">
            <p class="text-muted">${Utils.escapeHtml(exam.title)}</p>
            <p class="text-2xl font-bold mt-2">${correct} / ${total}</p>
            <p class="text-xl font-bold text-primary">${scorePct}%</p>
          </div>
        </div>

        <div class="grid grid-4">
          <div class="card stat-tile"><div class="value text-success">${correct}</div><div class="label">Correct</div></div>
          <div class="card stat-tile"><div class="value text-destructive">${incorrect}</div><div class="label">Incorrect</div></div>
          <div class="card stat-tile"><div class="value text-muted">${unanswered}</div><div class="label">Unanswered</div></div>
          <div class="card stat-tile"><div class="value">${Utils.formatDuration(timeTakenSec)}</div><div class="label">Time Taken</div></div>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">Performance by Discipline</div></div>
          <div class="card-body table-wrap">
            <table class="data-table">
              <thead><tr><th>Discipline</th><th style="text-align:right">Correct</th><th style="text-align:right">Total</th><th style="text-align:right">Accuracy</th></tr></thead>
              <tbody>
                ${Array.from(byDiscipline.entries())
                  .map(([d, s]) => `<tr><td>${Utils.escapeHtml(d)}</td><td style="text-align:right">${s.correct}</td><td style="text-align:right">${s.total}</td><td style="text-align:right">${Utils.percent(s.correct, s.total)}%</td></tr>`)
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <a class="btn" href="#/exam/${examId}/review?filter=incorrect">Review Incorrect Answers</a>
          <a class="btn btn-outline" href="#/exam/${examId}/review">Review All Questions</a>
          <a class="btn btn-outline" href="#/exam/start?discipline=${encodeURIComponent(exam.discipline)}&topic=${encodeURIComponent(exam.topic)}&difficulty=${encodeURIComponent(exam.difficulty)}">Retake Similar Exam</a>
          <a class="btn btn-outline" href="#/exam/start">Start New Exam</a>
        </div>
      </div>`;
  },
};
