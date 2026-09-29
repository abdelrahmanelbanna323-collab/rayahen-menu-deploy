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
  const doc = await db.collection('menu_state').doc('menuItems').get();
  const data = doc.data().data;
  data.filter((d) => d.nameEn === 'Plain Croissant' || d.nameAr?.includes('كرواسون')).forEach((i) => {
    console.log(JSON.stringify({nameAr: i.nameAr, descAr: i.descriptionAr, nameIt: i.nameIt, descIt: i.descriptionIt, descEn: i.descriptionEn}, null, 2));
  });
  process.exit(0);
}
check();
