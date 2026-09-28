import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import * as fs from 'fs';

const require = createRequire(import.meta.url);
const serviceAccount = require('./service-account.json');

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function restore() {
  try {
    const backupStr = fs.readFileSync('d:/Projects/rayahen-admin-deploy/scratch/final_state.json', 'utf8');
    const backup = JSON.parse(backupStr);
    const state = backup.data;
    
    const updatedAt = new Date().toISOString();
    
    const sanitize = (obj) => {
        if (Array.isArray(obj)) return obj.map(sanitize);
        if (obj !== null && typeof obj === 'object') {
            const res = {};
            for (const [k, v] of Object.entries(obj)) {
                if (v !== undefined) res[k] = sanitize(v);
            }
            return res;
        }
        return obj;
    };

    const categoriesPayload = sanitize({ data: state.categories, updatedAt });
    const menuItemsPayload = sanitize({ data: state.menuItems, updatedAt });
    const promotionsPayload = sanitize({ data: state.promotions, updatedAt });
    const announcementsPayload = sanitize({ data: state.announcements, updatedAt });
    const settingsPayload = sanitize({
      adminUsers: state.adminUsers || [],
      ratingUrl: state.ratingUrl || '',
      vatSettings: state.vatSettings || {},
      updatedAt
    });

    const stateData = {
      categories: categoriesPayload,
      menuItems: menuItemsPayload,
      promotions: promotionsPayload,
      announcements: announcementsPayload,
      settings: settingsPayload,
    };

    const batch = db.batch();
    
    batch.set(db.collection('menu_state').doc('menuItems'), { data: menuItemsPayload.data, updatedAt });
    batch.set(db.collection('menu_state').doc('categories'), { data: categoriesPayload.data, updatedAt });
    batch.set(db.collection('menu_state').doc('promotions'), { data: promotionsPayload.data, updatedAt });
    batch.set(db.collection('menu_state').doc('announcements'), { data: announcementsPayload.data, updatedAt });
    batch.set(db.collection('menu_state').doc('settings'), settingsPayload);
    batch.set(db.collection('menu_state').doc('global'), stateData);

    await batch.commit();
    console.log('Successfully restored 313 items to Firestore!');
  } catch (e) {
    console.error('Error during restore:', e);
  }
}

restore();
