import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config if needed
const firebaseConfig = {
  apiKey: "AIzaSyDmGrwYGu48L1_QoVRbksMdOknVIWXeHPQ",
  authDomain: "pmalmo-31282.firebaseapp.com",
  projectId: "pmalmo-31282",
  storageBucket: "pmalmo-31282.firebasestorage.app",
  messagingSenderId: "988979240425",
  appId: "1:988979240425:web:4538d553cd4ae7234dff78",
  measurementId: "G-P6VC4YG2PX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function signInAnon() {
  return signInAnonymously(auth);
}

export function watchAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}


