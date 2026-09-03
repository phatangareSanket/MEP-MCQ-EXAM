"use strict";

Views.performance = {
  async render(root) {
    const [totalQuestions, progress, exams, questions] = await Promise.all([
      DB.count("questions"),
      DB.getAll("progress"),
      DB.getAll("exams"),
      DB.getAll("questions"),
    ]);
    const questionById = new Map(questions.map((q) => [q.id, q]));

    function aggregate(keyFn) {
      const map = new Map();
      for (const p of progress) {
        const meta = questionById.get(p.questionId);
        if (!meta) continue;
        const key = keyFn(meta);
        const entry = map.get(key) || { correct: 0, total: 0 };
        entry.correct += p.correctAttempts;
        entry.total += p.attempts;
        map.set(key, entry);
      }
      return map;
    }

    const byDiscipline = aggregate((m) => m.discipline);
    const byDifficulty = aggregate((m) => m.difficulty);
    const byTopic = aggregate((m) => m.topic);

    const disciplineData = Array.from(byDiscipline.entries())
      .map(([name, s]) => ({ name, value: Utils.percent(s.correct, s.total), attempts: s.total }))
      .sort((a, b) => b.attempts - a.attempts);

    const difficultyData = ["Basic", "Intermediate", "Advanced"]
      .map((name) => {
        const s = byDifficulty.get(name);
        return s ? { name, value: Utils.percent(s.correct, s.total) } : null;
      })
      .filter(Boolean);

    const topicRows = Array.from(byTopic.entries())
      .map(([name, s]) => ({ name, accuracy: Utils.percent(s.correct, s.total), attempts: s.total }))
      .filter((t) => t.attempts >= 3);
    const weakTopics = [...topicRows].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);
    const strongTopics = [...topicRows].sort((a, b) => b.accuracy - a.accuracy).slice(0, 5);

    const attempted = progress.length;
    const remaining = Math.max(0, totalQuestions - attempted);
    const totalAttempts = progress.reduce((s, p) => s + p.attempts, 0);
    const totalCorrect = progress.reduce((s, p) => s + p.correctAttempts, 0);
    const overallAccuracy = Utils.percent(totalCorrect, totalAttempts);

    const recentScores = exams
      .filter((e) => e.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 10)
      .reverse()
      .map((e) => ({ name: e.title.slice(0, 18), value: Utils.percent(e.score || 0, e.totalQuestions) }));

    root.innerHTML = `
      <div class="container stack">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 class="page-title">My Performance</h1>
            <p class="page-subtitle">Accuracy trends across disciplines, topics, and difficulty.</p>
          </div>
          <button class="btn" id="practice-weak" ${topicRows.length === 0 ? "disabled" : ""}>Practice Weak Areas</button>
        </div>

        <div class="card">
          <div class="card-body text-center">
            <p class="text-sm text-muted">Overall Accuracy</p>
            <p class="text-2xl font-bold">${overallAccuracy}%</p>
            <p class="text-sm text-muted mt-1">${totalCorrect} correct out of ${totalAttempts} attempts across ${attempted} unique questions</p>
          </div>
        </div>

        <div class="grid grid-2">
          <div class="card"><div class="card-header"><div class="card-title">Accuracy by Discipline</div></div><div class="card-body chart-box">${Charts.barList(disciplineData)}</div></div>
          <div class="card"><div class="card-header"><div class="card-title">Accuracy by Difficulty</div></div><div class="card-body chart-box">${Charts.barList(difficultyData)}</div></div>
          <div class="card"><div class="card-header"><div class="card-title">Recent Exam Scores</div></div><div class="card-body chart-box">${Charts.sparkline(recentScores)}</div></div>
          <div class="card"><div class="card-header"><div class="card-title">Questions Attempted vs Remaining</div></div><div class="card-body chart-box">${Charts.ratioBar(attempted, remaining)}</div></div>
        </div>

        <div class="grid grid-2">
          <div class="card">
            <div class="card-header"><div class="card-title">Your Weakest Areas</div></div>
            <div class="card-body">${
              weakTopics.length === 0
                ? `<p class="text-sm text-muted">Attempt at least 3 questions in a topic to see weak areas.</p>`
                : `<ol class="stack-sm" style="padding-left:18px;margin:0;">${weakTopics.map((t) => `<li class="flex justify-between"><span>${Utils.escapeHtml(t.name)}</span><span class="text-destructive font-medium">${t.accuracy}%</span></li>`).join("")}</ol>`
            }</div>
          </div>
          <div class="card">
            <div class="card-header"><div class="card-title">Your Strongest Areas</div></div>
            <div class="card-body">${
              strongTopics.length === 0
                ? `<p class="text-sm text-muted">Attempt at least 3 questions in a topic to see strong areas.</p>`
                : `<ol class="stack-sm" style="padding-left:18px;margin:0;">${strongTopics.map((t) => `<li class="flex justify-between"><span>${Utils.escapeHtml(t.name)}</span><span class="text-success font-medium">${t.accuracy}%</span></li>`).join("")}</ol>`
            }</div>
          </div>
        </div>
      </div>`;

    const weakBtn = root.querySelector("#practice-weak");
    if (weakBtn) {
      weakBtn.addEventListener("click", async () => {
        weakBtn.disabled = true;
        try {
          const examId = await ExamEngine.startExam({
            title: "Weak Areas Practice", discipline: "All MEP", topic: "All", difficulty: "All",
            questionCount: 25, mode: "practice", timeLimitMinutes: null, randomizeOptions: true, bookmarkedOnly: false, weakOnly: true,
          });
          Router.navigate(`/exam/${examId}`);
        } catch (e) {
          Utils.toast(e.message || "Could not start practice", "error");
          weakBtn.disabled = false;
        }
      });
    }
  },
};
