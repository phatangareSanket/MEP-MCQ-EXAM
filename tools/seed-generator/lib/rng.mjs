// Deterministic seeded PRNG (mulberry32) so the generator is idempotent:
// running it again produces byte-identical questions -> identical content-hash IDs.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStringToSeed(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
}

export function makeRng(seedStr) {
  return mulberry32(hashStringToSeed(seedStr));
}

export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randFloat(rng, min, max, decimals = 2) {
  const v = rng() * (max - min) + min;
  const f = Math.pow(10, decimals);
  return Math.round(v * f) / f;
}

export function shuffle(rng, arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Simple deterministic UUID (v5-like via hash, not cryptographically a real v5,
// but stable and unique enough as a primary key derived from content).
export function contentId(...parts) {
  const str = parts.join("||");
  let h1 = hashStringToSeed(str);
  let h2 = hashStringToSeed(str.split("").reverse().join(""));
  let h3 = hashStringToSeed(str + "salt1");
  let h4 = hashStringToSeed(str + "salt2");
  const hex = (n) => (n >>> 0).toString(16).padStart(8, "0");
  const a = hex(h1);
  const b = hex(h2).slice(0, 4);
  const c = "4" + hex(h3).slice(1, 4); // version nibble
  const d = ((parseInt(hex(h4).slice(0, 2), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0") + hex(h4).slice(2, 4);
  const e = hex(h1 ^ h2) + hex(h3 ^ h4).slice(0, 4);
  return `${a}-${b}-${c}-${d}-${e}`;
}
