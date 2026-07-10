require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const { ROLES } = require('../constants/roles');

const seedUsers = [
  {
    name: 'Super Admin',
    mobile: '9000000001',
    role: ROLES.SUPER_ADMIN,
    isActive: true,
  },
  {
    name: 'Admin User',
    mobile: '9000000002',
    role: ROLES.ADMIN,
    isActive: true,
  },
  {
    name: 'Manager User',
    mobile: '9000000003',
    role: ROLES.MANAGER,
    isActive: true,
  },
  {
    name: 'Regular User',
    mobile: '9000000004',
    role: ROLES.USER,
    isActive: true,
  },
  {
    name: 'Inactive User',
    mobile: '9000000005',
    role: ROLES.USER,
    isActive: false,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Insert seed users
    const users = await User.insertMany(seedUsers);
    console.log(`✅ Seeded ${users.length} users:\n`);

    users.forEach((u) => {
      console.log(`  📱 ${u.mobile}  🔑 ${u.role}  👤 ${u.name}  ✅ Active: ${u.isActive}`);
    });

    console.log('\n📌 Use any of the above mobile numbers to login with OTP.');
    console.log('   In development mode, OTP is returned in the API response.\n');

    await mongoose.disconnect();
    console.log('✅ Seed complete. Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
