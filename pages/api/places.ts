import type { NextApiRequest, NextApiResponse } from 'next'
import { PLACES } from '../../lib/places'

const REGION_COORDS: Record<string, { lat: number; lng: number; radius: number }> = {
  cp:           { lat: 28.6315, lng: 77.2167, radius: 2000 },
  south:        { lat: 28.5245, lng: 77.1855, radius: 5000 },
  north:        { lat: 28.7041, lng: 77.1025, radius: 5000 },
  central:      { lat: 28.6268, lng: 77.2311, radius: 3000 },
  chanakyapuri: { lat: 28.5994, lng: 77.1753, radius: 2500 },
  majnu:        { lat: 28.7196, lng: 77.2309, radius: 1000 },
  hauz:         { lat: 28.5494, lng: 77.2001, radius: 2000 },
  lajpat:       { lat: 28.5677, lng: 77.2434, radius: 2000 },
  saket:        { lat: 28.5245, lng: 77.2066, radius: 2000 },
  olddelhi:     { lat: 28.6507, lng: 77.2334, radius: 2000 },
  nehru:        { lat: 28.5653, lng: 77.2373, radius: 2500 },
  all:          { lat: 28.6139, lng: 77.2090, radius: 15000 },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const region = typeof req.query.region === 'string' ? req.query.region : 'all'

  // No API key — return curated fallback
  if (!process.env.GOOGLE_PLACES_KEY) {
    const data = region === 'all'
      ? PLACES
      : PLACES.filter((p) => p.region === region)
    return res.status(200).json(data)
  }

  const coords = REGION_COORDS[region] ?? REGION_COORDS['all']

  try {
    const googleRes = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_KEY,
          'X-Goog-FieldMask': [
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
          ].join(','),
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: {
              center: { latitude: coords.lat, longitude: coords.lng },
              radius: coords.radius,
            },
          },
          includedTypes: ['restaurant', 'cafe', 'meal_takeaway'],
          rankPreference: 'POPULARITY',
          maxResultCount: 20,
        }),
      }
    )

    const data = await googleRes.json()

    if (!data.places) {
      console.error('Google Places error:', JSON.stringify(data))
      // Graceful fallback
      const fallback = region === 'all'
        ? PLACES
        : PLACES.filter((p) => p.region === region)
      return res.status(200).json(fallback)
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
    return res.status(200).json(data.places)
  } catch (err) {
    console.error('Google Places fetch error:', err)
    const fallback = region === 'all'
      ? PLACES
      : PLACES.filter((p) => p.region === region)
    return res.status(200).json(fallback)
  }
}