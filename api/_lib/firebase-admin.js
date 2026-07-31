import {
  cert,
  getApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { initializeFirestore } from 'firebase-admin/firestore';
import { requireEnv } from './env.js';

const FIREBASE_PROJECT_ID = 'impulsebuy-a64e2';
const FIREBASE_DATABASE_URL = 'https://impulsebuy-a64e2.firebaseio.com';
let firestoreInstance;

function formatPrivateKey(key) {
  if (!key) return key;

  if (key.includes('\n')) return key;

  if (key.includes('\\n')) {
    return key.replace(/\\n/g, '\n');
  }

  const match = key.match(/-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----/);
  if (match) {
    const base64 = match[1];
    const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
    return `-----BEGIN PRIVATE KEY-----\n${formatted}\n-----END PRIVATE KEY-----`;
  }

  return key;
}

function initializeFirebaseAdmin() {
  if (getApps().length > 0) return getApp();

  return initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
      privateKey: formatPrivateKey(requireEnv('FIREBASE_PRIVATE_KEY')),
    }),
    databaseURL: FIREBASE_DATABASE_URL,
  });
}

export function getFirebaseAdmin() {
  return initializeFirebaseAdmin();
}

export function getFirestore() {
  if (!firestoreInstance) {
    firestoreInstance = initializeFirestore(getFirebaseAdmin(), { preferRest: true });
  }
  return firestoreInstance;
}
