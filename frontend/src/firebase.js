// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Only initialize Firebase if a valid API key is provided
const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);

let app = null;
let auth = null;
let googleProvider = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  // Always prompt account picker so users can switch Google accounts
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} else {
  console.warn('Firebase is not configured. Google sign-in will be unavailable. Set VITE_FIREBASE_* env variables to enable it.');
}

export { auth, googleProvider, isFirebaseConfigured };
export default app;
