// src/lib/auth-local.js
// Very simple local "auth" functions (for demo use only)

const USERS_KEY = 'demo_users'
const CURRENT_KEY = 'demo_current_user'

function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  return raw ? JSON.parse(raw) : []
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// Register a new user
export function registerUser({ email, password }) {
  const users = loadUsers()
  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists')
  }
  users.push({ email, password }) // ⚠️ demo only, no hashing
  saveUsers(users)
  localStorage.setItem(CURRENT_KEY, email)
  return { email }
}

// Login with email + password
export function loginUser(email, password) {
  const users = loadUsers()
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid email or password')
  localStorage.setItem(CURRENT_KEY, email)
  return { email }
}

// Get currently logged in user
export function getCurrentUser() {
  return localStorage.getItem(CURRENT_KEY)
}

// Logout
export function logoutUser() {
  localStorage.removeItem(CURRENT_KEY)
}
