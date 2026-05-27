'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { PlaceCard } from '@/components/PlaceCard'
import { FilterBar } from '@/components/FilterBar'
import { SearchBar } from '@/components/SearchBar'
import { PLACES } from '@/lib/places'
import type { ActiveFilters, Place } from '@/lib/types'

const EMPTY: ActiveFilters = {
  regions:   [],
  cuisines:  [],
  vibes:     [],
  prices:    [],
  minRating: 0,
  openNow:   false,
  sort:      'rating',
}

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800
                    overflow-hidden animate-pulse">
      <div className="h-44 bg-neutral-100 dark:bg-neutral-800" />
      <div className="p-4 space-y-2">
        <div className="h-6 w-2/3 bg-neutral-100 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-1/2 bg-neutral-100 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800 rounded" />
        <div className="h-3 w-4/5 bg-neutral-100 dark:bg-neutral-800 rounded" />
      </div>
    </div>
  )
}

const PRICE_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE:           1,
  PRICE_LEVEL_INEXPENSIVE:    1,
  PRICE_LEVEL_MODERATE:       2,
  PRICE_LEVEL_EXPENSIVE:      3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

function guessCuisine(primaryType: string): string[] {
  const t = primaryType.toLowerCase()
  const c: string[] = []
  if (t.includes('cafe') || t.includes('coffee') || t.includes('bakery'))                          c.push('cafe')
  if (t.includes('indian') || t.includes('north indian') || t.includes('south indian') || t.includes('punjabi')) c.push('indian')
  if (t.includes('chinese') || t.includes('asian') || t.includes('tibetan') || t.includes('japanese') || t.includes('thai')) c.push('asian')
  if (t.includes('italian') || t.includes('continental') || t.includes('western') || t.includes('pizza')) c.push('continental')
  if (t.includes('street') || t.includes('fast food') || t.includes('snack') || t.includes('chaat')) c.push('street')
  if (t.includes('fusion'))                                                                          c.push('fusion')
  return c.length > 0 ? c : ['indian']
}

function normaliseGooglePlace(item: any, region: string, idx: number): Place {
  if (Array.isArray(item.keywords)) return item as Place   // already curated

  const primaryType  = item.primaryTypeDisplayName?.text ?? 'Restaurant'
  const priceLevel   = PRICE_MAP[item.priceLevel] ?? 0
  const weekdays     = item.regularOpeningHours?.weekdayDescriptions ?? []
  const todayIdx     = new Date().getDay()
  const googleDay    = todayIdx === 0 ? 6 : todayIdx - 1
  const hoursRaw     = weekdays[googleDay] ?? ''

  return {
    id:            item.id ?? `google-${idx}`,
    name:          item.displayName?.text ?? 'Unknown',
    region,
    neighbourhood: region,
    cuisine:       guessCuisine(primaryType),
    vibe:          ['casual'],
    type:          primaryType,
    price:         priceLevel,
    priceLevel,
    rating:        item.rating ?? 0,
    ratingCount:   item.userRatingCount ?? 0,
    location:      item.formattedAddress ?? region,
    address:       item.formattedAddress ?? '',
    lat:           item.location?.latitude  ?? 28.6139,
    lng:           item.location?.longitude ?? 77.2090,
    intro:         item.editorialSummary?.text ?? '',
    summary:       item.editorialSummary?.text ?? '',
    famous:        '',
    tip:           '',
    keywords:      [primaryType.toLowerCase()],
    hours:         weekdays.join(' | '),
    hoursToday:    hoursRaw.includes(': ') ? hoursRaw.split(': ')[1] ?? hoursRaw : hoursRaw,
    isOpenNow:     item.regularOpeningHours?.openNow ?? null,
    photoName:     item.photos?.[0]?.name,
    googleMapsUri: `https://www.google.com/maps/place/?q=place_id:${item.id}`,
    mustTry:       false,
  } satisfies Place
}

export default function Home() {
  const [filters, setFilters]         = useState<ActiveFilters>(EMPTY)
  const [query,   setQuery]           = useState('')
  const [googleCache, setGoogleCache] = useState<Record<string, Place[]>>({})
  const [loading, setLoading]         = useState(false)
  const [error,   setError]           = useState<string | null>(null)
  const fetchingRef                   = useRef<Set<string>>(new Set())

  const fetchRegion = useCallback(async (region: string) => {
    if (fetchingRef.current.has(region)) return
    fetchingRef.current.add(region)
    try {
      const res = await fetch(`/api/nearby?region=${region}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const raw: any[] = await res.json()
      const places = raw.map((item, idx) => normaliseGooglePlace(item, region, idx))
      setGoogleCache(prev => ({ ...prev, [region]: places }))
    } catch (e: any) {
      console.error(`Fetch failed for ${region}:`, e)
      setError('Some areas could not load — showing available results.')
    } finally {
      fetchingRef.current.delete(region)
    }
  }, [])

  useEffect(() => {
    const regions = filters.regions.length > 0 ? filters.regions : ['all']
    const missing = regions.filter(r => !googleCache[r])
    if (missing.length === 0) { setLoading(false); return }
    setLoading(true)
    setError(null)
    Promise.all(missing.map(r => fetchRegion(r))).finally(() => setLoading(false))
  }, [filters.regions, fetchRegion, googleCache])

  const sourcePool = useMemo<Place[]>(() => {
    const regions = filters.regions.length > 0 ? filters.regions : ['all']
    const seen    = new Set<string>()
    const all: Place[] = []
    for (const r of regions) {
      for (const p of (googleCache[r] ?? [])) {
        if (!seen.has(p.id)) { seen.add(p.id); all.push(p) }
      }
    }
    if (all.length === 0) {
      return filters.regions.length === 0
        ? PLACES
        : PLACES.filter(p => filters.regions.includes(p.region))
    }
    return all
  }, [googleCache, filters.regions])

  const filtered = useMemo<Place[]>(() => {
    const q = query.toLowerCase().trim()

    // ── Filter ────────────────────────────────────────────────────────────
    let result = sourcePool.filter(p => {
      const cuisineOk = filters.cuisines.length === 0 ||
        filters.cuisines.some(c => p.cuisine.includes(c))

      const vibeOk = filters.vibes.length === 0 ||
        filters.vibes.some(v => p.vibe.includes(v))

      // Price filter — 0 means unknown, skip it if prices filter is active
      const priceOk = filters.prices.length === 0 ||
        (p.priceLevel > 0 && filters.prices.includes(p.priceLevel))

      const ratingOk = filters.minRating === 0 || p.rating >= filters.minRating

      // Open Now — only filter if the data is available (not null)
      const openOk = !filters.openNow || p.isOpenNow === true

      const searchOk = !q || [
        p.name, p.location, p.address, p.neighbourhood,
        p.intro, p.summary, p.famous, p.tip, p.type,
        ...p.cuisine, ...p.vibe, ...(p.keywords ?? []),
      ].some(f => f.toLowerCase().includes(q))

      return cuisineOk && vibeOk && priceOk && ratingOk && openOk && searchOk
    })

    // ── Sort ──────────────────────────────────────────────────────────────
    result = [...result].sort((a, b) => {
      switch (filters.sort) {
        case 'rating':
          // Primary: rating desc. Tie-break: review count desc
          return b.rating !== a.rating
            ? b.rating - a.rating
            : b.ratingCount - a.ratingCount
        case 'reviews':
          return b.ratingCount - a.ratingCount
        case 'price_asc':
          // Treat 0 (unknown) as highest so they sink to bottom
          const pa = a.priceLevel || 99
          const pb = b.priceLevel || 99
          return pa - pb
        case 'price_desc':
          const pa2 = a.priceLevel || 0
          const pb2 = b.priceLevel || 0
          return pb2 - pa2
        default:
          return 0
      }
    })

    return result
  }, [sourcePool, filters, query])

  const isLive = filters.regions.some(r => !!googleCache[r])

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
          Select a neighbourhood · combine any filters · hover cards for details
        </p>
      </div>

      <SearchBar value={query} onChange={setQuery} />

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 mb-6" />

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
              Live Google data · {sourcePool.length} places
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
