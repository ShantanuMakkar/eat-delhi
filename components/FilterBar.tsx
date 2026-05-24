'use client';
import type { ActiveFilters } from '@/lib/types';

type Props = {
  filters: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
  totalVisible: number;
  totalAll: number;
};

const REGIONS = [
  { key: 'cp',           label: 'Connaught Place' },
  { key: 'south',        label: 'South Delhi' },
  { key: 'north',        label: 'North Delhi' },
  { key: 'hauz',         label: 'Hauz Khas' },
  { key: 'central',      label: 'Central Delhi' },
  { key: 'chanakyapuri', label: 'Chanakyapuri' },
  { key: 'olddelhi',     label: 'Old Delhi' },
  { key: 'majnu',        label: 'Majnu Ka Tila' },
  { key: 'lajpat',       label: 'Lajpat / Pandara' },
  { key: 'saket',        label: 'Saket' },
  { key: 'nehru',        label: 'Def Col / GK' },
];

const CUISINES = [
  { key: 'indian',      label: '🍛 Indian' },
  { key: 'street',      label: '🌮 Street Food' },
  { key: 'continental', label: '🍝 Continental' },
  { key: 'asian',       label: '🍜 Asian' },
  { key: 'fusion',      label: '⚗️ Fusion' },
  { key: 'cafe',        label: '☕ Cafe' },
];

const VIBES = [
  { key: 'finedining', label: 'Fine Dining' },
  { key: 'casual',     label: 'Casual' },
  { key: 'budget',     label: 'Budget' },
  { key: 'romantic',   label: 'Romantic' },
  { key: 'artsy',      label: 'Artsy' },
];

const RATINGS = [
  { value: 0,   label: 'All ratings' },
  { value: 4.5, label: '4.5+ ⭐' },
  { value: 4.0, label: '4.0+ ⭐' },
  { value: 3.5, label: '3.5+ ⭐' },
];

function toggleItem(arr: string[], key: string): string[] {
  return arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key];
}

function Pill({
  label, active, onClick, accent,
}: { label: string; active: boolean; onClick: () => void; accent?: string }) {
  return (
    <button
      onClick={onClick}
      style={active && accent ? { background: accent, borderColor: accent, color: '#fff' } : {}}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[11px]
        uppercase tracking-[0.07em] font-medium border transition-all duration-150 select-none
        ${active && !accent
          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white'
          : !active
          ? 'bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          : ''}
      `}
    >
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
      )}
      {label}
    </button>
  );
}

export function FilterBar({ filters, onChange, totalVisible, totalAll }: Props) {
  const hasAnyFilter =
    filters.regions.length > 0 ||
    filters.cuisines.length > 0 ||
    filters.vibes.length > 0 ||
    filters.minRating > 0;

  function clearAll() {
    onChange({ regions: [], cuisines: [], vibes: [], minRating: 0 });
  }

  return (
    <div className="mb-6 space-y-4">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <span className="font-['Bebas_Neue'] text-[28px] leading-none tracking-wider
                           text-neutral-900 dark:text-white">
            {totalVisible}
          </span>
          <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400">
            of {totalAll} places
          </span>
        </div>
        {hasAnyFilter && (
          <button
            onClick={clearAll}
            className="text-[11px] uppercase tracking-wider text-neutral-400
                       hover:text-neutral-700 dark:hover:text-neutral-200
                       underline underline-offset-4 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Neighbourhood */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400
                      dark:text-neutral-500 font-medium mb-2">
          Neighbourhood
          {filters.regions.length > 0 && (
            <span className="ml-2 text-neutral-600 dark:text-neutral-300">
              · {filters.regions.length} selected
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(r => (
            <Pill
              key={r.key}
              label={r.label}
              active={filters.regions.includes(r.key)}
              onClick={() => onChange({ ...filters, regions: toggleItem(filters.regions, r.key) })}
            />
          ))}
        </div>
      </div>

      {/* Cuisine */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400
                      dark:text-neutral-500 font-medium mb-2">
          Craving
          {filters.cuisines.length > 0 && (
            <span className="ml-2 text-neutral-600 dark:text-neutral-300">
              · {filters.cuisines.length} selected
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map(c => (
            <Pill
              key={c.key}
              label={c.label}
              active={filters.cuisines.includes(c.key)}
              accent="#D85A30"
              onClick={() => onChange({ ...filters, cuisines: toggleItem(filters.cuisines, c.key) })}
            />
          ))}
        </div>
      </div>

      {/* Vibe */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400
                      dark:text-neutral-500 font-medium mb-2">
          Vibe
          {filters.vibes.length > 0 && (
            <span className="ml-2 text-neutral-600 dark:text-neutral-300">
              · {filters.vibes.length} selected
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {VIBES.map(v => (
            <Pill
              key={v.key}
              label={v.label}
              active={filters.vibes.includes(v.key)}
              accent="#7F77DD"
              onClick={() => onChange({ ...filters, vibes: toggleItem(filters.vibes, v.key) })}
            />
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400
                      dark:text-neutral-500 font-medium mb-2">
          Minimum Rating
        </p>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map(r => (
            <button
              key={r.value}
              onClick={() => onChange({ ...filters, minRating: r.value })}
              className={`
                px-3 py-1.5 rounded-sm text-[11px] uppercase tracking-[0.07em]
                font-medium border transition-all duration-150
                ${filters.minRating === r.value
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-amber-400 hover:text-amber-600'}
              `}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter chips summary */}
      {hasAnyFilter && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400
                           self-center mr-1">Active:</span>
          {filters.regions.map(r => (
            <button
              key={r}
              onClick={() => onChange({ ...filters, regions: filters.regions.filter(x => x !== r) })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                         bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300
                         hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {REGIONS.find(x => x.key === r)?.label} ×
            </button>
          ))}
          {filters.cuisines.map(c => (
            <button
              key={c}
              onClick={() => onChange({ ...filters, cuisines: filters.cuisines.filter(x => x !== c) })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                         bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400
                         hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors"
            >
              {CUISINES.find(x => x.key === c)?.label} ×
            </button>
          ))}
          {filters.vibes.map(v => (
            <button
              key={v}
              onClick={() => onChange({ ...filters, vibes: filters.vibes.filter(x => x !== v) })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                         bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400
                         hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
            >
              {VIBES.find(x => x.key === v)?.label} ×
            </button>
          ))}
          {filters.minRating > 0 && (
            <button
              onClick={() => onChange({ ...filters, minRating: 0 })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                         bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400
                         hover:bg-amber-100 transition-colors"
            >
              {filters.minRating}+ ⭐ ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}