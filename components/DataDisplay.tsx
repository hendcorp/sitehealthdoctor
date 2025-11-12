'use client'

import { SiteHealthData } from '@/lib/parser'
import { CollapsibleSection } from './CollapsibleSection'

interface DataDisplayProps {
  data: SiteHealthData
}

export function DataDisplay({ data }: DataDisplayProps) {
  const renderKeyValue = (obj: Record<string, string>) => {
    return (
      <div className="space-y-2">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {key}
            </div>
            <div className="text-xs text-gray-900 dark:text-gray-100 break-words">
              {value}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <CollapsibleSection title="WordPress Environment" icon="📝" defaultOpen={false}>
        {renderKeyValue(data.wordpress)}
      </CollapsibleSection>

      <CollapsibleSection title="Server Environment" icon="🖥️" defaultOpen={false}>
        {renderKeyValue(data.server)}
      </CollapsibleSection>

      <CollapsibleSection title="Active Theme" icon="🎨" defaultOpen={false}>
        {renderKeyValue(data.theme)}
      </CollapsibleSection>

      <CollapsibleSection title={`Active Plugins (${data.plugins.length})`} icon="🔌" defaultOpen={false}>
        <div className="space-y-2">
          {data.plugins.map((plugin, index) => (
            <div
              key={index}
              className="p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600"
            >
              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1.5">
                {plugin.name}
              </div>
              <div className="grid grid-cols-1 gap-1 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Version: </span>
                  <span className="text-gray-900 dark:text-gray-100">{plugin.version}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Author: </span>
                  <span className="text-gray-900 dark:text-gray-100">{plugin.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Database" icon="💾" defaultOpen={false}>
        {renderKeyValue(data.database)}
      </CollapsibleSection>
    </>
  )
}

