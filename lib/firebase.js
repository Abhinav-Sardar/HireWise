// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBpH9hUPH0YsCgzxhDqhRLYQXiwFFfNUPM",
  authDomain: "hire-wise-1c196.firebaseapp.com",
  projectId: "hire-wise-1c196",
  storageBucket: "hire-wise-1c196.firebasestorage.app",
  messagingSenderId: "322666571718",
  appId: "1:322666571718:web:4f514dec5ea8d97b40b4c7",
  measurementId: "G-FPQZ9BZFHB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
