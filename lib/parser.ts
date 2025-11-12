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
  let currentPlugin: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      // Empty line might indicate end of plugin entry
      if (currentSection === 'plugins' && currentPlugin.length > 0) {
        const plugin = parsePlugin(currentPlugin);
        if (plugin) {
          data.plugins!.push(plugin);
        }
        currentPlugin = [];
      }
      continue;
    }

    // Detect section headers - WordPress uses "== Section Name ==" format
    if (line.match(/^==\s*.+\s*==$/)) {
      // Process any pending plugin before switching sections
      if (currentSection === 'plugins' && currentPlugin.length > 0) {
        const plugin = parsePlugin(currentPlugin);
        if (plugin) {
          data.plugins!.push(plugin);
        }
        currentPlugin = [];
      }

      // Determine section type
      const sectionLower = line.toLowerCase();
      if (sectionLower.includes('wordpress environment')) {
        currentSection = 'wordpress';
      } else if (sectionLower.includes('server environment')) {
        currentSection = 'server';
      } else if (sectionLower.includes('active theme')) {
        currentSection = 'theme';
      } else if (sectionLower.includes('active plugins')) {
        currentSection = 'plugins';
      } else if (sectionLower.includes('database')) {
        currentSection = 'database';
      } else if (sectionLower.includes('cron')) {
        currentSection = 'cron';
      } else {
        // Unknown section, but continue parsing
        currentSection = '';
      }
      continue;
    }

    // Skip if no current section
    if (!currentSection) continue;

    // Parse key-value pairs
    if (line.includes(':')) {
      const colonIndex = line.indexOf(':');
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      if (currentSection === 'plugins') {
        // Collect plugin info
        currentPlugin.push(line);
      } else {
        // Store in appropriate section
        const sectionData = data[currentSection as keyof typeof data] as Record<string, string> | undefined;
        if (sectionData) {
          sectionData[key] = value;
        }
      }
    }
  }

  // Process any remaining plugin at the end
  if (currentSection === 'plugins' && currentPlugin.length > 0) {
    const plugin = parsePlugin(currentPlugin);
    if (plugin) {
      data.plugins!.push(plugin);
    }
  }

  // Extract summary data with multiple possible key variations
  const serverData = data.server || {};
  const wpData = data.wordpress || {};
  
  // Try to find PHP version with various key formats
  const phpVersion = 
    serverData['PHP Version'] || 
    serverData['PHP version'] || 
    serverData['PHP'] ||
    Object.keys(serverData).find(k => k.toLowerCase().includes('php') && k.toLowerCase().includes('version')) 
      ? serverData[Object.keys(serverData).find(k => k.toLowerCase().includes('php') && k.toLowerCase().includes('version'))!]
      : '';
  
  // Try to find WordPress version with various key formats
  const wpVersion = 
    wpData['Version'] || 
    wpData['WordPress version'] || 
    wpData['WordPress'] ||
    wpData['WordPress Version'] ||
    Object.keys(wpData).find(k => k.toLowerCase().includes('version')) 
      ? wpData[Object.keys(wpData).find(k => k.toLowerCase().includes('version'))!]
      : '';
  
  // Try to find memory limit with various key formats
  const memoryLimit = 
    serverData['PHP Memory Limit'] || 
    serverData['Memory limit'] || 
    serverData['Memory Limit'] ||
    serverData['PHP memory limit'] ||
    Object.keys(serverData).find(k => k.toLowerCase().includes('memory') && k.toLowerCase().includes('limit')) 
      ? serverData[Object.keys(serverData).find(k => k.toLowerCase().includes('memory') && k.toLowerCase().includes('limit'))!]
      : '';
  
  data.summary = {
    phpVersion: phpVersion,
    wpVersion: wpVersion,
    pluginCount: data.plugins?.length || 0,
    memoryLimit: memoryLimit,
    healthStatus: calculateHealthStatus(data),
  };

  return data as SiteHealthData;
}

function parsePlugin(lines: string[]): { name: string; version: string; author: string; status: string } | null {
  const plugin: Partial<{ name: string; version: string; author: string; status: string }> = {};
  
  for (const line of lines) {
    if (line.includes(':')) {
      const colonIndex = line.indexOf(':');
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      const keyLower = key.toLowerCase();
      
      if (keyLower.includes('name') || keyLower === 'name') {
        plugin.name = value;
      } else if (keyLower.includes('version') || keyLower === 'version') {
        plugin.version = value;
      } else if (keyLower.includes('author') || keyLower === 'author') {
        plugin.author = value;
      } else if (keyLower.includes('status') || keyLower === 'status') {
        plugin.status = value;
      }
    } else if (!plugin.name && line.trim()) {
      // Sometimes plugin name might be on its own line
      plugin.name = line.trim();
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

