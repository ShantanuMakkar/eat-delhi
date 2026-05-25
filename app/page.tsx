'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { PlaceCard } from '@/components/PlaceCard'
import { FilterBar } from '@/components/FilterBar'
import { SearchBar } from '@/components/SearchBar'
import { PLACES } from '@/lib/places'
import type { ActiveFilters, Place } from '@/lib/types'

const EMPTY: ActiveFilters = {
  regions: [],
  cuisines: [],
  vibes: [],
  minRating: 0,
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-pulse">
      <div className="h-48 bg-neutral-100 dark:bg-neutral-800" />
      <div className="p-4 space-y-2">
        <div className="h-6 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-4/5 bg-neutral-100 dark:bg-neutral-800 rounded" />
      </div>
    </div>
  )
}

// Normalise a raw Google Places API object into our Place shape
function normaliseGooglePlace(item: any, region: string, idx: number): Place {
  // Already a curated Place (fallback) — return as-is
  if (typeof item.id === 'string' && item.name && item.keywords) return item as Place

  const ratingCount = item.userRatingCount
    ? item.userRatingCount >= 1000
      ? `${(item.userRatingCount / 1000).toFixed(1)}k`
      : String(item.userRatingCount)
    : '—'

  // Map Google's priceLevel to 1-4
  const priceMap: Record<string, number> = {
    PRICE_LEVEL_FREE: 1,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4,
  }

  // Guess cuisine from Google's primaryType
  const primaryType = (item.primaryTypeDisplayName?.text ?? '').toLowerCase()
  const cuisine: string[] = []
  if (primaryType.includes('cafe') || primaryType.includes('coffee')) cuisine.push('cafe')
  if (primaryType.includes('indian') || primaryType.includes('north indian') || primaryType.includes('south indian')) cuisine.push('indian')
  if (primaryType.includes('chinese') || primaryType.includes('asian') || primaryType.includes('tibetan') || primaryType.includes('japanese')) cuisine.push('asian')
  if (primaryType.includes('italian') || primaryType.includes('continental') || primaryType.includes('western')) cuisine.push('continental')
  if (primaryType.includes('street') || primaryType.includes('fast food') || primaryType.includes('snack')) cuisine.push('street')
  if (cuisine.length === 0) cuisine.push('indian') // default for Delhi

  return {
    id: item.id ?? `google-${idx}`,
    name: item.displayName?.text ?? 'Unknown',
    region,
    neighbourhood: region,
    cuisine,
    vibe: ['casual'], // Google doesn't give us vibe — default
    price: priceMap[item.priceLevel] ?? 2,
    rating: item.rating ?? 0,
    ratingCount,
    location: item.formattedAddress ?? region,
    intro: item.editorialSummary?.text ?? `A popular spot in ${region}.`,
    famous: '',
    tip: '',
    hours: item.regularOpeningHours?.weekdayDescriptions?.[0] ?? 'See Google Maps for hours',
    lat: item.location?.latitude ?? 28.6139,
    lng: item.location?.longitude ?? 77.2090,
    photo: item.photos?.[0]
      ? `/api/photo?ref=${encodeURIComponent(item.photos[0].name)}`
      : undefined,
    keywords: [primaryType],
    mustTry: false,
  } satisfies Place
}

export default function Home() {
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY)
  const [query, setQuery] = useState('')

  // Raw Google data per region — keyed by region string
  const [googleCache, setGoogleCache] = useState<Record<string, Place[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track in-flight fetches to avoid duplicate requests
  const fetchingRef = useRef<Set<string>>(new Set())

  // Fetch a single region from our API route
  const fetchRegion = useCallback(async (region: string) => {
    if (fetchingRef.current.has(region)) return
    fetchingRef.current.add(region)

    try {
      const res = await fetch(`/api/places?region=${region}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw: any[] = await res.json()
      const places = raw.map((item, idx) => normaliseGooglePlace(item, region, idx))
      setGoogleCache(prev => ({ ...prev, [region]: places }))
    } catch (e: any) {
      console.error(`Failed to fetch region ${region}:`, e)
      setError('Some regions failed to load — showing available results.')
    } finally {
      fetchingRef.current.delete(region)
    }
  }, [])

  // When selected regions change, fetch any that aren't cached yet
  useEffect(() => {
    const regions = filters.regions.length > 0 ? filters.regions : ['all']
    const missing = regions.filter(r => !googleCache[r])

    if (missing.length === 0) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    Promise.all(missing.map(r => fetchRegion(r))).finally(() => {
      setLoading(false)
    })
  }, [filters.regions, fetchRegion, googleCache])

  // Build the source pool from cached Google data
  const sourcePool = useMemo<Place[]>(() => {
    const regions = filters.regions.length > 0 ? filters.regions : ['all']

    // Collect all places from selected regions
    const all: Place[] = []
    const seen = new Set<string>()

    for (const region of regions) {
      const regionPlaces = googleCache[region] ?? []
      for (const p of regionPlaces) {
        if (!seen.has(p.id)) {
          seen.add(p.id)
          all.push(p)
        }
      }
    }

    // If no Google data yet, fall back to curated
    if (all.length === 0) {
      const fallback = filters.regions.length === 0
        ? PLACES
        : PLACES.filter(p => filters.regions.includes(p.region))
      return fallback
    }

    return all
  }, [googleCache, filters.regions])

  // Apply ALL filters + search on top of the source pool
  const filtered = useMemo<Place[]>(() => {
    const q = query.toLowerCase().trim()

    return sourcePool.filter((p) => {
      // ── Cuisine (OR logic within group) ──────────────────────────────────
      const cuisineOk =
        filters.cuisines.length === 0 ||
        filters.cuisines.some(c => p.cuisine.includes(c))

      // ── Vibe (OR logic within group) ─────────────────────────────────────
      const vibeOk =
        filters.vibes.length === 0 ||
        filters.vibes.some(v => p.vibe.includes(v))

      // ── Rating ───────────────────────────────────────────────────────────
      const ratingOk = filters.minRating === 0 || p.rating >= filters.minRating

      // ── Full-text search ─────────────────────────────────────────────────
      const searchOk =
        !q ||
        [
          p.name,
          p.location,
          p.neighbourhood,
          p.intro,
          p.famous,
          p.tip,
          ...p.cuisine,
          ...p.vibe,
          ...(p.keywords ?? []),
        ].some(field => field.toLowerCase().includes(q))

      return cuisineOk && vibeOk && ratingOk && searchOk
    })
  }, [sourcePool, filters.cuisines, filters.vibes, filters.minRating, query])

  const isLive = filters.regions.length > 0 && filters.regions.some(r => googleCache[r])

  return (
    <main className="max-w-6xl mx-auto px-5 py-12">

      {/* Hero */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 mb-2">
          New Delhi · Live via Google Maps
        </p>
        <h1 className="font-['Bebas_Neue'] text-[60px] md:text-[78px] leading-[0.92]
                       tracking-wide text-neutral-900 dark:text-white mb-3">
          What are you<br />
          <span className="text-neutral-400 dark:text-neutral-500">hungry for?</span>
        </h1>
        <p className="text-sm text-neutral-400 font-light">
          Select one or more neighbourhoods · combine with any filter · all work together
        </p>
      </div>

      {/* Search */}
      <SearchBar value={query} onChange={setQuery} />

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 mb-6" />

      {/* Filters */}
      <FilterBar
        filters={filters}
        onChange={setFilters}
        totalVisible={filtered.length}
        totalAll={sourcePool.length}
        loading={loading}
      />

      {/* Status bar */}
      <div className="flex items-center gap-3 mb-6 min-h-[20px]">
        {loading && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">
              Fetching from Google Maps...
            </span>
          </div>
        )}
        {isLive && !loading && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[11px] uppercase tracking-wider text-neutral-400">
              Live Google data · {sourcePool.length} places found
              {filters.regions.length > 1 && ` across ${filters.regions.length} areas`}
            </span>
          </div>
        )}
        {error && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400">{error}</span>
        )}
      </div>

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 mb-6" />

      {/* Grid */}
      {loading && sourcePool.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((place, i) => (
            <PlaceCard key={place.id} place={place} index={i} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="font-['Bebas_Neue'] text-[28px] tracking-wide
                        text-neutral-300 dark:text-neutral-600">
            Nothing found — try a different craving
          </p>
          <button
            onClick={() => { setFilters(EMPTY); setQuery('') }}
            className="mt-4 text-sm text-neutral-400 underline underline-offset-4
                       hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            Clear everything
          </button>
        </div>
      )}
    </main>
  )
}