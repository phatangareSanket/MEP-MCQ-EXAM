// Orchestrates all discipline generators into the final 5000-question seed bank.
// Deterministic: re-running this script produces identical output (same content-derived IDs),
// so re-seeding a database with it is idempotent (upsert on id).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateElectrical } from "./disciplines/electrical.mjs";
import { generateHVAC } from "./disciplines/hvac.mjs";
import { generateFire } from "./disciplines/fire.mjs";
import { generatePlumbing } from "./disciplines/plumbing.mjs";
import { generateELV } from "./disciplines/elv.mjs";
import { generateBMS } from "./disciplines/bms.mjs";
import { generateEstimation } from "./disciplines/estimation.mjs";
import { generateCodes } from "./disciplines/codes.mjs";
import { generateLifts } from "./disciplines/lifts.mjs";
import { generateSolar } from "./disciplines/solar.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "out");

const EXPECTED_COUNTS = {
  Electrical: 1200,
  HVAC: 900,
  "Fire Fighting": 600,
  Plumbing: 500,
  ELV: 500,
  BMS: 300,
  "MEP Estimation": 400,
  "Codes & Standards": 300,
  Lifts: 150,
  Solar: 150,
};

function nowIso() {
  return new Date().toISOString();
}

function main() {
  const generators = [
    generateElectrical,
    generateHVAC,
    generateFire,
    generatePlumbing,
    generateELV,
    generateBMS,
    generateEstimation,
    generateCodes,
    generateLifts,
    generateSolar,
  ];

  let all = [];
  for (const gen of generators) {
    const items = gen();
    all = all.concat(items);
  }

  // Attach timestamps (fixed so re-runs are byte-identical / idempotent).
  const createdAt = process.env.SEED_TIMESTAMP || "2026-01-01T00:00:00.000Z";
  all = all.map((q) => ({ ...q, createdAt, updatedAt: createdAt }));

  // Global validation -------------------------------------------------
  const errors = [];

  const idSet = new Set();
  const textSet = new Set();
  for (const q of all) {
    if (idSet.has(q.id)) errors.push(`Duplicate id: ${q.id} (${q.question.slice(0, 60)})`);
    idSet.add(q.id);
    if (textSet.has(q.question)) errors.push(`Duplicate question text: ${q.question.slice(0, 80)}`);
    textSet.add(q.question);

    const options = [q.optionA, q.optionB, q.optionC, q.optionD];
    if (new Set(options).size < 4) errors.push(`Non-distinct options: ${q.question.slice(0, 60)}`);
    if (!["A", "B", "C", "D"].includes(q.correctAnswer)) errors.push(`Invalid correctAnswer: ${q.question.slice(0, 60)}`);
    if (!q.question || !q.explanation) errors.push(`Missing question/explanation: ${q.id}`);
    if (!q.discipline || !q.topic) errors.push(`Missing discipline/topic: ${q.id}`);
    if (!["Basic", "Intermediate", "Advanced"].includes(q.difficulty)) errors.push(`Invalid difficulty: ${q.id}`);
  }

  const countsByDiscipline = {};
  for (const q of all) countsByDiscipline[q.discipline] = (countsByDiscipline[q.discipline] || 0) + 1;

  for (const [discipline, expected] of Object.entries(EXPECTED_COUNTS)) {
    const actual = countsByDiscipline[discipline] || 0;
    if (actual !== expected) errors.push(`Discipline count mismatch: ${discipline} expected ${expected}, got ${actual}`);
  }

  if (all.length !== 5000) errors.push(`Total count mismatch: expected 5000, got ${all.length}`);

  if (errors.length) {
    console.error(`Seed generation FAILED with ${errors.length} error(s):`);
    for (const e of errors.slice(0, 30)) console.error(" - " + e);
    if (errors.length > 30) console.error(`  ...and ${errors.length - 30} more`);
    process.exit(1);
  }

  // Write output --------------------------------------------------------
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, "questions.json");
  fs.writeFileSync(outFile, JSON.stringify(all, null, 2));

  const summary = {
    generatedAt: nowIso(),
    total: all.length,
    byDiscipline: countsByDiscipline,
    byDifficulty: all.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {}),
    calculationBased: all.filter((q) => q.calculationBased).length,
    conceptual: all.filter((q) => !q.calculationBased).length,
  };
  fs.writeFileSync(path.join(OUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));

  console.log(`Generated ${all.length} questions -> ${outFile}`);
  console.log(JSON.stringify(summary.byDiscipline, null, 2));
  console.log(`Difficulty split:`, summary.byDifficulty);
  console.log(`Calculation-based: ${summary.calculationBased}, Conceptual: ${summary.conceptual}`);
}

main();
