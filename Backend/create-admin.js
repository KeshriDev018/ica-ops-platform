import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Account } from './src/models/account.model.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Admin credentials
    const adminEmail = 'admin@chessacademy.com';
    const adminPassword = 'admin123'; // Change this to your desired password

    // Check if admin already exists
    const existingAdmin = await Account.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Has Password: ${existingAdmin.password ? 'YES' : 'NO'}`);
      
      // Update password if needed
      const updatePassword = true; // Set to true to force update password
      
      if (updatePassword) {
        console.log('\n🔄 Updating admin password...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        existingAdmin.password = hashedPassword;
        existingAdmin.role = 'ADMIN'; // Ensure role is ADMIN
        await existingAdmin.save();
        console.log('✅ Admin password updated successfully!');
      }
    } else {
      // Create new admin account
      console.log('🔑 Creating new admin account...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = await Account.create({
        email: adminEmail,
        role: 'ADMIN',
        password: hashedPassword,
      });

      console.log('✅ Admin account created successfully!');
      console.log(`   ID: ${admin._id}`);
    }

    console.log('\n📋 Admin Login Credentials:');
    console.log('   ════════════════════════════════════');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ════════════════════════════════════');
    console.log('\n🚀 You can now login at: http://localhost:5175/login');

    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
