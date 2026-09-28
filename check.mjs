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
    const docRef = db.collection('menu_state').doc('menuItems');
    const snap = await docRef.get();
    if (snap.exists) {
      const data = snap.data();
      console.log('Items in menuItems doc:', data.data ? data.data.length : 0);
    } else {
      console.log('menuItems doc not found');
    }

    const globalRef = db.collection('menu_state').doc('global');
    const globalSnap = await globalRef.get();
    if (globalSnap.exists) {
      const gData = globalSnap.data();
      console.log('Items in global doc:', gData.menuItems?.data ? gData.menuItems.data.length : 0);
    } else {
      console.log('global doc not found');
    }
  } catch (e) {
    console.error(e);
  }
}
check();
