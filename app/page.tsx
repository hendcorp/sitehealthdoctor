'use client'

import { useState } from 'react'
import { parseSiteHealth, stripSensitiveData, SiteHealthData } from '@/lib/parser'
import { SummaryPanel } from '@/components/SummaryPanel'
import { DataDisplay } from '@/components/DataDisplay'
import { DarkModeToggle } from '@/components/DarkModeToggle'

export default function Home() {
  const [rawInput, setRawInput] = useState('')
  const [parsedData, setParsedData] = useState<SiteHealthData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [stripSensitive, setStripSensitive] = useState(true)

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

  const handleGenerateShareLink = async () => {
    if (!parsedData) {
      setError('Please parse the Site Health info first')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const dataToShare = stripSensitive ? stripSensitiveData(parsedData) : parsedData
      
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToShare),
      })

      if (!response.ok) {
        throw new Error('Failed to generate share link')
      }

      const { id } = await response.json()
      const link = `${window.location.origin}/share/${id}`
      setShareLink(link)

      // Copy to clipboard
      await navigator.clipboard.writeText(link)
      alert('Share link copied to clipboard!')
    } catch (err) {
      setError('Failed to generate share link. Please try again.')
      console.error(err)
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

            <SummaryPanel data={parsedData.summary} />
            <DataDisplay data={parsedData} />
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

