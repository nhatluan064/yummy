// Firebase initialization for the app
import { initializeApp, getApps, getApp } from 'firebase/app';
// Avoid importing auth on the server if not needed to prevent init errors when env is missing
// Import type only; use dynamic getAuth in places that need it.
import type { Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Read config from environment variables for flexibility between envs
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize app only once
// If required keys are missing, log a warning in dev to avoid confusing crashes
const requiredMap: Record<string, unknown> = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
};
const missingKeys = Object.entries(requiredMap)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missingKeys.length && typeof window !== 'undefined') {
  console.warn(
    `Firebase config missing: ${missingKeys.join(', ')}. ` +
      'Please configure .env.local and restart the dev server.'
  );
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Optionally fine-tune Firestore; ignore undefined fields to avoid runtime errors
// const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
const db = getFirestore(app);
// Don't initialize Auth here to avoid crashing when apiKey is invalid or missing.
// Export a lazy getter for auth if needed elsewhere.
let _auth: Auth | null = null;
const storage = getStorage(app);

// Enable offline persistence using IndexedDB on the client (not LocalStorage)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch(() => {
    // This can fail in multi-tab; it's safe to ignore.
    console.warn('Firestore persistence not enabled (multi-tab or unsupported).');
  });

  // Defer analytics import to client only (optional). Only load if measurementId exists.
  if (firebaseConfig.measurementId) {
    import('firebase/analytics')
      .then(({ getAnalytics }) => {
        try { getAnalytics(app); } catch { /* no-op */ }
      })
      .catch(() => { /* analytics optional */ });
  }
}

export function getAuthClient(): Promise<Auth> {
  if (_auth) return Promise.resolve(_auth);
  // Load only on client; auth is browser-only for this app
  return import('firebase/auth').then(({ getAuth }) => {
    _auth = getAuth(app);
    return _auth;
  });
}

export { app, db, storage };
