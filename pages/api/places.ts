import type { NextApiRequest, NextApiResponse } from 'next'
import { PLACES } from '../../lib/places'

// BILLING NOTES:
// - Google Places Nearby Search = $0.032 per call
// - We use 3 circles per region max = 3 calls per region fetch
// - Cache-Control: s-maxage=86400 = Vercel CDN caches for 24 hours
// - So each region costs $0.096 and is only fetched ONCE per day
// - 11 regions × $0.096 = $1.056 per day MAX (if all regions hit)
// - Monthly worst case: ~$31 — well within $200 free credit
// - Typical demo usage (few regions, repeat visitors): < $1/month

// 3 circles per region — enough to get 60 places, not so many it burns quota
// Radius 1200m — larger circles mean fewer calls needed for same coverage
const REGION_GRID: Record<string, { lat: number; lng: number }[]> = {
  cp:           [{ lat: 28.6315, lng: 77.2167 }, { lat: 28.6355, lng: 77.2100 }, { lat: 28.6270, lng: 77.2230 }],
  hauz:         [{ lat: 28.5494, lng: 77.2001 }, { lat: 28.5560, lng: 77.2080 }, { lat: 28.5420, lng: 77.1930 }],
  south:        [{ lat: 28.5245, lng: 77.1855 }, { lat: 28.5350, lng: 77.2000 }, { lat: 28.5150, lng: 77.1750 }],
  north:        [{ lat: 28.7041, lng: 77.1025 }, { lat: 28.6900, lng: 77.1200 }, { lat: 28.7150, lng: 77.1300 }],
  central:      [{ lat: 28.6268, lng: 77.2311 }, { lat: 28.6350, lng: 77.2400 }, { lat: 28.6180, lng: 77.2230 }],
  chanakyapuri: [{ lat: 28.5994, lng: 77.1753 }, { lat: 28.5920, lng: 77.1870 }, { lat: 28.6060, lng: 77.1660 }],
  majnu:        [{ lat: 28.7196, lng: 77.2309 }, { lat: 28.7220, lng: 77.2370 }, { lat: 28.7165, lng: 77.2250 }],
  lajpat:       [{ lat: 28.5677, lng: 77.2434 }, { lat: 28.5610, lng: 77.2360 }, { lat: 28.5740, lng: 77.2510 }],
  saket:        [{ lat: 28.5245, lng: 77.2066 }, { lat: 28.5320, lng: 77.2150 }, { lat: 28.5170, lng: 77.1990 }],
  olddelhi:     [{ lat: 28.6507, lng: 77.2334 }, { lat: 28.6570, lng: 77.2420 }, { lat: 28.6440, lng: 77.2260 }],
  nehru:        [{ lat: 28.5653, lng: 77.2373 }, { lat: 28.5570, lng: 77.2460 }, { lat: 28.5740, lng: 77.2290 }],
  all:          [{ lat: 28.6315, lng: 77.2167 }, { lat: 28.5494, lng: 77.2001 }, { lat: 28.6507, lng: 77.2334 }],
}

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.rating',
  'places.userRatingCount',
  'places.photos',
  'places.regularOpeningHours',
  'places.priceLevel',
  'places.location',
  'places.formattedAddress',
  'places.primaryTypeDisplayName',
  'places.editorialSummary',
].join(',')

async function fetchCircle(apiKey: string, center: { lat: number; lng: number }): Promise<any[]> {
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: { latitude: center.lat, longitude: center.lng },
            radius: 1200, // larger radius = fewer circles needed = fewer API calls
          },
        },
        includedTypes: ['restaurant', 'cafe', 'meal_takeaway', 'bakery'],
        rankPreference: 'POPULARITY',
        maxResultCount: 20, // Google's hard cap per call
      }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.places ?? []
  } catch {
    return []
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const region = typeof req.query.region === 'string' ? req.query.region : 'all'

  // No API key → curated fallback (free)
  if (!process.env.GOOGLE_PLACES_KEY) {
    const data = region === 'all' ? PLACES : PLACES.filter(p => p.region === region)
    return res.status(200).json(data)
  }

  const circles = REGION_GRID[region] ?? REGION_GRID['all']

  try {
    // Fetch all circles in parallel (3 calls max)
    const results = await Promise.all(
      circles.map(c => fetchCircle(process.env.GOOGLE_PLACES_KEY!, c))
    )

    // Deduplicate by Google place ID
    const seen = new Set<string>()
    const merged: any[] = []
    for (const batch of results) {
      for (const place of batch) {
        if (place.id && !seen.has(place.id)) {
          seen.add(place.id)
          merged.push(place)
        }
      }
    }

    // Sort: rating desc, then review count desc
    merged.sort((a, b) => {
      const r = (b.rating ?? 0) - (a.rating ?? 0)
      return r !== 0 ? r : (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0)
    })

    console.log(`[places] ${region}: ${circles.length} calls → ${merged.length} unique places`)

    // Cache on Vercel's CDN for 24h — same region fetched 1000x still = 3 Google calls/day
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600')
    return res.status(200).json(merged)
  } catch (err) {
    console.error('[places] error:', err)
    const fallback = region === 'all' ? PLACES : PLACES.filter(p => p.region === region)
    return res.status(200).json(fallback)
  }
}