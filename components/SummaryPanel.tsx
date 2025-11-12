'use client'

import { SiteHealthData } from '@/lib/parser'

interface SummaryPanelProps {
  data: SiteHealthData['summary']
  plugins?: SiteHealthData['plugins']
}

export function getStatusIcon(status: string) {
  switch (status) {
    case 'ok':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'critical':
      return '❌'
    default:
      return 'ℹ️'
  }
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'ok':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
    case 'critical':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
  }
}

export function getPhpVersionColor(version: string) {
  if (!version) return ''
  const majorVersion = parseInt(version.split('.')[0])
  if (majorVersion < 7) return 'text-red-600 dark:text-red-400'
  if (majorVersion < 8) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}

export function getAggregatorVersionColor(version: string) {
  if (!version) return 'text-gray-900 dark:text-gray-100'
  const majorVersion = parseInt(version.split('.')[0])
  if (majorVersion >= 5) return 'text-green-600 dark:text-green-400'
  return 'text-red-600 dark:text-red-400'
}

export function SummaryPanelContent({ data, plugins = [] }: SummaryPanelProps) {
  // Filter aggregator plugins (plugins that start with "WP RSS Aggregator")
  const aggregatorPlugins = plugins.filter(plugin => 
    plugin.name.startsWith('WP RSS Aggregator')
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="space-y-0.5">
          <div className="text-sm text-gray-500 dark:text-gray-400">PHP Version</div>
          <div className={`text-sm font-medium ${getPhpVersionColor(data.phpVersion)}`}>
            {data.phpVersion || 'N/A'}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-sm text-gray-500 dark:text-gray-400">WordPress Version</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {data.wpVersion || 'N/A'}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-sm text-gray-500 dark:text-gray-400">Active Plugins</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {data.pluginCount}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-sm text-gray-500 dark:text-gray-400">Memory Limit</div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {data.memoryLimit || 'N/A'}
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="text-sm text-gray-500 dark:text-gray-400">Overall Status</div>
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-sm font-medium ${getStatusColor(data.healthStatus)}`}>
            <span className="text-sm">{getStatusIcon(data.healthStatus)}</span>
            <span className="capitalize">{data.healthStatus}</span>
          </div>
        </div>
      </div>

      {aggregatorPlugins.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Aggregator's Plugin
          </div>
          <div className="space-y-2">
            {aggregatorPlugins.map((plugin, index) => (
              <div
                key={index}
                className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1.5">
                  {plugin.name}
                </div>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Version: </span>
                    <span className={`font-medium ${getAggregatorVersionColor(plugin.version)}`}>
                      {plugin.version}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Author: </span>
                    <span className="text-gray-900 dark:text-gray-100">{plugin.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function SummaryPanel({ data, plugins }: SummaryPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">
        Health Summary
      </h2>
      <SummaryPanelContent data={data} plugins={plugins} />
    </div>
  )
}

