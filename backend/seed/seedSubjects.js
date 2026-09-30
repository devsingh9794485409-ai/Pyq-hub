// backend/seed/seedSubjects.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Subject from '../models/Subject.js';

/**
 * AKTU-style CSE subjects, semesters 1-8.
 * ⚠️ Sample data hai — apne college ke syllabus se verify karo.
 */
const CSE_SUBJECTS = {
  1: [
    { code: 'KAS101', name: 'Engineering Physics' },
    { code: 'KAS103', name: 'Engineering Mathematics-I' },
    { code: 'KEE101', name: 'Basic Electrical Engineering' },
    { code: 'KCS101', name: 'Programming for Problem Solving' },
    { code: 'KCE101', name: 'Engineering Graphics & Design' },
    { code: 'KAS104', name: 'Communication Skills' },
  ],
  2: [
    { code: 'KAS202', name: 'Engineering Chemistry' },
    { code: 'KAS203', name: 'Engineering Mathematics-II' },
    { code: 'KME201', name: 'Basic Mechanical Engineering' },
    { code: 'KCS201', name: 'Python Programming' },
    { code: 'KAS204', name: 'Environment & Ecology' },
  ],
  3: [
    { code: 'KCS301', name: 'Data Structures & Algorithms' },
    { code: 'KCS302', name: 'Discrete Structures & Theory of Logic' },
    { code: 'KCS303', name: 'Computer Organization & Architecture' },
    { code: 'KCS304', name: 'Object Oriented Programming with Java' },
    { code: 'KAS301', name: 'Technical Communication' },
  ],
  4: [
    { code: 'KCS401', name: 'Operating Systems' },
    { code: 'KCS402', name: 'Design & Analysis of Algorithms' },
    { code: 'KCS403', name: 'Theory of Computation' },
    { code: 'KCS404', name: 'Database Management Systems' },
    { code: 'KCS405', name: 'Microprocessor & Microcontrollers' },
  ],
  5: [
    { code: 'KCS501', name: 'Compiler Design' },
    { code: 'KCS502', name: 'Computer Networks' },
    { code: 'KCS503', name: 'Web Technologies' },
    { code: 'KCS504', name: 'Software Engineering' },
    { code: 'KCS505', name: 'Computer Graphics' },
  ],
  6: [
    { code: 'KCS601', name: 'Artificial Intelligence' },
    { code: 'KCS602', name: 'Machine Learning' },
    { code: 'KCS603', name: 'Cloud Computing' },
    { code: 'KCS604', name: 'Data Warehousing & Data Mining' },
    { code: 'KCS605', name: 'Mobile Application Development' },
  ],
  7: [
    { code: 'KCS701', name: 'Cryptography & Network Security' },
    { code: 'KCS702', name: 'Big Data Analytics' },
    { code: 'KCS703', name: 'Deep Learning' },
    { code: 'KCS704', name: 'Software Testing & Quality Assurance' },
  ],
  8: [
    { code: 'KCS801', name: 'Blockchain Technology' },
    { code: 'KCS802', name: 'Internet of Things' },
    { code: 'KCS803', name: 'Natural Language Processing' },
  ],
};

const run = async () => {
  await connectDB();

  const branch = 'CSE';
  const docs = Object.entries(CSE_SUBJECTS).flatMap(([semester, subjects]) =>
    subjects.map((s) => ({ ...s, branch, semester: Number(semester) }))
  );

  await Subject.deleteMany({ branch });
  const inserted = await Subject.insertMany(docs);

  console.log(`🌱 Seeded ${inserted.length} subjects for branch ${branch}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});