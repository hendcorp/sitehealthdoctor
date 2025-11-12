import { NextRequest, NextResponse } from 'next/server'
import { getReport } from '@/lib/store'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const report = await getReport(id)
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ data: report.data })
  } catch (error) {
    console.error('Error retrieving report:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to retrieve report: ${errorMessage}` },
      { status: 500 }
    )
  }
}

