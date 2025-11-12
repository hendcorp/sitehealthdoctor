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
  let inPluginsSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    // Detect section headers - WordPress uses "### section-name ###" format
    if (line.match(/^###\s+.+\s+###$/)) {
      const sectionName = line.replace(/^###\s+/, '').replace(/\s+###$/, '').toLowerCase();
      
      // Determine section type
      if (sectionName.startsWith('wp-core')) {
        currentSection = 'wordpress';
        inPluginsSection = false;
      } else if (sectionName.startsWith('wp-server')) {
        currentSection = 'server';
        inPluginsSection = false;
      } else if (sectionName.startsWith('wp-active-theme')) {
        currentSection = 'theme';
        inPluginsSection = false;
      } else if (sectionName.startsWith('wp-plugins-active')) {
        currentSection = 'plugins';
        inPluginsSection = true;
      } else if (sectionName.startsWith('wp-database')) {
        currentSection = 'database';
        inPluginsSection = false;
      } else if (sectionName.startsWith('wp-constants')) {
        // Constants can go into wordpress section
        currentSection = 'wordpress';
        inPluginsSection = false;
      } else {
        // Other sections (wp-paths-sizes, wp-media, wp-filesystem, etc.)
        currentSection = '';
        inPluginsSection = false;
      }
      continue;
    }

    // Parse plugins (format: "Plugin Name: version: X.X, author: Name, ...")
    if (inPluginsSection && currentSection === 'plugins') {
      const plugin = parsePluginLine(line);
      if (plugin) {
        data.plugins!.push(plugin);
      }
      continue;
    }

    // Skip if no current section
    if (!currentSection) continue;

    // Parse key-value pairs (format: "key: value")
    if (line.includes(':')) {
      const colonIndex = line.indexOf(':');
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      // Store in appropriate section
      const sectionData = data[currentSection as keyof typeof data] as Record<string, string> | undefined;
      if (sectionData) {
        sectionData[key] = value;
      }
    }
  }

  // Extract summary data
  const serverData = data.server || {};
  const wpData = data.wordpress || {};
  
  const phpVersion = serverData['php_version'] || '';
  const wpVersion = wpData['version'] || '';
  const memoryLimit = serverData['memory_limit'] || '';
  
  data.summary = {
    phpVersion: phpVersion,
    wpVersion: wpVersion,
    pluginCount: data.plugins?.length || 0,
    memoryLimit: memoryLimit,
    healthStatus: calculateHealthStatus(data),
  };

  return data as SiteHealthData;
}

function parsePluginLine(line: string): { name: string; version: string; author: string; status: string } | null {
  // Format: "Plugin Name: version: X.X, author: Name, Auto-updates disabled"
  // Or: "Plugin Name: version: X.X, author: Name (latest version: Y.Y), Auto-updates disabled"
  
  if (!line || !line.includes(':')) {
    return null;
  }

  const parts: { name?: string; version?: string; author?: string; status?: string } = {};
  
  // Extract plugin name (everything before the first colon)
  const firstColonIndex = line.indexOf(':');
  parts.name = line.substring(0, firstColonIndex).trim();
  
  // Parse the rest: "version: X.X, author: Name, ..."
  const rest = line.substring(firstColonIndex + 1).trim();
  
  // Extract version
  const versionMatch = rest.match(/version:\s*([^,]+)/i);
  if (versionMatch) {
    parts.version = versionMatch[1].trim();
    // Remove "(latest version: X.X)" if present
    parts.version = parts.version.replace(/\s*\(latest version:[^)]+\)/i, '').trim();
  }
  
  // Extract author
  const authorMatch = rest.match(/author:\s*([^,]+)/i);
  if (authorMatch) {
    parts.author = authorMatch[1].trim();
    // Remove "(latest version: X.X)" if present in author field
    parts.author = parts.author.replace(/\s*\(latest version:[^)]+\)/i, '').trim();
  }
  
  // Determine status based on section (active plugins are in wp-plugins-active)
  parts.status = 'Active';
  
  if (parts.name) {
    return {
      name: parts.name,
      version: parts.version || 'Unknown',
      author: parts.author || 'Unknown',
      status: parts.status,
    };
  }

  return null;
}

function calculateHealthStatus(data: Partial<SiteHealthData>): 'ok' | 'warning' | 'critical' {
  let status: 'ok' | 'warning' | 'critical' = 'ok';

  // Check PHP version
  const phpVersion = data.summary?.phpVersion || '';
  if (phpVersion) {
    const versionMatch = phpVersion.match(/(\d+)\.(\d+)/);
    if (versionMatch) {
      const majorVersion = parseInt(versionMatch[1]);
      if (majorVersion < 7) {
        status = 'critical';
      } else if (majorVersion < 8) {
        status = status === 'ok' ? 'warning' : status;
      }
    }
  }

  // Check WordPress version
  const wpVersion = data.summary?.wpVersion || '';
  if (wpVersion) {
    const versionParts = wpVersion.split('.');
    const major = parseInt(versionParts[0]);
    const minor = parseInt(versionParts[1] || '0');
    if (major < 6 || (major === 6 && minor < 3)) {
      status = status === 'ok' ? 'warning' : status;
    }
  }

  // Check memory limit
  const memoryLimit = data.summary?.memoryLimit || '';
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

