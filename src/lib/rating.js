// src/lib/rating.js
// Demo only: localStorage-based rating store. One rating per user per item.
// Data shape in localStorage:
// {
//   "item-1": { "a@x.com": 4, "b@y.com": 5 },
//   "item-2": { "a@x.com": 3 },
//   ...
// }

const RATINGS_KEY = 'demo_ratings_v1';

/* ---------------- internal helpers ---------------- */
function loadAll() {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}
function saveAll(map) {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(map));
}

/* ---------------- per-item APIs (you already had these) ---------------- */

// Get map for a single item: { [userEmail]: score }
export function getItemMap(itemId) {
  const all = loadAll();
  return all[itemId] || {};
}

// Upsert rating for a user (1..5)
export function rateItem(itemId, userEmail, score) {
  if (!itemId || !userEmail) throw new Error('Missing itemId or userEmail');
  const s = Number(score);
  if (!Number.isFinite(s) || s < 1 || s > 5) throw new Error('Score must be 1..5');

  const all = loadAll();
  all[itemId] = all[itemId] || {};
  all[itemId][userEmail] = s;
  saveAll(all);
  return getItemStats(itemId);
}

// Get a user's rating for an item (0 if none)
export function getUserRating(itemId, userEmail) {
  const map = getItemMap(itemId);
  return map[userEmail] || 0;
}

// Aggregate stats for an item
export function getItemStats(itemId) {
  const map = getItemMap(itemId);
  const scores = Object.values(map).map(Number).filter(Number.isFinite);
  const count = scores.length;
  const avg = count ? scores.reduce((a, b) => a + b, 0) / count : 0;
  return { avg, count };
}

/* ---------------- admin/overview helpers (new) ---------------- */

// List the whole rating matrix: { [itemId]: { [email]: score } }
export function listAllRatings() {
  return loadAll();
}

// List all unique rater emails across all items
export function listRaterEmails() {
  const all = loadAll();
  const set = new Set();
  for (const itemId of Object.keys(all)) {
    const perItem = all[itemId] || {};
    for (const email of Object.keys(perItem)) set.add(email);
  }
  return Array.from(set);
}

// Global overall stats across ALL ratings (all items, all users)
export function getOverallStats() {
  const all = loadAll();
  let sum = 0;
  let count = 0;
  for (const itemId of Object.keys(all)) {
    const perItem = all[itemId] || {};
    for (const email of Object.keys(perItem)) {
      const v = Number(perItem[email]);
      if (Number.isFinite(v)) {
        sum += v;
        count += 1;
      }
    }
  }
  return { avg: count ? sum / count : 0, count };
}

/* ---------------- maintenance ---------------- */

// Remove all ratings
export function clearAllRatings() {
  localStorage.removeItem(RATINGS_KEY);
}
