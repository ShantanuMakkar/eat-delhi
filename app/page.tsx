'use client';

import { useState, useMemo } from 'react';
import { PlaceCard } from '@/components/PlaceCard';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { PLACES } from '@/lib/places';
import type { Place } from '@/lib/types';

export default function Home() {
  const [filter, setFilter] = useState<string>('all');
  const [query,  setQuery]  = useState<string>('');

  const filtered = useMemo<Place[]>(() => {
    return PLACES.filter((p) => {
      const filterMatch =
        filter === 'all' ||
        p.region === filter ||
        p.cuisine.includes(filter) ||
        p.vibe.includes(filter);

      const q = query.toLowerCase().trim();
      const searchMatch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.neighbourhood.toLowerCase().includes(q) ||
        p.intro.toLowerCase().includes(q) ||
        p.famous.toLowerCase().includes(q) ||
        p.tip.toLowerCase().includes(q) ||
        p.cuisine.some((c) => c.includes(q)) ||
        p.vibe.some((v) => v.includes(q));

      return filterMatch && searchMatch;
    });
  }, [filter, query]);

  const mustTryCount = filtered.filter((p) => p.mustTry).length;

  return (
    <main className="max-w-6xl mx-auto px-5 py-12">

      {/* Hero */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">
          New Delhi · {PLACES.length} Places Curated
        </p>
        <h1 className="font-['Bebas_Neue'] text-[64px] md:text-[80px] leading-[0.92]
                       tracking-wide text-neutral-900 dark:text-white mb-3">
          What are you<br />
          <span className="text-neutral-400 dark:text-neutral-500">hungry for?</span>
        </h1>
        <p className="text-sm text-neutral-400 font-light">
          Hover any card to see what makes it legendary
          {mustTryCount > 0 && (
            <span className="ml-3 text-[11px] bg-neutral-100 dark:bg-neutral-800
                             text-neutral-500 px-2 py-0.5 rounded-sm uppercase tracking-wider">
              {mustTryCount} must-try
            </span>
          )}
        </p>
      </div>

      {/* Search */}
      <SearchBar value={query} onChange={setQuery} />

      {/* Filters */}
      <FilterBar active={filter} onChange={setFilter} />

      <div className="h-px bg-neutral-100 dark:bg-neutral-800 mb-6" />

      {/* Count */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-['Bebas_Neue'] text-[32px] leading-none tracking-wider
                         text-neutral-900 dark:text-white">
          {filtered.length}
        </span>
        <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400">
          place{filtered.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
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
            onClick={() => { setFilter('all'); setQuery(''); }}
            className="mt-4 text-sm text-neutral-400 underline underline-offset-4
                       hover:text-neutral-600 transition-colors"
          >
            Clear filters
          </button>
        </div>
      )}

    </main>
  );
}
