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

  // The main image is in announcements[0].imageUrl
  const mainImage = announcements[0]?.imageUrl;
  
  if (!mainImage) {
    console.log('No main image found to copy!');
    process.exit(1);
  }

  let modified = false;

  // We want to add a standalone announcement for Sharm! 
  // Let's create a new one instead of using overrides.
  const sharmAnnouncement = {
    id: 'sharm-ann-' + Date.now(),
    isActive: true,
    titleAr: 'اهلا بكم فى رياحين شرم',
    titleEn: 'Welcome to Rayahen Sharm',
    contentAr: '.',
    contentEn: '.',
    badgeAr: '📣 إعلان ترحيبي',
    badgeEn: '📣 Welcome',
    imageUrl: mainImage,
    branchOverrides: {
      'sharm-delta': { isActive: true },
      'sharm-souq': { isActive: true },
      'sharm-nabq': { isActive: true },
      // disable it for alex branches
      'sidi-gaber': { isActive: false },
      'fawzy-moaz': { isActive: false },
      'san-stefano-cafe': { isActive: false },
      'raml-cafe': { isActive: false },
      'smoha': { isActive: false }
    }
  };

  // Add it to the list
  announcements.unshift(sharmAnnouncement);
  modified = true;

  if (modified) {
    await ref.update({ data: announcements, updatedAt: new Date().toISOString() });
    console.log('Sharm announcement added successfully to Firebase!');
  }
  process.exit(0);
}

fix();
