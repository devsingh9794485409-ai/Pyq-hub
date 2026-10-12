// backend/seed/seedAllSubjects.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import Subject from '../models/Subject.js';
import Resource from '../models/Resource.js';
import { getAllCatalogSubjects } from './curriculumData.js';

const run = async () => {
  console.log('🚀 Starting Safe Idempotent Subject Seeder...');
  await connectDB();

  const countBefore = await Subject.countDocuments();
  const catalogSubjects = getAllCatalogSubjects();

  console.log(`📋 Loaded ${catalogSubjects.length} subjects from curriculum catalog.`);
  console.log(`📊 Current subjects in database: ${countBefore}`);

  // Construct non-destructive bulkWrite upsert operations
  const bulkOps = catalogSubjects.map((sub) => ({
    updateOne: {
      filter: {
        branch: sub.branch,
        semester: sub.semester,
        code: sub.code,
      },
      update: {
        $set: {
          name: sub.name,
          branch: sub.branch,
          semester: sub.semester,
          code: sub.code,
        },
      },
      upsert: true,
    },
  }));

  const res = await Subject.bulkWrite(bulkOps, { ordered: false });

  const countAfter = await Subject.countDocuments();
  const resourcesCount = await Resource.countDocuments();

  // Branch breakdown
  const branchCounts = await Subject.aggregate([
    { $group: { _id: '$branch', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  console.log('\n========================================');
  console.log('🎉 Seeding Complete (Zero data deleted)!');
  console.log('========================================');
  console.log(`- Inserted (newly added) : ${res.upsertedCount}`);
  console.log(`- Matched / Preserved    : ${res.matchedCount}`);
  console.log(`- Modified               : ${res.modifiedCount}`);
  console.log(`- Total Subjects in DB   : ${countAfter} (was ${countBefore})`);
  console.log(`- Total Resources Safe   : ${resourcesCount} (integrity preserved)`);
  console.log('\n📚 Subjects by Branch:');
  branchCounts.forEach((b) => {
    console.log(`  • ${b._id.padEnd(6)}: ${b.count} subjects`);
  });
  console.log('========================================\n');

  await disconnectDB();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('❌ Seeder failed:', err);
  try {
    await disconnectDB();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
