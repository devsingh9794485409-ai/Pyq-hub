// backend/scripts/repairResources.js
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Resource from '../models/Resource.js';
import cloudinary from '../config/cloudinary.js';
import { extractPublicId } from '../controllers/resourceController.js';

const run = async () => {
  const isDryRun = process.argv.includes('--dry-run');
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pyqhub';

  console.log(`\n🔍 PyQHub Resource Repair & Verification Tool`);
  console.log(`===============================================`);
  console.log(`Mode: ${isDryRun ? 'DRY RUN (no DB writes)' : 'LIVE (updates DB if needed)'}`);
  console.log(`Connecting to MongoDB...`);

  await mongoose.connect(uri);
  console.log(` Connected to MongoDB.\n`);

  const resources = await Resource.find({}).select('+filePublicId');
  console.log(`Found ${resources.length} total resource records in database.\n`);

  let repairedCount = 0;
  let verifiedCount = 0;
  let errorCount = 0;

  for (const doc of resources) {
    console.log(`───────────────────────────────────────────────`);
    console.log(`Resource ID:   ${doc._id}`);
    console.log(`Title:         "${doc.title}"`);
    console.log(`Type:          ${doc.type}`);
    console.log(`fileUrl:       ${doc.fileUrl}`);
    console.log(`filePublicId:  ${doc.filePublicId || '(missing)'}`);

    let needsSave = false;

    // 1. Repair missing public_id
    if (!doc.filePublicId && doc.fileUrl) {
      const extracted = extractPublicId(doc.fileUrl);
      if (extracted) {
        console.log(`  🔧 Repaired filePublicId -> "${extracted}" (extracted from fileUrl)`);
        doc.filePublicId = extracted;
        needsSave = true;
      } else {
        console.warn(`  ⚠️ Could not extract public_id from fileUrl: ${doc.fileUrl}`);
      }
    }

    // 2. Repair missing format
    if (!doc.fileFormat && doc.fileUrl) {
      const extMatch = doc.fileUrl.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
      if (extMatch) {
        doc.fileFormat = extMatch[1].toLowerCase();
        console.log(`  🔧 Repaired fileFormat -> "${doc.fileFormat}"`);
        needsSave = true;
      }
    }

    // 3. Repair missing resourceType
    if (!doc.fileResourceType) {
      const isDoc = doc.fileFormat === 'doc' || doc.fileFormat === 'docx';
      doc.fileResourceType = isDoc ? 'raw' : 'image';
      console.log(`  🔧 Repaired fileResourceType -> "${doc.fileResourceType}"`);
      needsSave = true;
    }

    if (needsSave) {
      repairedCount++;
      if (!isDryRun) {
        await doc.save();
        console.log(`  💾 Saved changes to MongoDB document.`);
      }
    }

    // 4. Test Cloudinary accessibility using signed delivery URL
    if (doc.filePublicId) {
      try {
        const signedUrl = cloudinary.utils.private_download_url(
          doc.filePublicId,
          doc.fileFormat || 'pdf',
          {
            resource_type: doc.fileResourceType || 'image',
            type: 'upload',
            expires_at: Math.floor(Date.now() / 1000) + 300,
          }
        );

        const testRes = await fetch(signedUrl, { method: 'HEAD' });
        if (testRes.ok || testRes.status === 200) {
          console.log(`  ✅ Cloudinary verification PASSED (HTTP ${testRes.status}, Content-Type: ${testRes.headers.get('content-type')})`);
          verifiedCount++;
        } else {
          console.warn(`  ⚠️ Cloudinary verification status HTTP ${testRes.status}`);
          errorCount++;
        }
      } catch (cloudErr) {
        console.error(`  ❌ Cloudinary verification error: ${cloudErr.message}`);
        errorCount++;
      }
    } else {
      console.warn(`  ⚠️ Skipped Cloudinary verification (no public_id)`);
      errorCount++;
    }
  }

  console.log(`\n===============================================`);
  console.log(`Summary:`);
  console.log(`  Total inspected: ${resources.length}`);
  console.log(`  Repaired:        ${repairedCount}`);
  console.log(`  Verified active: ${verifiedCount}`);
  console.log(`  Issues/Warnings: ${errorCount}`);
  console.log(`===============================================\n`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Fatal error running repairResources:', err);
  process.exit(1);
});
