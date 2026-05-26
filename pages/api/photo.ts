import type { NextApiRequest, NextApiResponse } from 'next'

// Billing note: Place Photos = $0.007 per call
// Cache-Control: s-maxage=86400 means Vercel CDN caches each photo 24h
// Same photo requested 1000x = still 1 Google call = $0.007

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ref = typeof req.query.name === 'string' ? req.query.name : null

  if (!ref) {
    return res.status(400).json({ error: 'Missing ref param' })
  }

  if (!process.env.GOOGLE_PLACES_KEY) {
    return res.status(400).json({ error: 'No API key configured' })
  }

  try {
    // ref is the full photo name e.g. "places/ChIJ.../photos/Ab43m-..."
    // Google Places (New) photo URL format:
    const url = `https://places.googleapis.com/v1/${ref}/media?maxHeightPx=480&maxWidthPx=640&key=${process.env.GOOGLE_PLACES_KEY}`

    const photoRes = await fetch(url)

    if (!photoRes.ok) {
      console.error(`Photo fetch failed: ${photoRes.status} for ref: ${ref.slice(0, 50)}`)
      return res.status(photoRes.status).json({ error: 'Photo fetch failed' })
    }

    const contentType = photoRes.headers.get('content-type') ?? 'image/jpeg'
    const buffer = await photoRes.arrayBuffer()

    // Cache aggressively — photos don't change
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=3600')
    res.setHeader('Content-Type', contentType)
    res.send(Buffer.from(buffer))
  } catch (err) {
    console.error('Photo proxy error:', err)
    res.status(500).json({ error: 'Internal error' })
  }
}