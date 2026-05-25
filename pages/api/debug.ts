import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = process.env.GOOGLE_PLACES_KEY

  // Step 1 — is the key present?
  if (!key) {
    return res.status(200).json({
      step: 'FAIL',
      issue: 'GOOGLE_PLACES_KEY is undefined — env var not loaded on Vercel',
      fix: 'Go to Vercel → Settings → Environment Variables → add GOOGLE_PLACES_KEY → Redeploy',
    })
  }

  // Step 2 — what does the key look like?
  const keyPreview = `${key.slice(0, 8)}...${key.slice(-4)}`

  // Step 3 — actually call Google and return the raw response
  try {
    const googleRes = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.rating',
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: {
              center: { latitude: 28.5494, longitude: 77.2001 },
              radius: 2000,
            },
          },
          includedTypes: ['restaurant'],
          maxResultCount: 3,
        }),
      }
    )

    const raw = await googleRes.json()

    return res.status(200).json({
      step: 'GOOGLE_CALLED',
      keyPresent: true,
      keyPreview,
      googleStatus: googleRes.status,
      googleResponse: raw,  // <-- this tells us everything
    })
  } catch (err: any) {
    return res.status(200).json({
      step: 'FETCH_ERROR',
      keyPresent: true,
      keyPreview,
      error: err.message,
    })
  }
}