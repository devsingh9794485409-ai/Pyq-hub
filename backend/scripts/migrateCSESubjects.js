// backend/scripts/migrateCSESubjects.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import Subject from '../models/Subject.js';
import Resource from '../models/Resource.js';

// Complete target CSE curriculum for Semesters 1 to 6 (51 subjects)
export const TARGET_CSE_SUBJECTS_1_TO_6 = {
  1: [
    { code: 'BAS101', name: 'Engineering Physics' },
    { code: 'BAS103', name: 'Engineering Mathematics-I' },
    { code: 'BEC101', name: 'Fundamentals of Electronics Engineering' },
    { code: 'BME101', name: 'Fundamentals of Mechanical Engineering' },
    { code: 'BAS105', name: 'Soft Skills' },
    { code: 'BAS151', name: 'Engineering Physics Lab' },
    { code: 'BEC151', name: 'Basic Electronics Engineering Lab' },
    { code: 'BAS155', name: 'English Language Lab' },
    { code: 'BWS151', name: 'Workshop Practice Lab' },
  ],
  2: [
    { code: 'BAS202', name: 'Engineering Chemistry' },
    { code: 'BAS203', name: 'Engineering Mathematics-II' },
    { code: 'BEE201', name: 'Fundamentals of Electrical Engineering' },
    { code: 'BCS201', name: 'Programming for Problem Solving' },
    { code: 'BAS204', name: 'Environment and Ecology' },
    { code: 'BAS252', name: 'Engineering Chemistry Lab' },
    { code: 'BEE251', name: 'Basic Electrical Engineering Lab' },
    { code: 'BCS251', name: 'Programming for Problem Solving Lab' },
    { code: 'BCS252', name: 'Engineering Graphics & Design Lab' },
    { code: 'BVA251', name: 'Sports and Yoga' },
  ],
  3: [
    { code: 'BOE303', name: 'Material Science' },
    { code: 'BAS301', name: 'Technical Communication' },
    { code: 'BCS301', name: 'Data Structure' },
    { code: 'BCS302', name: 'Computer Organization and Architecture' },
    { code: 'BCS303', name: 'Discrete Structures & Theory of Logic' },
    { code: 'BCC301', name: 'Cyber Security' },
    { code: 'BCS351', name: 'Data Structure Lab' },
    { code: 'BCS352', name: 'Computer Organization and Architecture Lab' },
    { code: 'BCS353', name: 'Web Designing Workshop' },
    { code: 'BCC351', name: 'Internship Assessment / Mini Project' },
  ],
  4: [
    { code: 'BAS403', name: 'Mathematics-IV' },
    { code: 'BVE401', name: 'Universal Human Values and Professional Ethics' },
    { code: 'BCS401', name: 'Operating System' },
    { code: 'BCS402', name: 'Theory of Automata and Formal Languages' },
    { code: 'BCS403', name: 'Object Oriented Programming with Java' },
    { code: 'BCC402', name: 'Python Programming' }, // Verified code (replaces duplicate BCS402)
    { code: 'BCS451', name: 'Operating System Lab' },
    { code: 'BCS452', name: 'Object Oriented Programming with Java Lab' },
    { code: 'BCS453', name: 'Cyber Security Workshop' },
    { code: 'BVA451', name: 'Sports and Yoga - II' },
  ],
  5: [
    { code: 'BCS501', name: 'Web Technology' },
    { code: 'BCS502', name: 'Design and Analysis of Algorithms (DAA)' },
    { code: 'BCS503', name: 'Object-Oriented System Design with C++ (OOSD)' },
    { code: 'BCS504', name: 'Application of Soft Computing (ASC)' },
    { code: 'BCS505', name: 'Database Management Systems (DBMS)' },
    { code: 'BVE501', name: 'Constitution of India (COI)' },
  ],
  6: [
    { code: 'BCS601', name: 'Compiler Design (CD)' },
    { code: 'BCS602', name: 'Computer Networks (CNW)' },
    { code: 'BVE601', name: 'Essence of Traditional Knowledge (EITK)' },
    { code: 'BCS603', name: 'Blockchain Architecture and Design (BCAD)' },
    { code: 'BCS604', name: 'Software Engineering (SE)' },
    { code: 'BVE602', name: 'Idea to Business Model (IBM)' },
  ],
};

// Explicit semantic mapping from existing 31 CSE subject IDs to the new subjects
// This ensures subject IDs are 100% preserved and existing resources stay perfectly connected.
const SEMANTIC_ID_MAP = {
  // Existing subjects with uploaded resources:
  '6abc44f7d98e3b59e457c136': { semester: 5, code: 'BCS502', name: 'Design and Analysis of Algorithms (DAA)' },
  '6abc44f7d98e3b59e457c138': { semester: 5, code: 'BCS505', name: 'Database Management Systems (DBMS)' },
  '6abc44f7d98e3b59e457c13b': { semester: 6, code: 'BCS602', name: 'Computer Networks (CNW)' },
  '6abc44f7d98e3b59e457c13c': { semester: 5, code: 'BCS501', name: 'Web Technology' },

  // Semester 1 mappings:
  '6abc44f7d98e3b59e457c125': { semester: 1, code: 'BAS101', name: 'Engineering Physics' },
  '6abc44f7d98e3b59e457c126': { semester: 1, code: 'BAS103', name: 'Engineering Mathematics-I' },
  '6abc44f7d98e3b59e457c127': { semester: 2, code: 'BEE201', name: 'Fundamentals of Electrical Engineering' },
  '6abc44f7d98e3b59e457c128': { semester: 2, code: 'BCS201', name: 'Programming for Problem Solving' },
  '6abc44f7d98e3b59e457c129': { semester: 2, code: 'BCS252', name: 'Engineering Graphics & Design Lab' },
  '6abc44f7d98e3b59e457c12a': { semester: 1, code: 'BAS105', name: 'Soft Skills' },

  // Semester 2 mappings:
  '6abc44f7d98e3b59e457c12b': { semester: 2, code: 'BAS202', name: 'Engineering Chemistry' },
  '6abc44f7d98e3b59e457c12c': { semester: 2, code: 'BAS203', name: 'Engineering Mathematics-II' },
  '6abc44f7d98e3b59e457c12d': { semester: 1, code: 'BME101', name: 'Fundamentals of Mechanical Engineering' },
  '6abc44f7d98e3b59e457c12e': { semester: 4, code: 'BCC402', name: 'Python Programming' },
  '6abc44f7d98e3b59e457c12f': { semester: 2, code: 'BAS204', name: 'Environment and Ecology' },

  // Semester 3 mappings:
  '6abc44f7d98e3b59e457c130': { semester: 3, code: 'BCS301', name: 'Data Structure' },
  '6abc44f7d98e3b59e457c131': { semester: 3, code: 'BCS303', name: 'Discrete Structures & Theory of Logic' },
  '6abc44f7d98e3b59e457c132': { semester: 3, code: 'BCS302', name: 'Computer Organization and Architecture' },
  '6abc44f7d98e3b59e457c133': { semester: 4, code: 'BCS403', name: 'Object Oriented Programming with Java' },
  '6abc44f7d98e3b59e457c134': { semester: 3, code: 'BAS301', name: 'Technical Communication' },

  // Semester 4 mappings:
  '6abc44f7d98e3b59e457c135': { semester: 4, code: 'BCS401', name: 'Operating System' },
  '6abc44f7d98e3b59e457c137': { semester: 4, code: 'BCS402', name: 'Theory of Automata and Formal Languages' },
  '6abc44f7d98e3b59e457c139': { semester: 3, code: 'BOE303', name: 'Material Science' },

  // Semester 5 mappings:
  '6abc44f7d98e3b59e457c13a': { semester: 6, code: 'BCS601', name: 'Compiler Design (CD)' },
  '6abc44f7d98e3b59e457c13d': { semester: 6, code: 'BCS604', name: 'Software Engineering (SE)' },
  '6abc44f7d98e3b59e457c13e': { semester: 5, code: 'BCS503', name: 'Object-Oriented System Design with C++ (OOSD)' },

  // Semester 6 mappings:
  '6abc44f7d98e3b59e457c13f': { semester: 5, code: 'BCS504', name: 'Application of Soft Computing (ASC)' },
  '6abc44f7d98e3b59e457c140': { semester: 6, code: 'BCS603', name: 'Blockchain Architecture and Design (BCAD)' },
  '6abc44f7d98e3b59e457c141': { semester: 5, code: 'BVE501', name: 'Constitution of India (COI)' },
  '6abc44f7d98e3b59e457c142': { semester: 6, code: 'BVE601', name: 'Essence of Traditional Knowledge (EITK)' },
  '6abc44f7d98e3b59e457c143': { semester: 6, code: 'BVE602', name: 'Idea to Business Model (IBM)' },
};

async function migrate() {
  console.log('🔄 Connecting to database for CSE migration...');
  await connectDB();

  // 1. Snapshot Before State
  const totalBefore = await Subject.countDocuments();
  const cseBefore = await Subject.countDocuments({ branch: 'CSE' });
  const nonCseBranchCountsBefore = await Subject.aggregate([
    { $match: { branch: { $ne: 'CSE' } } },
    { $group: { _id: '$branch', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const resourcesBefore = await Resource.countDocuments();

  console.log('📊 Pre-migration stats:');
  console.log(`- Total subjects in DB: ${totalBefore}`);
  console.log(`- CSE subjects in DB: ${cseBefore}`);
  console.log(`- Total resources in DB: ${resourcesBefore}`);
  console.log('- Non-CSE branch counts:', nonCseBranchCountsBefore.map((b) => `${b._id}: ${b.count}`).join(', '));

  // Build target flattened list of 51 subjects
  const targetList = [];
  for (const [semStr, subjects] of Object.entries(TARGET_CSE_SUBJECTS_1_TO_6)) {
    const sem = Number(semStr);
    for (const sub of subjects) {
      targetList.push({
        branch: 'CSE',
        semester: sem,
        code: sub.code.toUpperCase().trim(),
        name: sub.name.trim(),
      });
    }
  }

  console.log(`\n🎯 Target CSE subjects for Sem 1-6: ${targetList.length} items`);

  // Step 2: Update the 31 existing CSE subjects using their specific IDs
  console.log('\n📝 Step 1: Updating 31 existing CSE subjects in-place...');
  const updatedCodes = new Set();
  for (const [idStr, target] of Object.entries(SEMANTIC_ID_MAP)) {
    const doc = await Subject.findOne({ _id: idStr, branch: 'CSE' });
    if (!doc) {
      throw new Error(`Expected CSE subject with ID ${idStr} not found!`);
    }
    const oldCode = doc.code;
    const oldName = doc.name;
    const oldSem = doc.semester;

    doc.semester = target.semester;
    doc.code = target.code;
    doc.name = target.name;
    await doc.save();

    updatedCodes.add(`${target.semester}_${target.code}`);
    console.log(`  ✓ Updated [${doc._id}]: (${oldSem} ${oldCode} "${oldName}") -> (Sem ${target.semester} ${target.code} "${target.name}")`);
  }

  // Step 3: Insert only missing CSE subjects (the remaining 20 subjects)
  console.log('\n➕ Step 2: Inserting remaining missing CSE subjects...');
  let insertedCount = 0;
  for (const item of targetList) {
    const key = `${item.semester}_${item.code}`;
    if (!updatedCodes.has(key)) {
      // Check if already exists just in case
      const existing = await Subject.findOne({ branch: 'CSE', semester: item.semester, code: item.code });
      if (!existing) {
        await Subject.create(item);
        console.log(`  + Inserted: Sem ${item.semester} [${item.code}] ${item.name}`);
        insertedCount++;
      } else {
        console.log(`  = Already exists: Sem ${item.semester} [${item.code}] ${item.name}`);
      }
    }
  }
  console.log(`  Total newly inserted CSE subjects: ${insertedCount}`);

  // Step 4: Verification and Validation
  console.log('\n🔍 Step 3: Verifying database state post-migration...');

  const totalAfter = await Subject.countDocuments();
  const cseAfter = await Subject.countDocuments({ branch: 'CSE' });
  const nonCseBranchCountsAfter = await Subject.aggregate([
    { $match: { branch: { $ne: 'CSE' } } },
    { $group: { _id: '$branch', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const resourcesAfter = await Resource.countDocuments();

  // Validate non-CSE branches remain completely untouched
  const beforeMap = Object.fromEntries(nonCseBranchCountsBefore.map((b) => [b._id, b.count]));
  const afterMap = Object.fromEntries(nonCseBranchCountsAfter.map((b) => [b._id, b.count]));
  for (const [branch, count] of Object.entries(beforeMap)) {
    if (afterMap[branch] !== count) {
      throw new Error(`CRITICAL ERROR: Non-CSE branch ${branch} changed from ${count} to ${afterMap[branch]}!`);
    }
  }
  console.log('  ✅ Non-CSE branch counts are 100% UNCHANGED and intact.');

  // Validate CSE count per semester
  const cseSemCounts = await Subject.aggregate([
    { $match: { branch: 'CSE' } },
    { $group: { _id: '$semester', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const cseSemMap = Object.fromEntries(cseSemCounts.map((s) => [s._id, s.count]));

  console.log('\n📊 CSE Subject Counts by Semester:');
  const expectedCounts = { 1: 9, 2: 10, 3: 10, 4: 10, 5: 6, 6: 6, 7: 4, 8: 3 };
  let allCountsMatch = true;
  for (let s = 1; s <= 8; s++) {
    const actual = cseSemMap[s] || 0;
    const expected = expectedCounts[s];
    const match = actual === expected;
    if (!match) allCountsMatch = false;
    console.log(`  Sem ${s}: ${actual} subjects (expected: ${expected}) ${match ? '✅' : '❌'}`);
  }

  if (!allCountsMatch) {
    throw new Error('Semester counts did not match expected values!');
  }

  // Validate resource associations
  console.log('\n📑 Verifying Resource Integrity:');
  if (resourcesAfter !== resourcesBefore) {
    throw new Error(`Resource count changed! Before: ${resourcesBefore}, After: ${resourcesAfter}`);
  }

  const allResources = await Resource.find({}).populate('subject', 'branch semester code name');
  for (const res of allResources) {
    if (!res.subject) {
      throw new Error(`Resource [${res._id}] "${res.title}" has an invalid/null subject reference!`);
    }
    console.log(`  ✅ Resource [${res._id}] "${res.title}" -> ${res.subject.branch} Sem ${res.subject.semester} [${res.subject.code}] ${res.subject.name}`);
  }

  console.log('\n======================================================');
  console.log('🎉 CSE Subjects Migration Completed Successfully!');
  console.log('======================================================');
  console.log(`Total DB Subjects: ${totalAfter} (was ${totalBefore})`);
  console.log(`Total CSE Subjects: ${cseAfter} (was ${cseBefore})`);
  console.log(`Total Resources: ${resourcesAfter} (100% preserved)`);

  await disconnectDB();
}

migrate().catch(async (err) => {
  console.error('❌ Migration failed:', err);
  try {
    await disconnectDB();
  } catch {}
  process.exit(1);
});
