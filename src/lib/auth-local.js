// src/lib/auth-local.js
// ⚠️ Demo only: front-end localStorage is NOT secure.
// Real apps must use a backend (DB + server-side validation + hashed passwords, etc.)

const USERS_KEY = 'demo_users';
const CURRENT_KEY = 'demo_current_user'; // stores the email of the currently logged-in user

/* ---------------- Utilities ---------------- */
function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

/* ---------------- Seed a default admin (for demo/grading) ---------------- */
(function seedAdmin() {
  const users = loadUsers();
  if (!users.find(u => u.email === 'admin@example.com')) {
    users.push({
      email: 'admin@example.com',
      password: 'Admin123!', // demo only (plaintext)
      role: 'admin',
      username: 'admin'
    });
    saveUsers(users);
  }
})();

/* ---------------- Public API ---------------- */

/**
 * Register a new user.
 * NOTE: For the demo we do NOT auto-login after registration.
 * Your UI should navigate to /login and ask the user to sign in.
 */
export function registerUser({ email, password, username, role = 'user' }) {
  const users = loadUsers();

  if (users.find(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  if (users.find(u => u.username === username)) {
    throw new Error('Username already exists');
  }

  // Demo only: password is stored in plaintext.
  users.push({ email, password, username, role });
  saveUsers(users);

  // DO NOT auto-login:
  // localStorage.setItem(CURRENT_KEY, email);

  // return a minimal user object (no password)
  return { email, username, role };
}

/**
 * Login with email & password.
 * Returns { email, username, role } on success.
 */
export function loginUser(email, password) {
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Invalid email or password');

  localStorage.setItem(CURRENT_KEY, email);
  return { email: user.email, username: user.username, role: user.role };
}

/** Logout current user */
export function logoutUser() {
  localStorage.removeItem(CURRENT_KEY);
}

/** Get current user { email, username, role } or null */
export function getCurrentUser() {
  try {
    const email = localStorage.getItem(CURRENT_KEY);
    if (!email) return null;
    const u = loadUsers().find(x => x.email === email);
    return u ? { email: u.email, username: u.username, role: u.role } : null;
  } catch {
    return null;
  }
}

/** Is someone logged in? */
export function isAuthenticated() {
  return !!getCurrentUser();
}

/** Does current user have the specified role? */
export function hasRole(role) {
  const u = getCurrentUser();
  return !!u && u.role === role;
}

/**
 * Safely list users for admin UI (no passwords).
 * Returns [{ email, username, role }, ...]
 */
export function listUsersSafe() {
  try {
    const arr = loadUsers();
    return Array.isArray(arr)
      ? arr.map(({ email, username, role }) => ({ email, username, role }))
      : [];
  } catch {
    return [];
  }
}

/**
 * Update a user's role (admin/user).
 * Used by Admin page. No-op if user not found.
 */
export function setUserRole(email, role) {
  const users = loadUsers();
  const u = users.find(x => x.email === email);
  if (u) {
    u.role = role;
    saveUsers(users);
  }
}
