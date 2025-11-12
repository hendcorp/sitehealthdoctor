'use client'

import { useState } from 'react'
import { parseSiteHealth, stripSensitiveData, SiteHealthData } from '@/lib/parser'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { SummaryPanelContent } from '@/components/SummaryPanel'
import { Sidebar } from '@/components/Sidebar'

export default function Home() {
  const [rawInput, setRawInput] = useState('')
  const [parsedData, setParsedData] = useState<SiteHealthData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [stripSensitive, setStripSensitive] = useState(true)
  const [activeSection, setActiveSection] = useState('summary')

  const handleParse = () => {
    if (!rawInput.trim()) {
      setError('Please paste your Site Health info')
      return
    }

    try {
      setError(null)
      const parsed = parseSiteHealth(rawInput)
      console.log('Parsed data:', parsed)
      console.log('WordPress data:', parsed.wordpress)
      console.log('Server data:', parsed.server)
      console.log('Plugins:', parsed.plugins)
      setParsedData(parsed)
    } catch (err) {
      setError('Failed to parse Site Health info. Please check the format.')
      console.error(err)
    }
  }

  const generateShortId = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const compressAndEncode = async (data: SiteHealthData): Promise<string> => {
    const jsonString = JSON.stringify(data)
    
    // Use CompressionStream API if available (modern browsers)
    if (typeof CompressionStream !== 'undefined') {
      try {
        const stream = new CompressionStream('gzip')
        const writer = stream.writable.getWriter()
        const reader = stream.readable.getReader()
        
        const encoder = new TextEncoder()
        writer.write(encoder.encode(jsonString))
        writer.close()
        
        const chunks: Uint8Array[] = []
        let done = false
        
        while (!done) {
          const { value, done: readerDone } = await reader.read()
          done = readerDone
          if (value) chunks.push(value)
        }
        
        const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
        let offset = 0
        for (const chunk of chunks) {
          compressed.set(chunk, offset)
          offset += chunk.length
        }
        
        // Convert to base64
        const binaryString = Array.from(compressed).map(b => String.fromCharCode(b)).join('')
        return btoa(binaryString)
      } catch (err) {
        console.warn('Compression failed, using uncompressed:', err)
      }
    }
    
    // Fallback: use uncompressed base64
    return btoa(unescape(encodeURIComponent(jsonString)))
  }

  const handleGenerateShareLink = async () => {
    if (!parsedData) {
      setError('Please parse the Site Health info first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const dataToShare = stripSensitive ? stripSensitiveData(parsedData) : parsedData
      
      // Generate short ID and compress data
      const shortId = generateShortId()
      const encodedData = await compressAndEncode(dataToShare)
      const link = `${window.location.origin}/share/${shortId}#${encodedData}`
      setShareLink(link)

      // Copy to clipboard (silently, no popup)
      try {
        await navigator.clipboard.writeText(link)
      } catch (clipboardErr) {
        console.warn('Failed to copy to clipboard:', clipboardErr)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate share link. Please try again.'
      setError(errorMessage)
      console.error('Error generating share link:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Site Health Doctor
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Simple, modern WordPress Site Health viewer
              </p>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!parsedData ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Paste Site Health Info
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Copy your Site Health info from WordPress (Tools → Site Health → Info → Copy site info to clipboard) and paste it below.
              </p>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder="Paste your Site Health info here..."
                className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-accent focus:border-transparent resize-none font-mono text-sm"
              />
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleParse}
                className="mt-4 px-6 py-3 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                Parse & View Report
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setParsedData(null)
                  setRawInput('')
                  setShareLink(null)
                  setError(null)
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ← New Report
              </button>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={stripSensitive}
                    onChange={(e) => setStripSensitive(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
                  />
                  Strip sensitive data
                </label>
                <button
                  onClick={handleGenerateShareLink}
                  disabled={isLoading}
                  className="px-6 py-2 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Generating...' : 'Generate Share Link'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 dark:text-red-400">❌</span>
                  <span className="font-medium text-red-900 dark:text-red-100">
                    {error}
                  </span>
                </div>
              </div>
            )}

            {shareLink && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600 dark:text-green-400">✅</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    Share link generated and copied to clipboard!
                  </span>
                </div>
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="w-full p-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded text-sm text-gray-900 dark:text-gray-100"
                  onClick={(e) => e.currentTarget.select()}
                />
              </div>
            )}

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
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{key}</div>
                            <div className="text-xs text-gray-900 dark:text-gray-100 break-words">{value}</div>
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
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{key}</div>
                            <div className="text-xs text-gray-900 dark:text-gray-100 break-words">{value}</div>
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
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{key}</div>
                            <div className="text-xs text-gray-900 dark:text-gray-100 break-words">{value}</div>
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
                    </div>
                  )}
                  
                  {activeSection === 'database' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Database</h2>
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {Object.entries(parsedData.database).map(([key, value]) => (
                          <div key={key} className="flex flex-col gap-1 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{key}</div>
                            <div className="text-xs text-gray-900 dark:text-gray-100 break-words">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {activeSection === 'raw' && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Raw Site Health</h2>
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
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
                            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                          >
                            Copy Raw Data
                          </button>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded p-3 border border-gray-200 dark:border-gray-700">
                          <pre className="text-xs text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words leading-relaxed">
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
        )}
      </main>

      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Made for support teams who care about clarity
        </div>
      </footer>
    </div>
  )
}

