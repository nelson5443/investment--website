const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database Connected');
    
    // Create tables if they don't exist
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "fullName" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT DEFAULT 'CUSTOMER',
        "balance" REAL DEFAULT 0,
        "totalInvested" REAL DEFAULT 0,
        "totalReturns" REAL DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "isVerified" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Plan" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "roiPercent" INTEGER NOT NULL,
        "minAmount" INTEGER NOT NULL,
        "maxAmount" INTEGER NOT NULL,
        "durationDays" INTEGER NOT NULL,
        "description" TEXT NOT NULL,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('Tables created/verified');
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { prisma, connectDB };