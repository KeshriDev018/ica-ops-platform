import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Demo } from './src/models/demo.model.js';
import { Account } from './src/models/account.model.js';

dotenv.config();

const testDemo = async () => {
  try {
    console.log('🔗 Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('');

    // Create test account
    console.log('👤 Creating test account...');
    const account = await Account.create({
      email: 'debug@test.com',
      role: 'CUSTOMER',
    });
    console.log('✅ Account created:', account._id);

    // Create test demo
    console.log('🎓 Creating test demo...');
    const demo = await Demo.create({
      accountId: account._id,
      studentName: 'Debug Student',
      parentName: 'Debug Parent',
      parentEmail: 'debug@test.com',
      studentAge: 10,
      country: 'India',
      timezone: 'Asia/Kolkata',
      scheduledStart: new Date('2026-01-25T10:00:00Z'),
      scheduledEnd: new Date('2026-01-25T11:00:00Z'),
      status: 'BOOKED',
    });
    console.log('✅ Demo created:', demo._id);
    console.log('');

    // Query back immediately
    console.log('🔍 Querying back...');
    const foundAccount = await Account.findById(account._id);
    const foundDemo = await Demo.findById(demo._id);
    console.log('Found account:', foundAccount ? 'YES ✅' : 'NO ❌');
    console.log('Found demo:', foundDemo ? 'YES ✅' : 'NO ❌');
    console.log('');

    // Count all documents
    const accountCount = await Account.countDocuments();
    const demoCount = await Demo.countDocuments();
    console.log(`📊 Total accounts in DB: ${accountCount}`);
    console.log(`📊 Total demos in DB: ${demoCount}`);

    await mongoose.disconnect();
    console.log('\n✅ Test complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testDemo();
