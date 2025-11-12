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
    return NextResponse.json(
      { error: 'Failed to save report' },
      { status: 500 }
    )
  }
}

