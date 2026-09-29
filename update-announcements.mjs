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

async function update() {
  try {
    const dataStr = fs.readFileSync('d:/Projects/rayahen-admin-deploy/scratch/announcements.json', 'utf8');
    const announcements = JSON.parse(dataStr);
    
    // Update global document
    const globalRef = db.collection('menu_state').doc('global');
    const globalDoc = await globalRef.get();
    if (globalDoc.exists) {
      const globalData = globalDoc.data();
      globalData.announcements.data = announcements;
      globalData.announcements.updatedAt = new Date().toISOString();
      await globalRef.set(globalData);
      console.log('Updated global document');
    }
    
    // Update announcements document
    await db.collection('menu_state').doc('announcements').set({
      data: announcements,
      updatedAt: new Date().toISOString()
    });
    console.log('Updated announcements document');
    
  } catch (e) {
    console.error('Error during update:', e);
  }
}

update();
