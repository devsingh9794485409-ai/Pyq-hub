// backend/scripts/testCSEVerification.js
import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import Subject from '../models/Subject.js';
import Resource from '../models/Resource.js';

const EXPECTED_CSE = {
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
    { code: 'BCC402', name: 'Python Programming' },
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

async function verify() {
  await connectDB();
  console.log('=== STARTING CSE COMPREHENSIVE VERIFICATION ===\n');

  let passed = true;
  let totalSem1To6Count = 0;

  for (let sem = 1; sem <= 6; sem++) {
    const expectedList = EXPECTED_CSE[sem];
    const actualSubjects = await Subject.find({ branch: 'CSE', semester: sem }).sort({ code: 1 });
    totalSem1To6Count += actualSubjects.length;

    console.log(`--- Semester ${sem} (Expected: ${expectedList.length}, Actual: ${actualSubjects.length}) ---`);

    if (actualSubjects.length !== expectedList.length) {
      console.error(`❌ Count mismatch in Sem ${sem}! Expected ${expectedList.length}, got ${actualSubjects.length}`);
      passed = false;
    }

    // Verify each expected subject exists
    for (const exp of expectedList) {
      const match = actualSubjects.find((s) => s.code === exp.code);
      if (!match) {
        console.error(`❌ Missing subject in Sem ${sem}: [${exp.code}] ${exp.name}`);
        passed = false;
      } else if (match.name !== exp.name) {
        console.error(`❌ Name mismatch in Sem ${sem} for ${exp.code}: Expected "${exp.name}", got "${match.name}"`);
        passed = false;
      } else {
        console.log(`  ✓ [${match.code}] ${match.name} (id: ${match._id})`);
      }
    }
    console.log('');
  }

  console.log(`Total CSE Subjects in Semesters 1-6: ${totalSem1To6Count} (Expected: 51)`);
  if (totalSem1To6Count !== 51) {
    passed = false;
    console.error('❌ Total CSE subjects sem 1-6 count is not 51!');
  } else {
    console.log('✅ Exactly 51 subjects in Semesters 1 to 6.');
  }

  // Verify Non-CSE branch integrity
  console.log('\n--- Non-CSE Branches Verification ---');
  const nonCseGroups = await Subject.aggregate([
    { $match: { branch: { $ne: 'CSE' } } },
    { $group: { _id: '$branch', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  for (const g of nonCseGroups) {
    console.log(`  • ${g._id}: ${g.count} subjects (all 38 as expected)`);
    if (g.count !== 38) {
      console.error(`❌ Non-CSE branch ${g._id} was modified! Count: ${g.count}`);
      passed = false;
    }
  }

  // Verify Resources
  console.log('\n--- Resource Attachment Verification ---');
  const resources = await Resource.find({}).populate('subject', 'branch semester code name');
  for (const r of resources) {
    console.log(`  • [${r._id}] "${r.title}" (${r.type}) -> Subject: [${r.subject?.code}] ${r.subject?.name} (${r.subject?.branch} Sem ${r.subject?.semester})`);
    if (!r.subject || r.subject.branch !== 'CSE') {
      console.error(`❌ Resource ${r.title} has invalid subject association!`);
      passed = false;
    }
  }

  await disconnectDB();

  if (passed) {
    console.log('\n🎉 ALL CHECKS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('\n❌ SOME CHECKS FAILED!');
    process.exit(1);
  }
}

verify();
