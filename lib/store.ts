import { SiteHealthData } from './parser';
import { createClient } from 'redis';

// Get Redis client - create new instance for each request in serverless environment
function getRedisClient() {
  if (!process.env.REDIS_URL) {
    return null;
  }
  
  const client = createClient({
    url: process.env.REDIS_URL,
  });
  
  client.on('error', (err) => console.error('Redis Client Error', err));
  
  return client;
}

interface StoredReport {
  id: string;
  data: SiteHealthData;
  createdAt: string;
}

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function saveReport(data: SiteHealthData): Promise<string> {
  const redis = getRedisClient();
  
  if (!redis) {
    throw new Error(
      'REDIS_URL environment variable is not configured. Please add REDIS_URL to your Vercel project environment variables. You can find it in your Redis database settings under ".env.local" tab.'
    );
  }

  try {
    // Connect to Redis
    if (!redis.isOpen) {
      await redis.connect();
    }

    // Generate short 10-character ID instead of UUID
    const id = generateShortId();
    const report: StoredReport = {
      id,
      data,
      createdAt: new Date().toISOString(),
    };
    
    // Store report in Redis with key pattern: report:{id}
    await redis.set(`report:${id}`, JSON.stringify(report));
    
    return id;
  } finally {
    // Close connection in serverless environment
    if (redis.isOpen) {
      await redis.quit();
    }
  }
}

export async function getReport(id: string): Promise<StoredReport | null> {
  const redis = getRedisClient();
  
  if (!redis) {
    return null;
  }
  
  try {
    // Connect to Redis
    if (!redis.isOpen) {
      await redis.connect();
    }
    
    const reportData = await redis.get(`report:${id}`);
    if (!reportData) {
      return null;
    }
    
    return JSON.parse(reportData) as StoredReport;
  } catch (error) {
    console.error('Error retrieving report from Redis:', error);
    return null;
  } finally {
    // Close connection in serverless environment
    if (redis.isOpen) {
      await redis.quit();
    }
  }
}

