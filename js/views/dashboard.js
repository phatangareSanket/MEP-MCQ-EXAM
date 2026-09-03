"use strict";

Views.dashboard = {
  async render(root) {
    const [totalQuestions, progress, exams] = await Promise.all([
      DB.count("questions"),
      DB.getAll("progress"),
      DB.getAll("exams"),
    ]);

    const attempted = progress.length;
    const totalAttempts = progress.reduce((s, p) => s + p.attempts, 0);
    const correctAttempts = progress.reduce((s, p) => s + p.correctAttempts, 0);
    const accuracy = Utils.percent(correctAttempts, totalAttempts);
    const completedExams = exams.filter((e) => e.completedAt);
    const bestScorePct = completedExams.reduce((best, e) => Math.max(best, Utils.percent(e.score || 0, e.totalQuestions || 1)), 0);

    const stats = [
      { label: "Total Questions", value: totalQuestions.toLocaleString() },
      { label: "Questions Attempted", value: attempted.toLocaleString() },
      { label: "Correct Answers", value: correctAttempts.toLocaleString() },
      { label: "Accuracy", value: `${accuracy}%` },
      { label: "Exams Completed", value: completedExams.length.toLocaleString() },
      { label: "Best Score", value: `${bestScorePct}%` },
    ];

    const cards = [
      { path: "/exam/start", title: "Start Exam", desc: "Configure a custom exam by discipline, topic, and difficulty." },
      { path: "/practice", title: "Practice Questions", desc: "Instant feedback practice mode, no timer." },
      { path: "/bank", title: "Question Bank", desc: "Search and browse the full 5,000-question bank." },
      { path: "/performance", title: "My Performance", desc: "Accuracy by discipline, topic, and weak areas." },
      { path: "/history", title: "Exam History", desc: "Review all your past exams and scores." },
      { path: "/admin", title: "Admin Panel", desc: "Manage the question bank, import/export, and reports." },
    ];

    root.innerHTML = `
      <div class="container stack">
        <div>
          <h1 class="page-title">Welcome back, Engineer</h1>
          <p class="page-subtitle">Here's where you left off. All data below is stored locally in this browser.</p>
        </div>
        <div class="grid grid-6">
          ${stats.map((s) => `<div class="card stat-tile"><div class="value">${s.value}</div><div class="label">${s.label}</div></div>`).join("")}
        </div>
        <div class="grid grid-3">
          ${cards
            .map(
              (c) => `
            <div class="card" style="display:flex;flex-direction:column;">
              <div class="card-header"><div class="card-title">${c.title}</div><div class="card-desc">${c.desc}</div></div>
              <div class="card-body" style="margin-top:auto;"><a class="btn btn-block" href="#${c.path}">Open</a></div>
            </div>`
            )
            .join("")}
        </div>
      </div>`;
  },
};
