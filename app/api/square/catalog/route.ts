import { NextRequest, NextResponse } from 'next/server'
import { SquareClient, SquareEnvironment } from 'square'

const client = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
  environment: SquareEnvironment.Production,
})

// Your service offerings matching the 5 pillars
const INTERVISED_SERVICES = [
  {
    id: 'creative',
    name: '🎤 Creative Services',
    description: 'Videography, photography, music production, BTS content',
    price: 50000, // $500.00 in cents
    category: 'CREATIVE',
  },
  {
    id: 'tech',
    name: '🧠 Tech Solutions', 
    description: 'AI bots, OBS setups, automation flows, tutorials',
    price: 30000, // $300.00 in cents
    category: 'TECH',
  },
  {
    id: 'captions',
    name: '📝 Captions & Content',
    description: 'VCDF packs, hashtags, hooks, caption optimization',
    price: 15000, // $150.00 in cents
    category: 'CONTENT',
  },
  {
    id: 'social',
    name: '📱 Social Media Growth',
    description: 'Instagram growth, scheduling, virality optimization',
    price: 25000, // $250.00 in cents
    category: 'SOCIAL',
  },
  {
    id: 'ministry',
    name: '🙏 Ministry Support',
    description: 'Church tech, livestreams, kid kits, worship content',
    price: 40000, // $400.00 in cents
    category: 'MINISTRY',
  },
]

export async function POST(request: NextRequest) {
  try {
    // Prepare all catalog objects in one batch
    const batches = [
      // Category object
      {
        type: 'CATEGORY',
        id: '#intervised-services-category',
        categoryData: {
          name: 'Intervised Services',
        },
      },
      // Service items
      ...INTERVISED_SERVICES.map(service => ({
        type: 'ITEM',
        id: `#${service.id}`,
        itemData: {
          name: service.name,
          description: service.description,
          categoryId: '#intervised-services-category',
          variations: [
            {
              type: 'ITEM_VARIATION',
              id: `#${service.id}-variation`,
              itemVariationData: {
                itemId: `#${service.id}`,
                name: 'Standard',
                pricingType: 'FIXED_PRICING',
                priceMoney: {
                  amount: BigInt(service.price),
                  currency: 'USD',
                },
              },
            },
          ],
        },
      })),
    ]

    // Upsert all objects at once
    const response = await client.catalog.batchUpsert({
      idempotencyKey: crypto.randomUUID(),
      batches: [
        {
          objects: batches as any,
        },
      ],
    })

    const results = response.objects?.map(obj => ({
      id: obj.id,
      type: obj.type,
      status: 'synced',
    }))

    return NextResponse.json({
      message: 'Services synced to Square Catalog',
      results,
    })
  } catch (error: any) {
    console.error('Catalog sync error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to sync catalog',
        details: error.errors || [],
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all catalog items - list() returns a Pageable
    const catalogResponse = await client.catalog.list({
      types: 'ITEM',
    })

    // Collect all items from the pageable
    const items: any[] = []
    for await (const item of catalogResponse) {
      items.push(item)
    }

    const services = items.map((item: any) => {
      const variation = item.itemData?.variations?.[0]
      const priceAmount = variation?.itemVariationData?.priceMoney?.amount
      
      return {
        id: item.id,
        name: item.itemData?.name,
        description: item.itemData?.description || '',
        price: priceAmount ? Number(priceAmount) / 100 : 0,
        duration: formatDuration(variation?.itemVariationData),
        variationId: variation?.id,
        reportingCategory: item.itemData?.reportingCategory || '',
      }
    })

    return NextResponse.json({ services })
  } catch (error: any) {
    console.error('Catalog fetch error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch catalog',
        details: error.errors || [],
      },
      { status: 500 }
    )
  }
}

// Helper function to format duration from Square data
function formatDuration(variationData: any): string {
  if (!variationData) return 'Varies'
  
  // Square stores service duration in their own format
  // For now, return a placeholder - you can enhance this based on Square's actual data structure
  return variationData.serviceDuration || 'Contact for details'
}
