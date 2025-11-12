export interface SiteHealthData {
  wordpress: Record<string, string>;
  server: Record<string, string>;
  theme: Record<string, string>;
  plugins: Array<{ name: string; version: string; author: string; status: string }>;
  database: Record<string, string>;
  cron: Record<string, string>;
  summary: {
    phpVersion: string;
    wpVersion: string;
    pluginCount: number;
    memoryLimit: string;
    healthStatus: 'ok' | 'warning' | 'critical';
  };
}

export function parseSiteHealth(rawText: string): SiteHealthData {
  const lines = rawText.split('\n');
  const data: Partial<SiteHealthData> = {
    wordpress: {},
    server: {},
    theme: {},
    plugins: [],
    database: {},
    cron: {},
    summary: {
      phpVersion: '',
      wpVersion: '',
      pluginCount: 0,
      memoryLimit: '',
      healthStatus: 'ok',
    },
  };

  let currentSection = '';
  let inPlugins = false;
  let pluginBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    // Detect section headers
    if (line.includes('== WordPress Environment ==')) {
      currentSection = 'wordpress';
      continue;
    } else if (line.includes('== Server Environment ==')) {
      currentSection = 'server';
      continue;
    } else if (line.includes('== Active Theme ==')) {
      currentSection = 'theme';
      continue;
    } else if (line.includes('== Active Plugins ==')) {
      currentSection = 'plugins';
      inPlugins = true;
      continue;
    } else if (line.includes('== Database ==') || line.includes('== Database Server ==')) {
      currentSection = 'database';
      inPlugins = false;
      continue;
    } else if (line.includes('== Cron ==') || line.includes('== Cron Events ==')) {
      currentSection = 'cron';
      inPlugins = false;
      continue;
    }

    // Parse key-value pairs
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (inPlugins && currentSection === 'plugins') {
        pluginBuffer.push(line);
      } else if (currentSection && data[currentSection as keyof typeof data]) {
        (data[currentSection as keyof typeof data] as Record<string, string>)[key.trim()] = value;
      }
    }

    // Process plugin buffer when we hit a new section or end
    if (inPlugins && (line.startsWith('==') || i === lines.length - 1)) {
      if (pluginBuffer.length > 0) {
        const plugin = parsePlugin(pluginBuffer);
        if (plugin) {
          data.plugins!.push(plugin);
        }
        pluginBuffer = [];
      }
      inPlugins = false;
    }
  }

  // Process any remaining plugins
  if (pluginBuffer.length > 0) {
    const plugin = parsePlugin(pluginBuffer);
    if (plugin) {
      data.plugins!.push(plugin);
    }
  }

  // Extract summary data
  data.summary = {
    phpVersion: data.server?.['PHP Version'] || data.server?.['PHP version'] || '',
    wpVersion: data.wordpress?.['Version'] || data.wordpress?.['WordPress version'] || '',
    pluginCount: data.plugins?.length || 0,
    memoryLimit: data.server?.['PHP Memory Limit'] || data.server?.['Memory limit'] || '',
    healthStatus: calculateHealthStatus(data),
  };

  return data as SiteHealthData;
}

function parsePlugin(lines: string[]): { name: string; version: string; author: string; status: string } | null {
  const plugin: Partial<{ name: string; version: string; author: string; status: string }> = {};
  
  for (const line of lines) {
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      const keyLower = key.trim().toLowerCase();
      
      if (keyLower.includes('name')) {
        plugin.name = value;
      } else if (keyLower.includes('version')) {
        plugin.version = value;
      } else if (keyLower.includes('author')) {
        plugin.author = value;
      } else if (keyLower.includes('status')) {
        plugin.status = value;
      }
    }
  }

  if (plugin.name) {
    return {
      name: plugin.name,
      version: plugin.version || 'Unknown',
      author: plugin.author || 'Unknown',
      status: plugin.status || 'Active',
    };
  }

  return null;
}

function calculateHealthStatus(data: Partial<SiteHealthData>): 'ok' | 'warning' | 'critical' {
  let status: 'ok' | 'warning' | 'critical' = 'ok';

  // Check PHP version
  const phpVersion = data.server?.['PHP Version'] || data.server?.['PHP version'] || '';
  if (phpVersion) {
    const majorVersion = parseInt(phpVersion.split('.')[0]);
    if (majorVersion < 7) {
      status = 'critical';
    } else if (majorVersion < 8) {
      status = status === 'ok' ? 'warning' : status;
    }
  }

  // Check WordPress version
  const wpVersion = data.wordpress?.['Version'] || '';
  if (wpVersion) {
    const versionParts = wpVersion.split('.');
    const major = parseInt(versionParts[0]);
    const minor = parseInt(versionParts[1] || '0');
    if (major < 6 || (major === 6 && minor < 3)) {
      status = status === 'ok' ? 'warning' : status;
    }
  }

  // Check memory limit
  const memoryLimit = data.server?.['PHP Memory Limit'] || '';
  if (memoryLimit) {
    const memoryMB = parseInt(memoryLimit.replace(/[^0-9]/g, ''));
    if (memoryMB < 128) {
      status = status === 'ok' ? 'warning' : status;
    } else if (memoryMB < 64) {
      status = 'critical';
    }
  }

  return status;
}

export function stripSensitiveData(data: SiteHealthData): SiteHealthData {
  const sensitivePatterns = [
    /@[\w.-]+\.\w+/g, // Email addresses
    /(https?:\/\/)?([\w.-]+\.)+[\w-]+/g, // Domains/URLs
    /\/[\w\/.-]+/g, // File paths
  ];

  const cleanValue = (value: string): string => {
    let cleaned = value;
    sensitivePatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '[REDACTED]');
    });
    return cleaned;
  };

  const cleanObject = (obj: Record<string, string>): Record<string, string> => {
    const cleaned: Record<string, string> = {};
    Object.entries(obj).forEach(([key, value]) => {
      cleaned[key] = cleanValue(value);
    });
    return cleaned;
  };

  return {
    ...data,
    wordpress: cleanObject(data.wordpress),
    server: cleanObject(data.server),
    theme: cleanObject(data.theme),
    database: cleanObject(data.database),
    cron: cleanObject(data.cron),
    plugins: data.plugins.map(plugin => ({
      ...plugin,
      name: cleanValue(plugin.name),
      author: cleanValue(plugin.author),
    })),
  };
}

