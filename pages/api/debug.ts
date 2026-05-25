import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = process.env.GOOGLE_PLACES_KEY
  if (!key) return res.status(200).json({ error: 'No API key' })

  const googleRes = await fetch(
    'https://places.googleapis.com/v1/places:searchNearby',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos',
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: {
            center: { latitude: 28.5494, longitude: 77.2001 },
            radius: 1200,
          },
        },
        includedTypes: ['restaurant'],
        maxResultCount: 2,
      }),
    }
  )

  const data = await googleRes.json()
  // Show us exactly what the photos field looks like
  return res.status(200).json(data)
}