// src/lib/auth-local.js
// ⚠️ Demo only: For coursework purposes. Local storage is NOT secure; real applications must verify on the backend.

const USERS_KEY = 'demo_users'
const CURRENT_KEY = 'demo_current_user' // Stores the email of the currently logged-in user

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch { return [] }
}
function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list))
}

// Optional: seed a default admin account for demonstration/grading
(function seedAdmin() {
  const users = loadUsers()
  if (!users.find(u => u.email === 'admin@example.com')) {
    users.push({ email: 'admin@example.com', password: 'Admin123!', role: 'admin', username: 'admin' })
    saveUsers(users)
  }
})()

export function registerUser({ email, password, username, role = 'user' }) {
  const users = loadUsers()
  if (users.find(u => u.email === email)) throw new Error('Email already exists')
  if (users.find(u => u.username === username)) throw new Error('Username already exists')
  users.push({ email, password, username, role })   // Simplified: plain text password, demo only
  saveUsers(users)
  localStorage.setItem(CURRENT_KEY, email)          // Automatically log in after registration
  return getCurrentUser()
}

export function loginUser(email, password) {
  const users = loadUsers()
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid email or password')
  localStorage.setItem(CURRENT_KEY, email)
  return { email: user.email, username: user.username, role: user.role }
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_KEY)
}

export function getCurrentUser() {
  try {
    const email = localStorage.getItem(CURRENT_KEY)
    if (!email) return null
    const u = loadUsers().find(x => x.email === email)
    return u ? { email: u.email, username: u.username, role: u.role } : null
  } catch { return null }
}

export function isAuthenticated() {
  return !!getCurrentUser()
}

export function hasRole(role) {
  const u = getCurrentUser()
  return !!u && u.role === role
}

// Demo only: manually change a user’s role (e.g., from the browser console)
export function _setUserRole(email, role) {
  const users = loadUsers()
  const u = users.find(x => x.email === email)
  if (u) { u.role = role; saveUsers(users) }
}
