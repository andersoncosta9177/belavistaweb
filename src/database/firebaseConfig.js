import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBya0FA7W3FB3iMykhn-TSS_7Ub1N9ZSDY",
  authDomain: "condoplus-8fe5e.firebaseapp.com",
  databaseURL: "https://condoplus-8fe5e-default-rtdb.firebaseio.com",
  projectId: "condoplus-8fe5e",
  storageBucket: "condoplus-8fe5e.firebasestorage.app",
  messagingSenderId: "124748429391",
  appId: "1:124748429391:web:c32a423d27d5476954123a",
  measurementId: "G-PFKPG1935Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Initialize Firebase Auth with persistence
const auth = getAuth(app);
auth.setPersistence(browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

export { db, auth };