import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp, Timestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* Replace these values with your Firebase Web App config. */
export
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhSLHJBN2HiZYdxOqYhWTZQvPAAqjYKYg",
  authDomain: "chat-6cf72.firebaseapp.com",
  projectId: "chat-6cf72",
  storageBucket: "chat-6cf72.firebasestorage.app",
  messagingSenderId: "717213241027",
  appId: "1:717213241027:web:cbab2ee10b9e7082569c76",
  measurementId: "G-0FKJJC9ZX7"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  onAuthStateChanged, signOut, updateProfile, collection, doc, getDoc, setDoc,
  addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, onSnapshot,
  serverTimestamp, Timestamp
};
