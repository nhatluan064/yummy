// tools/setAdminClaim.js
// Helper script to set a custom claim `admin: true` for a given user UID.
// Usage: node tools/setAdminClaim.js <USER_UID>
// Requires a Firebase Admin SDK service account JSON available via GOOGLE_APPLICATION_CREDENTIALS

import admin from 'firebase-admin';

async function main() {
  const uid = process.argv[2];
  if (!uid) {
    console.error('Usage: node tools/setAdminClaim.js <USER_UID>');
    process.exit(1);
  }

  // Initialize with default credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully set admin claim for UID=${uid}`);
  } catch (err) {
    console.error('Error setting custom claim:', err);
    process.exit(1);
  }
}

main();
