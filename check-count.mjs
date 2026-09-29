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
  console.log('Total:', data.length);
  data.forEach((a, i) => console.log(i+1 + ':', a.titleAr));
  process.exit(0);
}
check();
