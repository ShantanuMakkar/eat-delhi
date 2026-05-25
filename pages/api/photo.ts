import type { NextApiRequest, NextApiResponse } from 'next'

// Proxies Google Places photo requests so the API key stays server-side
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ref = typeof req.query.ref === 'string' ? req.query.ref : null

  if (!ref || !process.env.GOOGLE_PLACES_KEY) {
    return res.status(400).json({ error: 'Missing photo ref or API key' })
  }

  try {
    const url =
      `https://places.googleapis.com/v1/${ref}/media` +
      `?maxHeightPx=480&maxWidthPx=640&key=${process.env.GOOGLE_PLACES_KEY}`

    const photoRes = await fetch(url)

    if (!photoRes.ok) {
      return res.status(photoRes.status).json({ error: 'Photo fetch failed' })
    }

    const contentType = photoRes.headers.get('content-type') ?? 'image/jpeg'
    const buffer = await photoRes.arrayBuffer()

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate')
    res.setHeader('Content-Type', contentType)
    res.send(Buffer.from(buffer))
  } catch (err) {
    console.error('Photo proxy error:', err)
    res.status(500).json({ error: 'Internal error' })
  }
}