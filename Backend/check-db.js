import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database Name:', mongoose.connection.db.databaseName);
    console.log('🔗 Host:', mongoose.connection.host);
    console.log('');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📦 Collections in database:');
    collections.forEach(col => console.log(`   - ${col.name}`));
    console.log('');

    // Check accounts collection
    const Account = mongoose.connection.db.collection('accounts');
    const accountCount = await Account.countDocuments();
    console.log(`👥 Accounts: ${accountCount} documents`);
    if (accountCount > 0) {
      const accounts = await Account.find({}).limit(5).toArray();
      console.log('   Recent accounts:');
      accounts.forEach(acc => {
        console.log(`   - ${acc.email} (${acc.role}) - Created: ${acc.createdAt}`);
      });
    }
    console.log('');

    // Check demos collection
    const Demo = mongoose.connection.db.collection('demos');
    const demoCount = await Demo.countDocuments();
    console.log(`🎓 Demos: ${demoCount} documents`);
    if (demoCount > 0) {
      const demos = await Demo.find({}).sort({ createdAt: -1 }).limit(5).toArray();
      console.log('   Recent demos:');
      demos.forEach(demo => {
        console.log(`   - ${demo.studentName} (${demo.parentEmail}) - Status: ${demo.status} - Created: ${demo.createdAt}`);
      });
    }
    console.log('');

    // Check students collection
    const Student = mongoose.connection.db.collection('students');
    const studentCount = await Student.countDocuments();
    console.log(`🎯 Students: ${studentCount} documents`);
    if (studentCount > 0) {
      const students = await Student.find({}).limit(5).toArray();
      console.log('   Recent students:');
      students.forEach(student => {
        console.log(`   - ${student.studentName} - Status: ${student.status}`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkDatabase();
