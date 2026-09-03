// Minimal RFC4180-ish CSV parser/stringifier — no external dependency.
"use strict";

const CSV = (() => {
  function parse(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    let i = 0;
    const len = text.length;

    function pushField() {
      row.push(field);
      field = "";
    }
    function pushRow() {
      pushField();
      rows.push(row);
      row = [];
    }

    while (i < len) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i += 2;
            continue;
          }
          inQuotes = false;
          i++;
          continue;
        }
        field += c;
        i++;
        continue;
      }
      if (c === '"') {
        inQuotes = true;
        i++;
        continue;
      }
      if (c === ",") {
        pushField();
        i++;
        continue;
      }
      if (c === "\r") {
        i++;
        continue;
      }
      if (c === "\n") {
        pushRow();
        i++;
        continue;
      }
      field += c;
      i++;
    }
    // last field/row (if the file doesn't end with a newline)
    if (field.length > 0 || row.length > 0) pushRow();

    // drop fully-empty trailing rows
    while (rows.length && rows[rows.length - 1].every((f) => f === "")) rows.pop();
    if (rows.length === 0) return [];

    const headers = rows[0].map((h) => h.trim());
    return rows.slice(1).map((r) => {
      const obj = {};
      headers.forEach((h, idx) => (obj[h] = r[idx] !== undefined ? r[idx] : ""));
      return obj;
    });
  }

  function needsQuoting(value) {
    return /[",\n\r]/.test(value);
  }

  function escapeField(value) {
    const s = value === null || value === undefined ? "" : String(value);
    if (needsQuoting(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function stringify(rows, columns) {
    const lines = [columns.join(",")];
    for (const row of rows) {
      lines.push(columns.map((c) => escapeField(row[c])).join(","));
    }
    return lines.join("\r\n");
  }

  return { parse, stringify };
})();
