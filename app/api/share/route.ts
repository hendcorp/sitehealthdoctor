import { NextRequest, NextResponse } from 'next/server'
import { saveReport } from '@/lib/store'
import { SiteHealthData } from '@/lib/parser'

export async function POST(request: NextRequest) {
  try {
    const data: SiteHealthData = await request.json()
    const id = await saveReport(data)
    return NextResponse.json({ id })
  } catch (error) {
    console.error('Error saving report:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Failed to save report: ${errorMessage}` },
      { status: 500 }
    )
  }
}

