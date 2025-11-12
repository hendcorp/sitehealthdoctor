import { SiteHealthData } from './parser';
import { kv } from '@vercel/kv';

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
  // Generate short 10-character ID instead of UUID
  const id = generateShortId();
  const report: StoredReport = {
    id,
    data,
    createdAt: new Date().toISOString(),
  };
  
  // Store report in Vercel KV with key pattern: report:{id}
  await kv.set(`report:${id}`, report);
  
  return id;
}

export async function getReport(id: string): Promise<StoredReport | null> {
  try {
    const report = await kv.get<StoredReport>(`report:${id}`);
    return report || null;
  } catch (error) {
    console.error('Error retrieving report from KV:', error);
    return null;
  }
}

