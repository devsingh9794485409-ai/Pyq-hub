// backend/config/firebase.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

/**
 * Initialize Firebase Admin SDK once using the service-account JSON
 * stored in FIREBASE_SERVICE_ACCOUNT env var (as a JSON string), OR
 * via individual credential env vars as a fallback.
 */
if (!getApps().length) {
  let credential;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Preferred: store the whole service-account JSON as a single env var
    try {
      credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    } catch {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT env var must be a valid JSON string. ' +
        'Download it from Firebase Console → Project Settings → Service Accounts.'
      );
    }
  } else {
    // Fallback: individual env vars
    credential = cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:   process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    });
  }

  initializeApp({ credential });
}

export const adminAuth = getAuth();
