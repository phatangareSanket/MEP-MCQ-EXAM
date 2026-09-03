"use strict";

Views.history = {
  async render(root) {
    const exams = (await DB.getAll("exams")).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    root.innerHTML = `
      <div class="container stack">
        <div>
          <h1 class="page-title">Exam History</h1>
          <p class="page-subtitle">All your past and in-progress exams.</p>
        </div>
        ${
          exams.length === 0
            ? `<div class="card"><div class="card-body empty-state"><p>No exams yet.</p><a class="btn mt-2" href="#/exam/start">Start your first exam</a></div></div>`
            : `<div class="card table-wrap"><table class="data-table">
                <thead><tr><th>Date</th><th>Type</th><th>Discipline</th><th style="text-align:right">Questions</th><th style="text-align:right">Score</th><th style="text-align:right">Accuracy</th><th style="text-align:right">Time</th><th style="text-align:right">Action</th></tr></thead>
                <tbody>
                  ${exams
                    .map((e) => {
                      const completed = Boolean(e.completedAt);
                      const timeSec = completed ? Math.max(0, Math.floor((new Date(e.completedAt) - new Date(e.startedAt)) / 1000)) : null;
                      return `<tr>
                        <td style="white-space:nowrap;">${Utils.formatDate(e.startedAt)}</td>
                        <td style="text-transform:capitalize;">${e.mode}</td>
                        <td>${Utils.escapeHtml(e.discipline)}</td>
                        <td style="text-align:right">${e.totalQuestions}</td>
                        <td style="text-align:right">${completed ? `${e.score}/${e.totalQuestions}` : `<span class="badge badge-warning">In progress</span>`}</td>
                        <td style="text-align:right">${completed ? Utils.percent(e.score || 0, e.totalQuestions) + "%" : "—"}</td>
                        <td style="text-align:right">${timeSec !== null ? Utils.formatDuration(timeSec) : "—"}</td>
                        <td style="text-align:right"><a class="btn btn-outline btn-sm" href="#/exam/${e.id}${completed ? "/result" : ""}">${completed ? "View Result" : "Resume"}</a></td>
                      </tr>`;
                    })
                    .join("")}
                </tbody>
              </table></div>`
        }
      </div>`;
  },
};
