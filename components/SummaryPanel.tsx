'use client'

import { SiteHealthData } from '@/lib/parser'

interface SummaryPanelProps {
  data: SiteHealthData['summary']
}

export function SummaryPanel({ data }: SummaryPanelProps) {
  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
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

  const getPhpVersionColor = (version: string) => {
    if (!version) return ''
    const majorVersion = parseInt(version.split('.')[0])
    if (majorVersion < 7) return 'text-red-600 dark:text-red-400'
    if (majorVersion < 8) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Health Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">PHP Version</div>
          <div className={`text-lg font-medium ${getPhpVersionColor(data.phpVersion)}`}>
            {data.phpVersion || 'N/A'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">WordPress Version</div>
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {data.wpVersion || 'N/A'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Active Plugins</div>
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {data.pluginCount}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Memory Limit</div>
          <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {data.memoryLimit || 'N/A'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">Overall Status</div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.healthStatus)}`}>
            <span>{getStatusIcon(data.healthStatus)}</span>
            <span className="capitalize">{data.healthStatus}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

