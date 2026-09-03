// Thin Promise wrapper around IndexedDB. No external dependency.
"use strict";

const DB = (() => {
  const DB_NAME = "mep_exam_db";
  const DB_VERSION = 1;
  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (event) => {
        const db = req.result;

        if (!db.objectStoreNames.contains("questions")) {
          const s = db.createObjectStore("questions", { keyPath: "id" });
          s.createIndex("discipline", "discipline");
          s.createIndex("topic", "topic");
          s.createIndex("difficulty", "difficulty");
          s.createIndex("calculationBased", "calculationBased");
        }
        if (!db.objectStoreNames.contains("exams")) {
          const s = db.createObjectStore("exams", { keyPath: "id" });
          s.createIndex("startedAt", "startedAt");
          s.createIndex("completedAt", "completedAt");
        }
        if (!db.objectStoreNames.contains("examQuestions")) {
          const s = db.createObjectStore("examQuestions", { keyPath: "id" });
          s.createIndex("examId", "examId");
          s.createIndex("questionId", "questionId");
        }
        if (!db.objectStoreNames.contains("progress")) {
          db.createObjectStore("progress", { keyPath: "questionId" });
        }
        if (!db.objectStoreNames.contains("bookmarks")) {
          db.createObjectStore("bookmarks", { keyPath: "questionId" });
        }
        if (!db.objectStoreNames.contains("reports")) {
          const s = db.createObjectStore("reports", { keyPath: "id" });
          s.createIndex("status", "status");
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
        event.target.transaction.oncomplete = () => {};
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  function tx(storeNames, mode) {
    return open().then((db) => db.transaction(storeNames, mode));
  }

  function reqToPromise(req) {
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function getAll(storeName) {
    const t = await tx(storeName, "readonly");
    return reqToPromise(t.objectStore(storeName).getAll());
  }

  async function getAllByIndex(storeName, indexName, value) {
    const t = await tx(storeName, "readonly");
    const idx = t.objectStore(storeName).index(indexName);
    return reqToPromise(idx.getAll(value));
  }

  async function get(storeName, key) {
    const t = await tx(storeName, "readonly");
    return reqToPromise(t.objectStore(storeName).get(key));
  }

  async function put(storeName, value) {
    const t = await tx(storeName, "readwrite");
    const result = await reqToPromise(t.objectStore(storeName).put(value));
    return result;
  }

  async function bulkPut(storeName, values) {
    const t = await tx(storeName, "readwrite");
    const store = t.objectStore(storeName);
    for (const v of values) store.put(v);
    return new Promise((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  }

  async function remove(storeName, key) {
    const t = await tx(storeName, "readwrite");
    await reqToPromise(t.objectStore(storeName).delete(key));
  }

  async function bulkRemove(storeName, keys) {
    const t = await tx(storeName, "readwrite");
    const store = t.objectStore(storeName);
    for (const k of keys) store.delete(k);
    return new Promise((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  }

  async function count(storeName) {
    const t = await tx(storeName, "readonly");
    return reqToPromise(t.objectStore(storeName).count());
  }

  async function clear(storeName) {
    const t = await tx(storeName, "readwrite");
    await reqToPromise(t.objectStore(storeName).clear());
  }

  async function getMeta(key) {
    const row = await get("meta", key);
    return row ? row.value : undefined;
  }

  async function setMeta(key, value) {
    await put("meta", { key, value });
  }

  return { open, getAll, getAllByIndex, get, put, bulkPut, remove, bulkRemove, count, clear, getMeta, setMeta };
})();
