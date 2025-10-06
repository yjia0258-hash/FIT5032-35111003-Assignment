// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTmx5BaKGK7x8A7GxCQWtbZlWq7J2YdkI",
  authDomain: "fit5032-assignmnet3.firebaseapp.com",
  projectId: "fit5032-assignmnet3",
  storageBucket: "fit5032-assignmnet3.firebasestorage.app",
  messagingSenderId: "12135724093",
  appId: "1:12135724093:web:8b013e2695bd4201b76654"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Export Firebase Auth instance
export const auth = getAuth(firebaseApp);
