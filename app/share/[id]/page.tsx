'use client'

import { useEffect, useState, Suspense } from 'react'
import { SiteHealthData } from '@/lib/parser'
import { SummaryPanelContent } from '@/components/SummaryPanel'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { Sidebar } from '@/components/Sidebar'
import Link from 'next/link'

function SharePageContent({ id }: { id: string }) {
  const [parsedData, setParsedData] = useState<SiteHealthData | null>(null)
  const [rawInput, setRawInput] = useState<string>('')
  const [activeSection, setActiveSection] = useState('summary')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch data from API using the ID
        const response = await fetch(`/api/share/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Report not found. The share link may be invalid or expired.')
          } else {
            setError('Failed to load report. Please try again later.')
          }
          return
        }

        const { data, rawInput } = await response.json()
        setParsedData(data)
        setRawInput(rawInput || '')
      } catch (err) {
        setError('Failed to load report. Please check your connection and try again.')
        console.error('Error loading share data:', err)
      }
    }

    if (id) {
      loadData()
    } else {
      setError('Invalid share link. Missing report ID.')
    }
  }, [id])

  if (error) {
    return (
      <div className="min-h-screen">
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
          <div className="max-w-full mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Site Health Doctor
              </h1>
              <DarkModeToggle />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-red-600 dark:text-red-400">❌</span>
              <span className="font-medium text-red-900 dark:text-red-100">{error}</span>
            </div>
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors"
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
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Site Health Report
            </h1>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Create New
              </Link>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

        <main className="h-[calc(100vh-64px)] overflow-hidden">
          <div className="flex h-full">
            <div className="w-64 flex-shrink-0">
              <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="h-full bg-white dark:bg-gray-900 p-8">
                <div className="max-w-4xl mx-auto">
                  {activeSection === 'summary' && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Health Summary</h2>
                      <div className="overflow-y-auto">
                        <SummaryPanelContent data={parsedData.summary} />
                      </div>
                    </div>
                  )}
              
              {activeSection === 'wordpress' && (
                <div>
                      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">WordPress Environment</h2>
                      <div className="space-y-2 overflow-y-auto">
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
                      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Server Environment</h2>
                      <div className="space-y-2 overflow-y-auto">
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
                      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Active Theme</h2>
                      <div className="space-y-2 overflow-y-auto">
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
                      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Active Plugins ({parsedData.plugins.length})</h2>
                      <div className="space-y-2 overflow-y-auto">
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
                      <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Database</h2>
                      <div className="space-y-2 overflow-y-auto">
                    {Object.entries(parsedData.database).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}</div>
                        <div className="text-sm text-gray-900 dark:text-gray-100 break-words">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeSection === 'raw' && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Raw Site Health</h2>
                  <div className="space-y-2 overflow-y-auto">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(rawInput)
                            alert('Raw data copied to clipboard!')
                          } catch (err) {
                            console.error('Failed to copy:', err)
                          }
                        }}
                        className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                      >
                        Copy Raw Data
                      </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 border border-gray-200 dark:border-gray-700">
                      <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words leading-relaxed">
                        {rawInput}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}

export default function SharePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <SharePageContent id={params.id} />
    </Suspense>
  )
}
