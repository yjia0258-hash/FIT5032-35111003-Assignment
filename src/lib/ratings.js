// src/lib/ratings-local.js
// Demo only: localStorage-based rating store. One rating per user per item.

const RATINGS_KEY = 'demo_ratings_v1'
// Structure example:
// {
//   "item-1": { "userA@example.com": 4, "userB@example.com": 5 },
//   "item-2": { "userA@example.com": 2 }
// }

function loadAll() {
  try {
    const raw = localStorage.getItem(RATINGS_KEY)
    const obj = raw ? JSON.parse(raw) : {}
    return obj && typeof obj === 'object' ? obj : {}
  } catch {
    return {}
  }
}
function saveAll(map) {
  localStorage.setItem(RATINGS_KEY, JSON.stringify(map))
}

/** Get per-item user->score map */
export function getItemMap(itemId) {
  const all = loadAll()
  return all[itemId] || {}
}

/** Upsert rating for a user on an item (1..5) */
export function rateItem(itemId, userEmail, score) {
  if (!itemId || !userEmail) throw new Error('Missing itemId or userEmail')
  const s = Number(score)
  if (!Number.isFinite(s) || s < 1 || s > 5) throw new Error('Score must be 1..5')

  const all = loadAll()
  all[itemId] = all[itemId] || {}
  all[itemId][userEmail] = s
  saveAll(all)
  return getItemStats(itemId)
}

/** Get current user's rating on an item */
export function getUserRating(itemId, userEmail) {
  const map = getItemMap(itemId)
  return map[userEmail] || 0
}

/** Aggregate average and count */
export function getItemStats(itemId) {
  const map = getItemMap(itemId)
  const scores = Object.values(map).map(Number).filter(n => Number.isFinite(n))
  const count = scores.length
  const avg = count ? (scores.reduce((a, b) => a + b, 0) / count) : 0
  return { avg, count }
}

/** Clear all ratings (optional admin helper) */
export function clearAllRatings() {
  localStorage.removeItem(RATINGS_KEY)
}
