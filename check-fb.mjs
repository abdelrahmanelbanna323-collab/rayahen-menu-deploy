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
  const doc = await db.collection('menu_state').doc('announcements').get();
  const data = doc.data().data;
  console.log('Main:', !!data[0].imageUrl);
  console.log('Sharm-Delta Override Type:', typeof data[0].branchOverrides['sharm-delta'].imageUrl);
  console.log('Sharm-Delta Override Value:', data[0].branchOverrides['sharm-delta'].imageUrl === '' ? 'EMPTY STRING' : (data[0].branchOverrides['sharm-delta'].imageUrl === undefined ? 'UNDEFINED' : 'EXISTS'));
  process.exit(0);
}
check();
