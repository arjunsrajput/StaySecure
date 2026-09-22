require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const RoomType = require('./models/RoomType');
const Room = require('./models/Room');
const Location = require('./models/Location');
const Settings = require('./models/Settings');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await RoomType.deleteMany({});
    await Room.deleteMany({});
    await Location.deleteMany({});
    await Settings.deleteMany({});

    console.log('Cleared existing data...');

    // Seed Users
    const demoPassword = 'TempPassword123!';

    const users = [
      {
        name: 'Admin User',
        email: 'admin+demo@example.com',
        phone: '9000000001',
        password: demoPassword,
        role: 'ADMIN',
        emailVerified: true,
      },
      {
        name: 'Customer User',
        email: 'customer+demo@example.com',
        phone: '9000000002',
        password: demoPassword,
        role: 'CUSTOMER',
        emailVerified: true,
      },
      {
        name: 'Room Manager',
        email: 'roommanager+demo@example.com',
        phone: '9000000003',
        password: demoPassword,
        role: 'ROOM_MANAGER',
        emailVerified: true,
      },
      {
        name: 'Approval Manager',
        email: 'approval+demo@example.com',
        phone: '9000000004',
        password: demoPassword,
        role: 'APPROVAL_MANAGER',
        emailVerified: true,
      },
      {
        name: 'Accountant',
        email: 'accountant+demo@example.com',
        phone: '9000000005',
        password: demoPassword,
        role: 'ACCOUNTANT',
        emailVerified: true,
      },
      {
        name: 'Receptionist',
        email: 'reception+demo@example.com',
        phone: '9000000006',
        password: demoPassword,
        role: 'RECEPTIONIST',
        emailVerified: true,
      },
      {
        name: 'Auditor',
        email: 'auditor+demo@example.com',
        phone: '9000000007',
        password: demoPassword,
        role: 'AUDITOR',
        emailVerified: true,
      },
    ];

    const createdUsers = await User.create(users);
    console.log(`✓ ${createdUsers.length} users created`);

    // Seed Room Types
    const roomTypes = [
      {
        name: 'HOSTEL',
        description: 'Budget-friendly shared accommodation',
        capacity: 6,
        pricePerDay: 300,
        isActive: true,
      },
      {
        name: 'PG',
        description: 'Private paying guest room',
        capacity: 1,
        pricePerDay: 800,
        isActive: true,
      },
      {
        name: 'HOTEL',
        description: 'Luxury hotel room with amenities',
        capacity: 2,
        pricePerDay: 1500,
        isActive: true,
      },
      {
        name: 'GUEST_ROOM',
        description: 'Simple guest room accommodation',
        capacity: 2,
        pricePerDay: 600,
        isActive: true,
      },
      {
        name: 'DORMITORY',
        description: 'Large dormitory room',
        capacity: 8,
        pricePerDay: 250,
        isActive: true,
      },
    ];

    const createdRoomTypes = await RoomType.create(roomTypes);
    console.log(`✓ ${createdRoomTypes.length} room types created`);

    const [defaultLocation] = await Location.create([{
      name: 'StaySecure Central',
      address: 'Main Street',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560001',
    }]);
    console.log('✓ Default location created');

    // Seed Rooms
    const roomsData = [
      { roomNumber: 'H-101', roomType: createdRoomTypes[0]._id, location: defaultLocation._id, floor: 1, capacity: 6 },
      { roomNumber: 'H-102', roomType: createdRoomTypes[0]._id, location: defaultLocation._id, floor: 1, capacity: 6 },
      { roomNumber: 'PG-201', roomType: createdRoomTypes[1]._id, location: defaultLocation._id, floor: 2, capacity: 1 },
      { roomNumber: 'PG-202', roomType: createdRoomTypes[1]._id, location: defaultLocation._id, floor: 2, capacity: 1 },
      { roomNumber: 'HT-301', roomType: createdRoomTypes[2]._id, location: defaultLocation._id, floor: 3, capacity: 2 },
      { roomNumber: 'HT-302', roomType: createdRoomTypes[2]._id, location: defaultLocation._id, floor: 3, capacity: 2 },
      { roomNumber: 'G-401', roomType: createdRoomTypes[3]._id, location: defaultLocation._id, floor: 4, capacity: 2 },
      { roomNumber: 'G-402', roomType: createdRoomTypes[3]._id, location: defaultLocation._id, floor: 4, capacity: 2 },
      { roomNumber: 'D-501', roomType: createdRoomTypes[4]._id, location: defaultLocation._id, floor: 5, capacity: 8 },
      { roomNumber: 'D-502', roomType: createdRoomTypes[4]._id, location: defaultLocation._id, floor: 5, capacity: 8 },
    ];

    const createdRooms = await Room.create(roomsData);
    console.log(`✓ ${createdRooms.length} rooms created`);

    // Seed Settings
    await Settings.create({ approvalMode: 'MANUAL' });
    console.log('✓ Settings created (approvalMode: MANUAL)');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nDemo credentials generated for non-production testing only.');
    console.log('Use the registration flow for production-like accounts and rotate any seeded passwords immediately.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
