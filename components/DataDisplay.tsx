'use client'

import { SiteHealthData } from '@/lib/parser'
import { CollapsibleSection } from './CollapsibleSection'

interface DataDisplayProps {
  data: SiteHealthData
}

export function DataDisplay({ data }: DataDisplayProps) {
  const renderKeyValue = (obj: Record<string, string>) => {
    return (
      <div className="space-y-3">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="font-medium text-gray-700 dark:text-gray-300 sm:w-1/3 flex-shrink-0">
              {key}
            </div>
            <div className="text-gray-600 dark:text-gray-400 sm:flex-1 break-words">
              {value}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <CollapsibleSection title="WordPress Environment" icon="📝" defaultOpen={true}>
        {renderKeyValue(data.wordpress)}
      </CollapsibleSection>

      <CollapsibleSection title="Server Environment" icon="🖥️" defaultOpen={true}>
        {renderKeyValue(data.server)}
      </CollapsibleSection>

      <CollapsibleSection title="Active Theme" icon="🎨">
        {renderKeyValue(data.theme)}
      </CollapsibleSection>

      <CollapsibleSection title={`Active Plugins (${data.plugins.length})`} icon="🔌">
        <div className="space-y-4">
          {data.plugins.map((plugin, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {plugin.name}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Version: </span>
                  <span className="text-gray-900 dark:text-gray-100">{plugin.version}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Author: </span>
                  <span className="text-gray-900 dark:text-gray-100">{plugin.author}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Status: </span>
                  <span className="text-gray-900 dark:text-gray-100">{plugin.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Database" icon="💾">
        {renderKeyValue(data.database)}
      </CollapsibleSection>
    </div>
  )
}

