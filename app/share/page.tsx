'use client'

import { useEffect, useState, Suspense } from 'react'
import { SiteHealthData } from '@/lib/parser'
import { SummaryPanelContent } from '@/components/SummaryPanel'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Sidebar } from '@/components/Sidebar'
import Link from 'next/link'

function SharePageContent() {
  const [parsedData, setParsedData] = useState<SiteHealthData | null>(null)
  const [activeSection, setActiveSection] = useState('summary')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Get data from URL hash
      const hash = window.location.hash.substring(1) // Remove the #
      if (!hash) {
        setError('No data found in share link')
        return
      }

      // Decode base64 data
      const decodedData = atob(hash)
      const data = JSON.parse(decodedData) as SiteHealthData
      setParsedData(data)
    } catch (err) {
      setError('Invalid share link. The data may be corrupted.')
      console.error('Error parsing share data:', err)
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Site Health Doctor
              </h1>
              <DarkModeToggle />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-2">
              <span className="text-red-600 dark:text-red-400">❌</span>
              <span className="font-medium text-red-900 dark:text-red-100">{error}</span>
            </div>
            <Link
              href="/"
              className="mt-4 inline-block px-4 py-2 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors"
            >
              Create New Report
            </Link>
          </div>
        </main>
      </div>
    )
  }

  if (!parsedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Site Health Report
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Shared report
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Create New
              </Link>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex h-[calc(100vh-200px)]">
          <div className="w-1/4 min-w-[200px]">
            <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          </div>
          <div className="w-3/4 overflow-y-auto p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {activeSection === 'summary' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Health Summary</h2>
                  <div className="max-h-[500px] overflow-y-auto">
                    <SummaryPanelContent data={parsedData.summary} />
                  </div>
                </div>
              )}
              
              {activeSection === 'wordpress' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">WordPress Environment</h2>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {Object.entries(parsedData.wordpress).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 break-words">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeSection === 'server' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Server Environment</h2>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {Object.entries(parsedData.server).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 break-words">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeSection === 'theme' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Active Theme</h2>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {Object.entries(parsedData.theme).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 break-words">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeSection === 'plugins' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Active Plugins ({parsedData.plugins.length})</h2>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {parsedData.plugins.map((plugin, index) => (
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
                </div>
              )}
              
              {activeSection === 'database' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Database</h2>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {Object.entries(parsedData.database).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 break-words">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Made for support teams who care about clarity
        </div>
      </footer>
    </div>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <SharePageContent />
    </Suspense>
  )
}

