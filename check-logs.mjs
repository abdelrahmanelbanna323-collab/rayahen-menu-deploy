import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./service-account.json');

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function check() {
  const doc = await db.collection('menu_state').doc('settings').get();
  const data = doc.data();
  console.log(JSON.stringify(data.activityLogs?.slice(0, 10), null, 2));
  process.exit(0);
}
check();
