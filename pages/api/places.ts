import type { NextApiRequest, NextApiResponse } from 'next';
import { PLACES } from '../../lib/places';
import type { Place } from '../../lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Place[]>
) {
  // ── If no Google API key, return curated data (works out of the box) ──
  if (!process.env.GOOGLE_PLACES_KEY) {
    return res.status(200).json(PLACES);
  }

  // ── Otherwise fetch live data from Google Places ──
  try {
    const response = await fetch(
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
          ].join(','),
        },
        body: JSON.stringify({
          locationRestriction: {
            circle: {
              center: { latitude: 28.6139, longitude: 77.2090 },
              radius: 8000,
            },
          },
          includedTypes: ['restaurant', 'cafe'],
          rankPreference: 'POPULARITY',
          maxResultCount: 20,
        }),
      }
    );

    const data = await response.json();

    // Cache response for 24 hours on the CDN
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json(data.places ?? PLACES);
  } catch (err) {
    console.error('Google Places API error:', err);
    // Graceful fallback to curated data on any error
    return res.status(200).json(PLACES);
  }
}
