export type Place = {
  id:            string
  name:          string
  region:        string
  neighbourhood: string
  cuisine:       string[]
  vibe:          string[]
  type:          string
  price:         number
  priceLevel:    number
  rating:        number
  ratingCount:   number
  location:      string
  address:       string
  lat:           number
  lng:           number
  intro:         string
  summary:       string
  famous:        string
  tip:           string
  keywords:      string[]
  hours:         string
  hoursToday:    string
  isOpenNow:     boolean | null
  photoName?:    string
  photo?:        string
  googleMapsUri?: string
  mustTry?:      boolean
}

export type SortOption = 'rating' | 'reviews' | 'price_asc' | 'price_desc'

export type ActiveFilters = {
  regions:    string[]
  cuisines:   string[]
  vibes:      string[]
  prices:     number[]      // 1 | 2 | 3 | 4
  minRating:  number
  openNow:    boolean
  sort:       SortOption
}
