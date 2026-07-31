import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const firebaseHelper = await readFile(
  new URL('../api/_lib/firebase-admin.js', import.meta.url),
  'utf8'
);
const webhook = await readFile(
  new URL('../api/blog-webhook.js', import.meta.url),
  'utf8'
);
const packageConfig = JSON.parse(await readFile(
  new URL('../package.json', import.meta.url),
  'utf8'
));

test('Firebase Admin integration uses the modular SDK surface', () => {
  assert.match(firebaseHelper, /from 'firebase-admin\/app'/);
  assert.match(firebaseHelper, /from 'firebase-admin\/firestore'/);
  assert.match(firebaseHelper, /getApps\(\)/);
  assert.match(firebaseHelper, /initializeFirestore\(getFirebaseAdmin\(\), \{ preferRest: true \}\)/);
  assert.doesNotMatch(firebaseHelper, /admin\.apps|admin\.firestore|admin\.credential/);

  assert.match(webhook, /import \{ Timestamp \} from 'firebase-admin\/firestore'/);
  assert.doesNotMatch(webhook, /firebaseAdmin\.firestore/);
});

test('server renderer pins the Vercel-compatible sanitizer release', () => {
  assert.equal(packageConfig.dependencies['sanitize-html'], '2.17.5');
});
