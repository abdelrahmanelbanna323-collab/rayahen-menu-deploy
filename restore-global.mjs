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

    await db.collection('menu_state').doc('global').set(stateData);
    console.log('Successfully forced global doc to 313 items!');
  } catch (e) {
    console.error('Error during restore:', e);
  }
}

restore();
