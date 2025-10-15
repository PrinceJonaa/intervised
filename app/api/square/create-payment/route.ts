import { NextRequest, NextResponse } from 'next/server'
import { SquareClient, SquareEnvironment } from 'square'

// Initialize Square client
const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: SquareEnvironment.Production, // Change to SquareEnvironment.Sandbox for testing
})

export async function POST(request: NextRequest) {
  try {
    const { sourceId, amount, currency = 'USD', note } = await request.json()

    if (!sourceId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceId and amount' },
        { status: 400 }
      )
    }

    const response = await client.payments.create({
      sourceId,
      idempotencyKey: crypto.randomUUID(),
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)), // Convert dollars to cents
        currency,
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      note: note || 'Intervised Service Payment',
    })

    return NextResponse.json({ payment: response.payment }, { status: 200 })
  } catch (error: any) {
    console.error('Payment creation error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Payment processing failed',
        details: error.errors || []
      },
      { status: 500 }
    )
  }
}
