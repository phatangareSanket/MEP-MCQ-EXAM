import { makeRng, shuffle, contentId } from "./rng.mjs";

const LETTERS = ["A", "B", "C", "D"];

/**
 * Build `count` distinct calculation-based question variants from a template spec.
 *
 * spec: {
 *   discipline, topic, subtopic, tags: string[], source?: string,
 *   difficulty: string | (params) => string,
 *   gen: (rng, i) => params,
 *   compute: (params) => { formatted: string },   // correct answer, pre-formatted with units
 *   question: (params) => string,
 *   explanation: (params, formattedCorrect) => string,
 *   distractors: (params, result, rng) => [string, string, string], // pre-formatted, distinct from correct
 * }
 */
export function buildCalcVariants(spec, count, seedPrefix) {
  const out = [];
  const seenQuestions = new Set();
  let i = 0;
  let attempts = 0;
  const maxAttempts = count * 40 + 200;

  while (out.length < count && attempts < maxAttempts) {
    attempts++;
    const rng = makeRng(`${seedPrefix}::${i}`);
    i++;
    let params;
    try {
      params = spec.gen(rng, i);
    } catch {
      continue;
    }
    if (!params) continue;
    const qText = spec.question(params);
    if (seenQuestions.has(qText)) continue;

    const result = spec.compute(params);
    const wrongs = spec.distractors(params, result, rng);
    const optionSet = new Set([result.formatted, ...wrongs]);
    if (optionSet.size < 4) continue;

    seenQuestions.add(qText);

    const shuffled = shuffle(rng, [
      { text: result.formatted, correct: true },
      ...wrongs.map((w) => ({ text: w, correct: false })),
    ]);
    const optionMap = {};
    let correctLetter = "A";
    shuffled.forEach((o, idx) => {
      optionMap[LETTERS[idx]] = o.text;
      if (o.correct) correctLetter = LETTERS[idx];
    });

    out.push({
      id: contentId(spec.discipline, spec.topic, qText),
      question: qText,
      optionA: optionMap.A,
      optionB: optionMap.B,
      optionC: optionMap.C,
      optionD: optionMap.D,
      correctAnswer: correctLetter,
      explanation: spec.explanation(params, result.formatted),
      discipline: spec.discipline,
      topic: spec.topic,
      subtopic: spec.subtopic || spec.topic,
      difficulty: typeof spec.difficulty === "function" ? spec.difficulty(params) : spec.difficulty,
      tags: spec.tags || [],
      calculationBased: true,
      source: spec.source || null,
    });
  }
  return out;
}

/**
 * Distribute an exact `target` count across templates by weight, generate each,
 * and return the concatenated list (guaranteed to sum to <= target; caller tops up if short).
 */
export function buildCalcSet(templates, target, disciplineSlug) {
  const totalWeight = templates.reduce((s, t) => s + (t.weight || 1), 0);
  let allocated = 0;
  const counts = templates.map((t, idx) => {
    const c = idx === templates.length - 1 ? target - allocated : Math.round(((t.weight || 1) / totalWeight) * target);
    allocated += c;
    return Math.max(0, c);
  });

  const out = [];
  templates.forEach((t, idx) => {
    const items = buildCalcVariants(t.spec, counts[idx], `${disciplineSlug}::${t.name}`);
    out.push(...items);
  });
  return out;
}

/** Hand-authored conceptual question list -> normalized question objects. */
export function buildConceptual(list, discipline, topic) {
  return list.map((item) => {
    const options = item.options;
    return {
      id: contentId(discipline, topic, item.q),
      question: item.q,
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3],
      correctAnswer: LETTERS[item.correct],
      explanation: item.explanation,
      discipline,
      topic,
      subtopic: item.subtopic || topic,
      difficulty: item.difficulty || "Basic",
      tags: item.tags || [],
      calculationBased: !!item.calc,
      source: item.source || null,
    };
  });
}

/**
 * Auto-generate conceptual questions from a compact "fact bank":
 * facts: [{ term, definition, function, fact, topic, subtopic, difficulty, tags }]
 * Produces up to 3 question framings per fact, drawing distractors from sibling
 * facts in the same topic so distractors stay plausible and technically grounded.
 */
export function buildFromFactBank(facts, discipline, options = {}) {
  const byTopic = new Map();
  for (const f of facts) {
    if (!byTopic.has(f.topic)) byTopic.set(f.topic, []);
    byTopic.get(f.topic).push(f);
  }

  const out = [];
  const pushIfValid = (mcq) => {
    if (mcq && mcq._optSize === 4) {
      delete mcq._optSize;
      out.push(mcq);
    }
  };
  for (const fact of facts) {
    const siblings = byTopic.get(fact.topic).filter((f) => f.term !== fact.term);
    const rng = makeRng(`${discipline}::${fact.topic}::${fact.term}`);

    // Framing 1: "What is <term>?" using definitions as options.
    if (fact.definition && siblings.filter((s) => s.definition).length >= 3) {
      const distractors = shuffle(rng, siblings.filter((s) => s.definition)).slice(0, 3).map((s) => s.definition);
      const qText = `What best describes ${fact.term}?`;
      pushIfValid(makeMcq({
        discipline, topic: fact.topic, subtopic: fact.subtopic || fact.topic,
        qText, correct: fact.definition, wrongs: distractors,
        explanation: fact.explanation || `${fact.term}: ${fact.definition}`,
        difficulty: fact.difficulty || "Basic", tags: fact.tags || [],
      }));
    }

    // Framing 2: "What is the primary function/purpose of <term>?" using function field.
    if (fact.function && siblings.filter((s) => s.function).length >= 3) {
      const distractors = shuffle(rng, siblings.filter((s) => s.function)).slice(0, 3).map((s) => s.function);
      const qText = `What is the primary function of ${fact.term} in an MEP system?`;
      pushIfValid(makeMcq({
        discipline, topic: fact.topic, subtopic: fact.subtopic || fact.topic,
        qText, correct: fact.function, wrongs: distractors,
        explanation: fact.explanation || `${fact.term} is primarily used to ${lowerFirst(fact.function)}.`,
        difficulty: fact.difficulty || "Basic", tags: fact.tags || [],
      }));
    }

    // Framing 3: a standalone true statement about the term, with statements from
    // sibling terms (misattributed) as distractors.
    if (fact.fact && siblings.filter((s) => s.fact).length >= 3) {
      const distractors = shuffle(rng, siblings.filter((s) => s.fact)).slice(0, 3).map((s) => s.fact);
      const qText = `Which of the following statements about ${fact.term} is correct?`;
      pushIfValid(makeMcq({
        discipline, topic: fact.topic, subtopic: fact.subtopic || fact.topic,
        qText, correct: fact.fact, wrongs: distractors,
        explanation: fact.explanation || fact.fact,
        difficulty: fact.difficulty || "Intermediate", tags: fact.tags || [],
      }));
    }
  }
  return out;
}

/** Trim `items` down to `target` count, round-robining across `keyFn(item)` groups
 *  so topics stay evenly represented instead of front-loading the list. Deterministic. */
export function roundRobinTrim(items, target, keyFn) {
  if (items.length <= target) return items;
  const groups = new Map();
  for (const it of items) {
    const k = keyFn(it);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(it);
  }
  const keys = [...groups.keys()];
  const out = [];
  let idx = 0;
  while (out.length < target) {
    const k = keys[idx % keys.length];
    const bucket = groups.get(k);
    if (bucket.length) out.push(bucket.shift());
    idx++;
    if (keys.every((kk) => groups.get(kk).length === 0)) break;
  }
  return out;
}

/** Pad `items` up to `target` by cycling in extras from `overflow` that aren't already present (by id). */
export function topUp(items, overflow, target, keyFn) {
  if (items.length >= target) return items.slice(0, target);
  const existingIds = new Set(items.map((i) => i.id));
  const extra = overflow.filter((o) => !existingIds.has(o.id));
  const padded = roundRobinTrim(extra, target - items.length, keyFn);
  return items.concat(padded);
}

function lowerFirst(s) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function makeMcq({ discipline, topic, subtopic, qText, correct, wrongs, explanation, difficulty, tags }) {
  const rng = makeRng(`${discipline}::${topic}::${qText}::${correct}`);
  const optSet = new Set([correct, ...wrongs]);
  const shuffled = shuffle(rng, [
    { text: correct, correct: true },
    ...wrongs.map((w) => ({ text: w, correct: false })),
  ]);
  const optionMap = {};
  let correctLetter = "A";
  shuffled.forEach((o, idx) => {
    optionMap[LETTERS[idx]] = o.text;
    if (o.correct) correctLetter = LETTERS[idx];
  });
  return {
    id: contentId(discipline, topic, qText, correct),
    question: qText,
    optionA: optionMap.A,
    optionB: optionMap.B,
    optionC: optionMap.C,
    optionD: optionMap.D,
    correctAnswer: correctLetter,
    explanation,
    discipline,
    topic,
    subtopic,
    difficulty,
    tags,
    calculationBased: false,
    source: null,
    _optSize: optSet.size,
  };
}
