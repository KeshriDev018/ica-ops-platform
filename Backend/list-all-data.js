import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const listAllData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');
    console.log('🗄️  Database:', mongoose.connection.db.databaseName);
    console.log('');

    // List all accounts
    const Account = mongoose.connection.db.collection('accounts');
    const accounts = await Account.find({}).sort({ createdAt: -1 }).toArray();
    console.log(`👥 ACCOUNTS (${accounts.length} total):`);
    console.log('═'.repeat(80));
    if (accounts.length > 0) {
      accounts.forEach((acc, i) => {
        console.log(`${i + 1}. Email: ${acc.email}`);
        console.log(`   Role: ${acc.role}`);
        console.log(`   ID: ${acc._id}`);
        console.log(`   Created: ${acc.createdAt}`);
        console.log(`   Has Password: ${acc.password ? 'YES' : 'NO'}`);
        console.log('');
      });
    } else {
      console.log('   No accounts found\n');
    }

    // List all demos
    const Demo = mongoose.connection.db.collection('demos');
    const demos = await Demo.find({}).sort({ createdAt: -1 }).toArray();
    console.log(`🎓 DEMOS (${demos.length} total):`);
    console.log('═'.repeat(80));
    if (demos.length > 0) {
      demos.forEach((demo, i) => {
        console.log(`${i + 1}. Student: ${demo.studentName} (Age: ${demo.studentAge})`);
        console.log(`   Parent: ${demo.parentName} <${demo.parentEmail}>`);
        console.log(`   Country: ${demo.country}`);
        console.log(`   Status: ${demo.status}`);
        console.log(`   Scheduled: ${demo.scheduledStart}`);
        console.log(`   Account ID: ${demo.accountId}`);
        console.log(`   Demo ID: ${demo._id}`);
        console.log(`   Created: ${demo.createdAt}`);
        console.log('');
      });
    } else {
      console.log('   No demos found\n');
    }

    // List all students
    const Student = mongoose.connection.db.collection('students');
    const students = await Student.find({}).sort({ createdAt: -1 }).toArray();
    console.log(`🎯 STUDENTS (${students.length} total):`);
    console.log('═'.repeat(80));
    if (students.length > 0) {
      students.forEach((student, i) => {
        console.log(`${i + 1}. Name: ${student.studentName}`);
        console.log(`   Status: ${student.status}`);
        console.log(`   Type: ${student.studentType}`);
        console.log(`   Coach ID: ${student.assignedCoachId}`);
        console.log('');
      });
    } else {
      console.log('   No students found\n');
    }

    await mongoose.disconnect();
    console.log('✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

listAllData();
