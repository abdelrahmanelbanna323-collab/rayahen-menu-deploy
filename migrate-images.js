/**
 * migrate-images.js (v2 - Fixed for actual Firestore structure)
 * 
 * Structure: rayahen_menu/{docId}.data = array of items
 * Docs: menuItems, categories, promotions, announcements
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');

// ─── Init ─────────────────────────────────────────────────────────────────────
const serviceAccountPath = path.join(__dirname, 'service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ service-account.json not found!');
  process.exit(1);
}

initializeApp({
  credential: cert(require('./service-account.json')),
  storageBucket: 'rayahen-menu.firebasestorage.app',
});

const db = getFirestore();
const bucket = getStorage().bucket();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: 20000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function uploadToFirebase(buffer, itemId, docName) {
  const destPath = `migrated/${docName}_${itemId}_${Date.now()}.jpg`;
  const file = bucket.file(destPath);
  await file.save(buffer, { metadata: { contentType: 'image/jpeg' }, public: true });
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${destPath}`;
}

// ─── Migration ────────────────────────────────────────────────────────────────

const DOCS = ['menuItems', 'categories', 'promotions', 'announcements'];

async function migrateDoc(docName) {
  const docRef = db.collection('rayahen_menu').doc(docName);
  const doc = await docRef.get();
  if (!doc.exists) { console.log(`  ⏭️  ${docName}: not found`); return; }
  
  const docData = doc.data();
  const items = docData.data;
  if (!Array.isArray(items) || items.length === 0) {
    console.log(`  ⏭️  ${docName}: empty array`);
    return;
  }

  let migrated = 0, skipped = 0, failed = 0;
  const updatedItems = [...items];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const url = item.imageUrl;
    
    if (!url || !url.includes('res.cloudinary.com')) {
      skipped++;
      continue;
    }

    const itemId = item.id || `item_${i}`;
    process.stdout.write(`  🔄 [${docName}] ${String(itemId).substring(0,20)}... `);
    
    try {
      const buffer = await downloadImage(url);
      const newUrl = await uploadToFirebase(buffer, itemId, docName);
      updatedItems[i] = { ...item, imageUrl: newUrl };
      console.log(`✅`);
      migrated++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failed++;
    }
  }

  // Save back only if something changed
  if (migrated > 0) {
    await docRef.update({ data: updatedItems });
    console.log(`  💾 Saved ${migrated} updated URLs to Firestore.`);
  }

  console.log(`  📊 ${docName}: migrated=${migrated}, skipped=${skipped}, failed=${failed}`);
  return { migrated, skipped, failed };
}

async function main() {
  console.log('🚀 Cloudinary → Firebase Storage Migration (v2)\n' + '='.repeat(50));
  let total = { migrated: 0, skipped: 0, failed: 0 };

  for (const docName of DOCS) {
    console.log(`\n📁 Processing: ${docName}`);
    const result = await migrateDoc(docName);
    if (result) {
      total.migrated += result.migrated;
      total.skipped += result.skipped;
      total.failed += result.failed;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 TOTAL: Migrated=${total.migrated} | Skipped=${total.skipped} | Failed=${total.failed}`);

  if (total.migrated > 0) {
    console.log('\n🎉 Done! Images migrated to Firebase Storage successfully.');
    console.log('   Your menu will now show images correctly.');
  } else if (total.failed > 0) {
    console.log('\n⚠️  All Cloudinary images are blocked (subscription expired).');
    console.log('   Please re-upload images manually from the Admin Dashboard.');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Fatal:', err.message);
  process.exit(1);
});
