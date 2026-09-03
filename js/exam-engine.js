// Client-side replacement for the server-side start_exam/submit_exam logic:
// random question selection and scoring, all running against IndexedDB.
"use strict";

const ExamEngine = (() => {
  async function candidateQuestions({ discipline, topic, difficulty, bookmarkedOnly, weakOnly }) {
    let all = await DB.getAll("questions");

    if (discipline && discipline !== "All MEP") all = all.filter((q) => q.discipline === discipline);
    if (topic && topic !== "All") all = all.filter((q) => q.topic === topic);
    if (difficulty && difficulty !== "All") all = all.filter((q) => q.difficulty === difficulty);

    if (bookmarkedOnly) {
      const bookmarks = await DB.getAll("bookmarks");
      const ids = new Set(bookmarks.map((b) => b.questionId));
      all = all.filter((q) => ids.has(q.id));
    }

    if (weakOnly) {
      const progress = await DB.getAll("progress");
      const byQuestion = new Map(progress.map((p) => [p.questionId, p]));
      const topicStats = new Map();
      for (const q of all) {
        const p = byQuestion.get(q.id);
        if (!p || !p.attempts) continue;
        const s = topicStats.get(q.topic) || { attempts: 0, correct: 0 };
        s.attempts += p.attempts;
        s.correct += p.correctAttempts;
        topicStats.set(q.topic, s);
      }
      const weakTopics = new Set(
        Array.from(topicStats.entries())
          .filter(([, s]) => s.attempts >= 3 && s.correct / s.attempts < 0.7)
          .map(([t]) => t)
      );
      all = all.filter((q) => weakTopics.has(q.topic));
    }

    return all;
  }

  async function startExam(config) {
    const candidates = await candidateQuestions(config);
    if (candidates.length === 0) {
      throw new Error("No questions match the selected filters. Try broadening your selection.");
    }
    const selected = Utils.sample(candidates, config.questionCount);

    const examId = Utils.uid();
    const now = new Date().toISOString();
    const exam = {
      id: examId,
      title: config.title,
      discipline: config.discipline,
      topic: config.topic,
      difficulty: config.difficulty,
      mode: config.mode,
      timeLimitMinutes: config.mode === "practice" ? null : config.timeLimitMinutes || 60,
      randomizeOptions: !!config.randomizeOptions,
      questionCount: selected.length,
      totalQuestions: selected.length,
      score: null,
      correctCount: null,
      incorrectCount: null,
      unansweredCount: null,
      startedAt: now,
      completedAt: null,
    };
    await DB.put("exams", exam);

    const examQuestions = selected.map((q, i) => ({
      id: Utils.uid(),
      examId,
      questionId: q.id,
      order: i + 1,
      optionA: q.optionA,
      optionB: q.optionB,
      optionC: q.optionC,
      optionD: q.optionD,
      selectedAnswer: null,
      markedForReview: false,
      answeredAt: null,
    }));
    await DB.bulkPut("examQuestions", examQuestions);

    return examId;
  }

  async function getExamData(examId) {
    const exam = await DB.get("exams", examId);
    if (!exam) return null;
    const eqs = (await DB.getAllByIndex("examQuestions", "examId", examId)).sort((a, b) => a.order - b.order);
    const questionIds = eqs.map((e) => e.questionId);
    const questions = await Promise.all(questionIds.map((id) => DB.get("questions", id)));
    const byId = new Map(questions.filter(Boolean).map((q) => [q.id, q]));

    const merged = eqs.map((eq) => {
      const meta = byId.get(eq.questionId) || {};
      return {
        examQuestionId: eq.id,
        order: eq.order,
        questionId: eq.questionId,
        question: meta.question || "(question unavailable — it may have been deleted from the bank)",
        optionA: eq.optionA,
        optionB: eq.optionB,
        optionC: eq.optionC,
        optionD: eq.optionD,
        correctAnswer: meta.correctAnswer,
        explanation: meta.explanation,
        discipline: meta.discipline || exam.discipline,
        topic: meta.topic || exam.topic,
        difficulty: meta.difficulty || exam.difficulty,
        selectedAnswer: eq.selectedAnswer,
        markedForReview: eq.markedForReview,
      };
    });

    return { exam, questions: merged };
  }

  async function saveAnswer(examQuestionId, patch) {
    const eq = await DB.get("examQuestions", examQuestionId);
    if (!eq) throw new Error("Question not found in this exam.");
    if (patch.selectedAnswer !== undefined) {
      eq.selectedAnswer = patch.selectedAnswer;
      eq.answeredAt = patch.selectedAnswer ? new Date().toISOString() : null;
    }
    if (patch.markedForReview !== undefined) eq.markedForReview = patch.markedForReview;
    await DB.put("examQuestions", eq);
    return eq;
  }

  async function submitExam(examId) {
    const exam = await DB.get("exams", examId);
    if (!exam) throw new Error("Exam not found.");
    if (exam.completedAt) throw new Error("This exam has already been submitted.");

    const eqs = await DB.getAllByIndex("examQuestions", "examId", examId);
    const questions = await Promise.all(eqs.map((eq) => DB.get("questions", eq.questionId)));
    const questionById = new Map(questions.filter(Boolean).map((q) => [q.id, q]));

    let correct = 0, incorrect = 0, unanswered = 0;
    const progressUpdates = [];

    for (const eq of eqs) {
      const meta = questionById.get(eq.questionId);
      if (!eq.selectedAnswer) {
        unanswered++;
        eq.isCorrect = null;
      } else {
        eq.isCorrect = meta ? eq.selectedAnswer === meta.correctAnswer : false;
        if (eq.isCorrect) correct++;
        else incorrect++;
        progressUpdates.push({ questionId: eq.questionId, isCorrect: eq.isCorrect });
      }
    }
    await DB.bulkPut("examQuestions", eqs);

    for (const u of progressUpdates) {
      const existing = (await DB.get("progress", u.questionId)) || {
        questionId: u.questionId, attempts: 0, correctAttempts: 0, incorrectAttempts: 0, lastAttemptedAt: null,
      };
      existing.attempts += 1;
      if (u.isCorrect) existing.correctAttempts += 1;
      else existing.incorrectAttempts += 1;
      existing.lastAttemptedAt = new Date().toISOString();
      await DB.put("progress", existing);
    }

    exam.score = correct;
    exam.correctCount = correct;
    exam.incorrectCount = incorrect;
    exam.unansweredCount = unanswered;
    exam.totalQuestions = eqs.length;
    exam.completedAt = new Date().toISOString();
    await DB.put("exams", exam);

    return { score: correct, total: eqs.length, correctCount: correct, incorrectCount: incorrect, unansweredCount: unanswered };
  }

  return { startExam, getExamData, saveAnswer, submitExam, candidateQuestions };
})();
