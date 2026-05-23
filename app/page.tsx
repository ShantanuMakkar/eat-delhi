'use client';

import { useState, useMemo } from 'react';
import { PlaceCard } from '@/components/PlaceCard';
import { FilterBar } from '@/components/FilterBar';
import { SearchBar } from '@/components/SearchBar';
import { PLACES } from '@/lib/places';
import type { Place } from '@/lib/types';

export default function Home() {
  const [filter, setFilter] = useState<string>('all');
  const [query, setQuery] = useState<string>('');

  // ── Filter + search logic ────────────────────────────────────────────────
  const filtered = useMemo<Place[]>(() => {
    return PLACES.filter((place) => {
      // Filter match — check region, cuisine, vibe
      const filterMatch =
        filter === 'all' ||
        place.region === filter ||
        place.cuisine.includes(filter) ||
        place.vibe.includes(filter);

      // Search match — check name, location, intro, famous, tip
      const q = query.toLowerCase().trim();
      const searchMatch =
        !q ||
        place.name.toLowerCase().includes(q) ||
        place.location.toLowerCase().includes(q) ||
        place.intro.toLowerCase().includes(q) ||
        place.famous.toLowerCase().includes(q) ||
        place.tip.toLowerCase().includes(q) ||
        place.cuisine.some((c) => c.includes(q)) ||
        place.vibe.some((v) => v.includes(q));

      return filterMatch && searchMatch;
    });
  }, [filter, query]);

  return (
    <main className="max-w-6xl mx-auto px-5 py-12">

      {/* ── Hero heading ── */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2">
          New Delhi · 2025 Edition
        </p>
        <h1 className="font-['Bebas_Neue'] text-[64px] md:text-[80px] leading-[0.92]
                       tracking-wide text-neutral-900 dark:text-white mb-3">
          What are you<br />
          <span className="text-neutral-400 dark:text-neutral-500">hungry for?</span>
        </h1>
        <p className="text-sm text-neutral-400 font-light">
          {filtered.length} place{filtered.length !== 1 ? 's' : ''} · hover any card to see what makes it legendary
        </p>
      </div>

      {/* ── Search ── */}
      <SearchBar value={query} onChange={setQuery} />

      {/* ── Filters ── */}
      <FilterBar active={filter} onChange={setFilter} />

      {/* ── Divider ── */}
      <div className="h-px bg-neutral-100 dark:bg-neutral-800 mb-6" />

      {/* ── Result count ── */}
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-['Bebas_Neue'] text-[32px] leading-none tracking-wider
                         text-neutral-900 dark:text-white">
          {filtered.length}
        </span>
        <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400">
          places found
        </span>
      </div>

      {/* ── Grid ── */}
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
        </div>
      )}

    </main>
  );
}
