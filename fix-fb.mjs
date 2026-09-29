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

async function fix() {
  const ref = db.collection('menu_state').doc('announcements');
  const doc = await ref.get();
  const announcements = doc.data().data;

  let modified = false;

  announcements.forEach((ann) => {
    if (ann.branchOverrides) {
      Object.keys(ann.branchOverrides).forEach((branch) => {
        const override = ann.branchOverrides[branch];
        if (override && override.imageUrl === '') {
          delete override.imageUrl; // Delete empty string so it falls back to main image
          modified = true;
          console.log(`Deleted empty imageUrl for branch: ${branch}`);
        }
      });
    }
  });

  if (modified) {
    await ref.update({ data: announcements, updatedAt: new Date().toISOString() });
    console.log('Firebase updated successfully!');
  } else {
    console.log('No empty imageUrls found in overrides. Nothing to update.');
  }
  process.exit(0);
}

fix();
