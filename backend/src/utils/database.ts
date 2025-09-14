import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
let prisma: PrismaClient;

try {
  prisma = globalThis.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
  }
} catch (error) {
  console.warn('Prisma Client not available - running without database connection');
  // Create a mock prisma client for development without database
  prisma = {} as PrismaClient;
}

// Database health check
export async function checkDatabaseConnection() {
  try {
    // Check if prisma client is properly initialized
    if (!prisma.$queryRaw) {
      return { 
        status: 'not_configured', 
        message: 'Database not configured - running in development mode',
        timestamp: new Date().toISOString() 
      };
    }
    
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'connected', timestamp: new Date().toISOString() };
  } catch (error) {
    console.error('Database connection failed:', error);
    return { 
      status: 'disconnected', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString() 
    };
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  try {
    if (prisma.$disconnect) {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.warn('Error during Prisma disconnect:', error);
  }
});

export { prisma };