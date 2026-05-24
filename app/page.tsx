'use client';

import { useState, useMemo } from 'react';
import { PlaceCard } from '@/components/PlaceCard';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { PLACES } from '@/lib/places';
import type { ActiveFilters, Place } from '@/lib/types';

const EMPTY_FILTERS: ActiveFilters = {
  regions: [],
  cuisines: [],
  vibes: [],
  minRating: 0,
};

export default function Home() {
  const [filters, setFilters] = useState<ActiveFilters>(EMPTY_FILTERS);
  const [query, setQuery] = useState<string>('');

  const filtered = useMemo<Place[]>(() => {
    const q = query.toLowerCase().trim();

    return PLACES.filter((p) => {
      // OR within each group, AND across groups
      const regionOk =
        filters.regions.length === 0 || filters.regions.includes(p.region);

      const cuisineOk =
        filters.cuisines.length === 0 ||
        filters.cuisines.some((c) => p.cuisine.includes(c));

      const vibeOk =
        filters.vibes.length === 0 ||
        filters.vibes.some((v) => p.vibe.includes(v));

      const ratingOk = p.rating >= filters.minRating;

      // Search across name, location, dishes, keywords, tip, intro
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
          ...p.keywords,
        ].some((field) => field.toLowerCase().includes(q));

      return regionOk && cuisineOk && vibeOk && ratingOk && searchOk;
    });
  }, [filters, query]);

  return (
    <main className="max-w-6xl mx-auto px-5 py-12">

      {/* Hero */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.22em] text-neutral-400 mb-2">
          New Delhi · {PLACES.length} Curated Places
        </p>
        <h1
          className="font-['Bebas_Neue'] text-[60px] md:text-[78px] leading-[0.92]
                     tracking-wide text-neutral-900 dark:text-white mb-3"
        >
          What are you
          <br />
          <span className="text-neutral-400 dark:text-neutral-500">hungry for?</span>
        </h1>
        <p className="text-sm text-neutral-400 font-light">
          Pick multiple filters · hover any card to see what makes it legendary
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
        totalAll={PLACES.length}
      />

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 mb-6" />

      {/* Results grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((place, i) => (
            <PlaceCard key={place.id} place={place} index={i} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p
            className="font-['Bebas_Neue'] text-[28px] tracking-wide
                       text-neutral-300 dark:text-neutral-600"
          >
            Nothing found — try a different craving
          </p>
          <button
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setQuery('');
            }}
            className="mt-4 text-sm text-neutral-400 underline underline-offset-4
                       hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            Clear everything
          </button>
        </div>
      )}
    </main>
  );
}