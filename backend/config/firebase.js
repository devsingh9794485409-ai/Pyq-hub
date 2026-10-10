// backend/config/firebase.js
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

/**
 * Initialize Firebase Admin SDK once using the service-account JSON
 * stored in FIREBASE_SERVICE_ACCOUNT env var (as a JSON string), OR
 * via individual credential env vars as a fallback.
 *
 * If credentials are not configured, initialization is safely skipped
 * so the backend can boot and serve email/password authentication.
 */
let authInstance = null;

if (!getApps().length) {
  let credential = null;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Preferred: store the whole service-account JSON as a single env var
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (serviceAccount && (serviceAccount.project_id || serviceAccount.projectId)) {
        credential = cert(serviceAccount);
      } else {
        console.warn('⚠️  FIREBASE_SERVICE_ACCOUNT is missing project_id.');
      }
    } catch {
      console.warn(
        '⚠️  FIREBASE_SERVICE_ACCOUNT env var is not a valid JSON string. ' +
        'Firebase Admin will remain disabled.'
      );
    }
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    // Fallback: individual env vars (only if all 3 are defined)
    try {
      credential = cert({
        projectId:    process.env.FIREBASE_PROJECT_ID,
        clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:   process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
    } catch (err) {
      console.warn('⚠️  Failed to construct Firebase credential from env vars:', err.message);
    }
  }

  if (credential) {
    try {
      initializeApp({ credential });
      authInstance = getAuth();
    } catch (err) {
      console.warn('⚠️  Firebase Admin initialization failed:', err.message);
    }
  } else {
    console.warn('ℹ️  Firebase Admin credentials not configured — Google authentication will be unavailable.');
  }
} else {
  authInstance = getAuth();
}

export const adminAuth = authInstance;
export const isFirebaseConfigured = Boolean(adminAuth);
