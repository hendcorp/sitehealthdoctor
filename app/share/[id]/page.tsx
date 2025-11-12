import { getReport } from '@/lib/store'
import { notFound } from 'next/navigation'
import { SummaryPanel } from '@/components/SummaryPanel'
import { DataDisplay } from '@/components/DataDisplay'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SharePage({ params }: { params: { id: string } }) {
  const report = await getReport(params.id)

  if (!report) {
    notFound()
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
                Shared report • {new Date(report.createdAt).toLocaleDateString()}
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
        <SummaryPanel data={report.data.summary} />
        <DataDisplay data={report.data} />
      </main>

      <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Made for support teams who care about clarity
        </div>
      </footer>
    </div>
  )
}

