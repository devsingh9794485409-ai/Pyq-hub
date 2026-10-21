// backend/scripts/inspectCSE.js
import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import Subject from '../models/Subject.js';
import Resource from '../models/Resource.js';

async function main() {
  await connectDB();
  
  const branches = await Subject.distinct('branch');
  console.log('Branches in DB:', branches);

  const cseSubjects = await Subject.find({ branch: 'CSE' }).sort({ semester: 1, code: 1 });
  console.log(`Total CSE subjects: ${cseSubjects.length}`);
  
  const semCounts = {};
  for (const s of cseSubjects) {
    semCounts[s.semester] = (semCounts[s.semester] || 0) + 1;
  }
  console.log('CSE subjects per semester:', semCounts);

  // Check if any resources are linked to CSE subjects
  const cseIds = cseSubjects.map(s => s._id);
  const resourcesOnCSE = await Resource.find({ subject: { $in: cseIds } });
  console.log(`Resources linked to CSE subjects: ${resourcesOnCSE.length}`);
  for (const r of resourcesOnCSE) {
    const sub = cseSubjects.find(s => s._id.equals(r.subject));
    console.log(`Resource "${r.title}" (Type: ${r.type}) linked to subject: ${sub?.code} - ${sub?.name} (Sem ${sub?.semester}) [ID: ${r.subject}]`);
  }

  // Also print all current CSE subjects sem 1-6
  console.log('\n--- Current CSE subjects (Sem 1-6) ---');
  for (const s of cseSubjects) {
    if (s.semester <= 6) {
      console.log(`Sem ${s.semester}: [${s.code}] ${s.name} (id: ${s._id})`);
    }
  }

  // Non-CSE subjects count
  const nonCseCount = await Subject.countDocuments({ branch: { $ne: 'CSE' } });
  console.log(`Non-CSE subjects count: ${nonCseCount}`);

  await disconnectDB();
}

main().catch(console.error);
