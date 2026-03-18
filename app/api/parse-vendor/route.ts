import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM_PROMPT = `You are a vendor extraction engine for a Singapore wedding budget app.
Extract structured data from informal user inputs about wedding vendors.
Return valid JSON only. No explanations, no markdown.

OUTPUT FORMAT:
{
  "vendor_name": string | null,
  "category": string | null,
  "total_quoted": number | null,
  "is_plus_plus": boolean,
  "deposit_amount": number | null,
  "deposit_paid": boolean,
  "card_used": string | null,
  "payment_notes": string | null,
  "confidence": number
}

RULES:
1. Amount: Convert shorthand (5k→5000, 2.8k→2800). If "per table", multiply by table count if given.
2. GST: If input mentions "++" or "plus plus", set is_plus_plus=true.
3. Category: Map to one of: venue_banquet, bridal_attire, photography, videography, decor_florals, hair_makeup, rings_jewelry, wedding_car, dowry_guodali, invitations_stationery, entertainment, favors_gifts, misc_buffer. If unclear→null.
4. Card: Extract whatever the user said, keep raw text lowercase. If not mentioned→null.
5. Deposit: Look for "deposit", "downpayment", "paid today". If mentioned, extract amount and set deposit_paid accordingly.
6. Confidence: 0.9+ clear input | 0.6-0.8 partial | <0.5 too vague.

DO NOT: invent amounts, guess vendors, output anything outside JSON.`

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'input is required' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: input }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = JSON.parse(text)

    return NextResponse.json(result)
  } catch (error) {
    console.error('parse-vendor error:', error)
    return NextResponse.json({ error: 'Failed to parse vendor' }, { status: 500 })
  }
}
