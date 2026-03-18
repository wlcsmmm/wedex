import { NextRequest, NextResponse } from 'next/server'
import { plusPlusToNett, plusToNett } from '@/lib/gst'

export async function POST(request: NextRequest) {
  try {
    const { amount, type } = await request.json()

    if (typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount must be a number' }, { status: 400 })
    }

    const nett = type === 'plus' ? plusToNett(amount) : plusPlusToNett(amount)

    return NextResponse.json({ amount, type: type ?? 'plus_plus', nett })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
