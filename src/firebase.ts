import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from environment variables
// In development: uses .env
// In production: uses .env.production (set during build)
const firebaseConfig = {
  apiKey: import.meta.env.FIREBASE_API_KEY,
  authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.FIREBASE_APP_ID,
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


