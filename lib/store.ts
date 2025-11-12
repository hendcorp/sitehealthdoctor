import { SiteHealthData } from './parser';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

interface StoredReport {
  id: string;
  data: SiteHealthData;
  createdAt: string;
}

let reportsCache: Map<string, StoredReport> | null = null;

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

async function loadReports(): Promise<Map<string, StoredReport>> {
  if (reportsCache) {
    return reportsCache;
  }

  await ensureDataDir();

  try {
    const fileContent = await fs.readFile(REPORTS_FILE, 'utf-8');
    const reports: StoredReport[] = JSON.parse(fileContent);
    reportsCache = new Map(reports.map(r => [r.id, r]));
    return reportsCache;
  } catch (error) {
    // File doesn't exist yet, return empty map
    reportsCache = new Map();
    return reportsCache;
  }
}

async function saveReports(reports: Map<string, StoredReport>) {
  await ensureDataDir();
  const reportsArray = Array.from(reports.values());
  await fs.writeFile(REPORTS_FILE, JSON.stringify(reportsArray, null, 2), 'utf-8');
  reportsCache = reports;
}

export async function saveReport(data: SiteHealthData): Promise<string> {
  const reports = await loadReports();
  const id = randomUUID();
  const report: StoredReport = {
    id,
    data,
    createdAt: new Date().toISOString(),
  };
  reports.set(id, report);
  await saveReports(reports);
  return id;
}

export async function getReport(id: string): Promise<StoredReport | null> {
  const reports = await loadReports();
  return reports.get(id) || null;
}

