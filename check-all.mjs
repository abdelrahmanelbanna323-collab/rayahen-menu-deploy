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
  try {
    const colRef = db.collection('menu_state');
    const snap = await colRef.get();
    snap.forEach(doc => {
      const data = doc.data();
      let count = 0;
      if (data.data) {
        count = data.data.length;
      } else if (data.menuItems && data.menuItems.data) {
        count = data.menuItems.data.length;
      }
      console.log('Doc:', doc.id, '-> Items count:', count);
    });
  } catch (e) {
    console.error(e);
  }
}
check();
