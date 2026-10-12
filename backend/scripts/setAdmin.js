// backend/scripts/setAdmin.js
import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';

const printUsage = () => {
  console.log(`
PyQHub Admin Role Manager
=========================
Usage:
  node scripts/setAdmin.js --email <user-email> [--revoke]
  node scripts/setAdmin.js --uid <firebase-uid> [--revoke]
  node scripts/setAdmin.js --email <user-email> --check
  node scripts/setAdmin.js --uid <firebase-uid> --check

Options:
  -e, --email <email>     Target user email address
  -u, --uid <firebaseUid> Target user Firebase UID (googleId)
  --revoke                Revoke admin role (sets isAdmin to false)
  --check                 Check current role without modifying
  -h, --help              Show this help message
`);
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const options = {
    email: null,
    uid: null,
    revoke: false,
    check: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else if (arg === '--email' || arg === '-e') {
      options.email = args[++i];
    } else if (arg === '--uid' || arg === '-u') {
      options.uid = args[++i];
    } else if (arg === '--revoke') {
      options.revoke = true;
    } else if (arg === '--check') {
      options.check = true;
    } else {
      console.error(`❌ Unknown option: ${arg}`);
      printUsage();
      process.exit(1);
    }
  }

  return options;
};

const run = async () => {
  const { email, uid, revoke, check } = parseArgs();

  if (!email && !uid) {
    console.error('❌ Error: Either --email or --uid must be provided.');
    printUsage();
    process.exit(1);
  }

  const query = {};
  let descriptor = '';

  if (email) {
    const cleanEmail = String(email).trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      console.error(`❌ Error: "${email}" is not a valid email address.`);
      process.exit(1);
    }
    query.email = cleanEmail;
    descriptor = `email "${cleanEmail}"`;
  } else if (uid) {
    const cleanUid = String(uid).trim();
    if (!cleanUid) {
      console.error('❌ Error: Firebase UID cannot be empty.');
      process.exit(1);
    }
    query.googleId = cleanUid;
    descriptor = `Firebase UID "${cleanUid}"`;
  }

  try {
    await connectDB();

    const user = await User.findOne(query);

    if (!user) {
      console.error(`❌ No user found matching ${descriptor}.`);
      await disconnectDB();
      process.exit(1);
    }

    if (check) {
      console.log(`
👤 User Details:
  - Name:         ${user.name}
  - Email:        ${user.email}
  - Auth Provider:${user.authProvider}
  - Branch / Sem: ${user.branch} / Semester ${user.semester}
  - Is Admin:     ${Boolean(user.isAdmin) ? '✅ YES (Admin)' : '❌ NO (Standard User)'}
`);
      await disconnectDB();
      process.exit(0);
    }

    const targetAdminState = !revoke;

    if (user.isAdmin === targetAdminState) {
      console.log(`ℹ️ User "${user.name}" (${user.email}) already has isAdmin = ${targetAdminState}. No changes needed.`);
      await disconnectDB();
      process.exit(0);
    }

    user.isAdmin = targetAdminState;
    await user.save();

    console.log(`
🎉 Successfully updated user role!
  - Name:     ${user.name}
  - Email:    ${user.email}
  - isAdmin:  ${user.isAdmin ? '✅ TRUE (Admin)' : '❌ FALSE (Standard User)'}
`);

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Operation failed:', err.message);
    try {
      await disconnectDB();
    } catch {
      /* ignore */
    }
    process.exit(1);
  }
};

run();
