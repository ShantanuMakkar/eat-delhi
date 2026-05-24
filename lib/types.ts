export type Place = {
  id: string;
  name: string;
  region: string;
  neighbourhood: string;
  cuisine: string[];
  vibe: string[];
  price: number;
  rating: number;
  ratingCount: string;
  location: string;
  intro: string;
  famous: string;       // comma-separated dishes / keywords for search
  tip: string;
  hours: string;
  lat: number;
  lng: number;
  photo?: string;
  mustTry?: boolean;
  keywords: string[];   // extra search terms: ingredients, dish names, moods
};

export type ActiveFilters = {
  regions: string[];
  cuisines: string[];
  vibes: string[];
  minRating: number;    // 0 = no filter
};