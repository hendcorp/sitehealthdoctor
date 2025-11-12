import Link from 'next/link'
import { DarkModeToggle } from '@/components/DarkModeToggle'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Site Health Doctor
            </h1>
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Report Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The report you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors shadow-sm inline-block"
          >
            Create New Report
          </Link>
        </div>
      </main>
    </div>
  )
}

