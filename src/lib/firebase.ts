// Firebase initialization for the app
import { initializeApp, getApps, getApp } from "firebase/app";
// Avoid importing auth on the server if not needed to prevent init errors when env is missing
// Import type only; use dynamic getAuth in places that need it.
import type { Auth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Hardcoded Firebase config (no .env.local needed)
const firebaseConfig = {
  apiKey: "AIzaSyCbUNjBPEaZOtI_cNCcCJ1DBXUUdrP_6oE",
  authDomain: "order-yummy.firebaseapp.com",
  projectId: "order-yummy",
  storageBucket: "order-yummy.firebasestorage.app",
  messagingSenderId: "142798840175",
  appId: "1:142798840175:web:1091d97784312c1fe4089a",
  measurementId: "G-GQ7MEPZSSJ",
};

// Initialize app only once
// No need to check for missing keys, config is hardcoded

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Optionally fine-tune Firestore; ignore undefined fields to avoid runtime errors
// const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
const db = getFirestore(app);
// Don't initialize Auth here to avoid crashing when apiKey is invalid or missing.
// Export a lazy getter for auth if needed elsewhere.
let _auth: Auth | null = null;
const storage = getStorage(app);

// Enable offline persistence using IndexedDB on the client (not LocalStorage)
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch(() => {
    // This can fail in multi-tab; it's safe to ignore.
    console.warn(
      "Firestore persistence not enabled (multi-tab or unsupported)."
    );
  });

  // Defer analytics import to client only (optional). Only load if measurementId exists.
  if (firebaseConfig.measurementId) {
    import("firebase/analytics")
      .then(({ getAnalytics }) => {
        try {
          getAnalytics(app);
        } catch {
          /* no-op */
        }
      })
      .catch(() => {
        /* analytics optional */
      });
  }
}

export function getAuthClient(): Promise<Auth> {
  if (_auth) return Promise.resolve(_auth);
  // Load only on client; auth is browser-only for this app
  return import("firebase/auth").then(({ getAuth }) => {
    _auth = getAuth(app);
    return _auth;
  });
}

export { app, db, storage };
