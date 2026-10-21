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

  const bulkOps = docs.map((s) => ({
    updateOne: {
      filter: { branch: s.branch, semester: s.semester, code: s.code },
      update: { $set: s },
      upsert: true,
    },
  }));

  const res = await Subject.bulkWrite(bulkOps, { ordered: false });
  console.log(`🌱 Safe Seeded CSE: matched ${res.matchedCount}, upserted ${res.upsertedCount}, modified ${res.modifiedCount}`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});