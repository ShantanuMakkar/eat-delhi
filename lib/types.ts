export type Place = {
  // Core identity
  id:           string
  name:         string
  region:       string
  neighbourhood:string

  // Classification
  cuisine:      string[]
  vibe:         string[]
  type:         string        // e.g. "Restaurant", "Cafe", "Bakery"

  // Pricing — priceLevel used by PlaceCard for dots
  price:        number        // 1–4 (curated alias)
  priceLevel:   number        // 1–4 (Google / PlaceCard uses this)

  // Ratings — ratingCount is always a NUMBER (PlaceCard formats it)
  rating:       number
  ratingCount:  number

  // Location
  location:     string        // short label e.g. "Hauz Khas Village"
  address:      string        // full formatted address from Google
  lat:          number
  lng:          number

  // Content
  intro:        string
  summary:      string        // PlaceCard shows this — same as intro for curated
  famous:       string
  tip:          string
  keywords:     string[]

  // Hours
  hours:        string        // full week hours
  hoursToday:   string        // just today e.g. "9:00 AM – 11:00 PM"
  isOpenNow:    boolean | null// null = unknown

  // Photo — PlaceCard builds URL as /api/photo?name=<photoName>
  photoName?:   string        // raw Google photo name
  photo?:       string        // fallback full URL (Unsplash etc)

  // Links
  googleMapsUri?:string

  // Flags
  mustTry?:     boolean
}

export type ActiveFilters = {
  regions:   string[]
  cuisines:  string[]
  vibes:     string[]
  minRating: number
}