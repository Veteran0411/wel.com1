// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDdRPFBmy3Ow3MvOYvwPAghD8RyCU4nYg",
  authDomain: "welcom-1.firebaseapp.com",
  projectId: "welcom-1",
  storageBucket: "welcom-1.firebasestorage.app",
  messagingSenderId: "156902584548",
  appId: "1:156902584548:web:026c3cad48a5753b88fcf1",
  measurementId: "G-GJPSWZ42PS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };