// src/lib/firebase.js
import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

// Production config 
const firebaseConfig = {
  apiKey: 'AIzaSyDTmx5BaKGK7x8A7GxCQWtbZlWq7J2YdkI',
  authDomain: 'fit5032-assignmnet3.firebaseapp.com',
  projectId: 'fit5032-assignmnet3',
  storageBucket: 'fit5032-assignmnet3.firebasestorage.app',
  messagingSenderId: '12135724093',
  appId: '1:12135724093:web:8b013e2695bd4201b76654'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Connect to Auth Emulator only in local development (port 9099)
if (typeof window !== 'undefined') {
  var host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') {
    try {
      // Third parameter can be { disableWarnings: true } if you want to silence warnings
      connectAuthEmulator(auth, 'http://127.0.0.1:9099')
      // console.log('Auth Emulator connected: http://127.0.0.1:9099')
    } catch (e) {
      // Hot-reload may try to connect multiple times; safe to ignore
      // console.warn('Auth Emulator connect warning:', e && e.message)
    }
  }
}
