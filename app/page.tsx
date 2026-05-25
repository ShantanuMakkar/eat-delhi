'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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

// Skeleton card for loading state
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

export default function Home() {
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY)
  const [query, setQuery] = useState('')

  // Live Google data state
  const [liveData, setLiveData] = useState<Place[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeRegion, setActiveRegion] = useState<string>('all')

  // Fetch from Google via our API route whenever region changes
  const fetchLive = useCallback(async (region: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/places?region=${region}`)
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      // Google returns objects with displayName.text — normalise to our Place shape
      const normalised: Place[] = data.map((item: any, idx: number) => {
        // Already a Place (curated fallback) — return as-is
        if (item.id && item.name) return item as Place
        // Google Places API (New) shape — normalise
        return {
          id: item.id ?? `google-${idx}`,
          name: item.displayName?.text ?? 'Unknown',
          region,
          neighbourhood: region,
          cuisine: item.primaryTypeDisplayName?.text
            ? [item.primaryTypeDisplayName.text.toLowerCase()]
            : ['restaurant'],
          vibe: ['casual'],
          price: item.priceLevel ?? 2,
          rating: item.rating ?? 0,
          ratingCount: item.userRatingCount
            ? item.userRatingCount > 1000
              ? `${(item.userRatingCount / 1000).toFixed(1)}k`
              : String(item.userRatingCount)
            : '—',
          location: item.formattedAddress ?? region,
          intro: item.editorialSummary?.text ?? `A ${item.primaryTypeDisplayName?.text ?? 'place'} in ${region}.`,
          famous: '',
          tip: '',
          hours: item.regularOpeningHours?.weekdayDescriptions?.[0] ?? 'Check Google Maps',
          lat: item.location?.latitude ?? 28.6139,
          lng: item.location?.longitude ?? 77.2090,
          photo: item.photos?.[0]
            ? `/api/photo?ref=${item.photos[0].name}`
            : undefined,
          keywords: [],
          mustTry: false,
        } satisfies Place
      })
      setLiveData(normalised)
    } catch (e: any) {
      console.error(e)
      setError('Could not load live data — showing curated results.')
      setLiveData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // When region filter changes, re-fetch
  useEffect(() => {
    // Determine the single active region (first one, or 'all')
    const region = filters.regions.length === 1 ? filters.regions[0] : 'all'
    setActiveRegion(region)
    fetchLive(region)
  }, [filters.regions, fetchLive])

  // Source: live Google data OR curated fallback
  const source: Place[] = liveData ?? PLACES

  // Client-side filter + search on top of live data
  const filtered = useMemo<Place[]>(() => {
    const q = query.toLowerCase().trim()

    return source.filter((p) => {
      // Region already handled by API fetch — skip re-filtering if live
      const regionOk =
        liveData != null // live data is already scoped to region
          ? true
          : filters.regions.length === 0 || filters.regions.includes(p.region)

      const cuisineOk =
        filters.cuisines.length === 0 ||
        filters.cuisines.some((c) => p.cuisine.includes(c))

      const vibeOk =
        filters.vibes.length === 0 ||
        filters.vibes.some((v) => p.vibe.includes(v))

      const ratingOk = p.rating >= filters.minRating

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
        ].some((field) => field.toLowerCase().includes(q))

      return regionOk && cuisineOk && vibeOk && ratingOk && searchOk
    })
  }, [source, filters, query, liveData])

  return (
    <main className="max-w-6xl mx-auto px-5 py-12">

      {/* Hero */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 mb-2">
          New Delhi · Live via Google Maps
        </p>
        <h1 className="font-['Bebas_Neue'] text-[60px] md:text-[78px] leading-[0.92] tracking-wide text-neutral-900 dark:text-white mb-3">
          What are you<br />
          <span className="text-neutral-400 dark:text-neutral-500">hungry for?</span>
        </h1>
        <p className="text-sm text-neutral-400 font-light">
          Select a neighbourhood to load live Google results · pick multiple filters together
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
        totalAll={source.length}
        loading={loading}
      />

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-sm border border-amber-200 dark:border-amber-800
                        bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400
                        text-[13px] font-light">
          {error}
        </div>
      )}

      {/* Live data badge */}
      {liveData && !error && (
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] uppercase tracking-wider text-neutral-400">
            Live Google data · {activeRegion === 'all' ? 'All Delhi' : activeRegion}
            {' · '}{source.length} places found
          </span>
        </div>
      )}

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 mb-6" />

      {/* Grid */}
      {loading ? (
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
          <p className="font-['Bebas_Neue'] text-[28px] tracking-wide text-neutral-300 dark:text-neutral-600">
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