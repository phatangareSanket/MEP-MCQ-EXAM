// Loads the bundled SEED_QUESTIONS (data/seed-questions.js) into IndexedDB on
// first run only. Safe to call every load — it's a no-op once the questions
// store is populated.
"use strict";

const SeedLoader = (() => {
  const FAST_PATH_KEY = "mep_seed_loaded_v1";

  async function ensureSeeded(onProgress) {
    const already = await DB.getMeta("seededDefaultBank");
    const existingCount = await DB.count("questions");
    if (already && existingCount > 0) {
      localStorage.setItem(FAST_PATH_KEY, "1");
      return { seeded: false, count: existingCount };
    }

    if (typeof SEED_QUESTIONS === "undefined") {
      console.warn("SEED_QUESTIONS not found — data/seed-questions.js did not load.");
      return { seeded: false, count: existingCount };
    }

    const total = SEED_QUESTIONS.length;
    const CHUNK = 500;
    for (let i = 0; i < total; i += CHUNK) {
      const chunk = SEED_QUESTIONS.slice(i, i + CHUNK);
      await DB.bulkPut("questions", chunk);
      if (onProgress) onProgress(Math.min(i + CHUNK, total), total);
    }
    await DB.setMeta("seededDefaultBank", true);
    localStorage.setItem(FAST_PATH_KEY, "1");
    return { seeded: true, count: total };
  }

  // Synchronous fast-path check so app.js can decide whether it even needs to
  // fetch/parse the multi-MB data/seed-questions.js on this page load.
  function alreadySeededFastPath() {
    return localStorage.getItem(FAST_PATH_KEY) === "1";
  }

  return { ensureSeeded, alreadySeededFastPath };
})();
