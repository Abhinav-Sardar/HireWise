import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBpH9hUPH0YsCgzxhDqhRLYQXiwFFfNUPM",
  authDomain: "hire-wise-1c196.firebaseapp.com",
  projectId: "hire-wise-1c196",
  storageBucket: "hire-wise-1c196.firebasestorage.app",
  messagingSenderId: "322666571718",
  appId: "1:322666571718:web:4f514dec5ea8d97b40b4c7",
  measurementId: "G-FPQZ9BZFHB",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
