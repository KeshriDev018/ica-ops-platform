/**
 * Script to create a test coach account
 */
import mongoose from 'mongoose'
import { Account } from './src/models/account.model.js'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

async function createCoach() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to MongoDB')

    const coachEmail = 'coach@chessacademy.com'
    
    // Check if coach already exists
    const existing = await Account.findOne({ email: coachEmail })
    if (existing) {
      console.log('⚠️  Coach already exists:', coachEmail)
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash('coach123', 10)
      existing.password = hashedPassword
      existing.name = 'Test Coach'
      await existing.save()
      console.log('✅ Updated coach password and name')
    } else {
      // Create new coach
      const hashedPassword = await bcrypt.hash('coach123', 10)
      const coach = await Account.create({
        email: coachEmail,
        password: hashedPassword,
        role: 'COACH',
        name: 'Test Coach'
      })
      console.log('✅ Coach created:', coach.email)
    }

    console.log('\n📋 Coach Credentials:')
    console.log('   Email:', coachEmail)
    console.log('   Password: coach123')
    console.log('   Role: COACH')

    await mongoose.disconnect()
    console.log('\n✅ Script completed')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createCoach()
