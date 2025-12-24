import admin from 'firebase-admin';
import { getApps, getApp, initializeApp, cert } from 'firebase-admin/app';

let serviceAccount: admin.ServiceAccount | undefined;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64) {
    serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('ascii')
    );
  }
} catch (error) {
  console.error('Error parsing Firebase service account key:', error);
}

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  if (!serviceAccount) {
    // This will happen in environments where the key is not set.
    // The app should handle this gracefully, e.g. by not calling functions that need it.
    // console.warn('Firebase admin initialization skipped: service account key is not available.');
    // To avoid crashes in environments like client-side or build-time where env var is not present,
    // we should not throw an error here but let the consumer handle it.
    // For this project, we assume server actions will always have the env var.
    throw new Error('Firebase service account key is not set or is invalid.');
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export { getFirebaseAdminApp };
