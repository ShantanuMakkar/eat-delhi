'use client'
import type { ActiveFilters, SortOption } from '@/lib/types'

type Props = {
  filters:      ActiveFilters
  onChange:     (f: ActiveFilters) => void
  totalVisible: number
  totalAll:     number
  loading?:     boolean
}

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
]

const CUISINES = [
  { key: 'indian',      label: '🍛 Indian' },
  { key: 'street',      label: '🌮 Street Food' },
  { key: 'continental', label: '🍝 Continental' },
  { key: 'asian',       label: '🍜 Asian' },
  { key: 'fusion',      label: '⚗️ Fusion' },
  { key: 'cafe',        label: '☕ Cafe' },
]

const VIBES = [
  { key: 'finedining', label: 'Fine Dining' },
  { key: 'casual',     label: 'Casual' },
  { key: 'budget',     label: 'Budget' },
  { key: 'romantic',   label: 'Romantic' },
  { key: 'artsy',      label: 'Artsy' },
]

const PRICES = [
  { value: 1, label: '₹' },
  { value: 2, label: '₹₹' },
  { value: 3, label: '₹₹₹' },
  { value: 4, label: '₹₹₹₹' },
]

const RATINGS = [
  { value: 0,   label: 'All' },
  { value: 4.5, label: '4.5+ ⭐' },
  { value: 4.0, label: '4.0+ ⭐' },
  { value: 3.5, label: '3.5+ ⭐' },
]

const SORTS: { value: SortOption; label: string }[] = [
  { value: 'rating',     label: '★ Rating' },
  { value: 'reviews',    label: '💬 Most reviewed' },
  { value: 'price_asc',  label: '₹ Price: low → high' },
  { value: 'price_desc', label: '₹ Price: high → low' },
]

function toggleArr<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

// Base pill used for most filters
function Pill({
  label, active, onClick, accent,
}: {
  label: string; active: boolean; onClick: () => void; accent?: string
}) {
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
          ? 'bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          : ''}
      `}
    >
      {active && <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />}
      {label}
    </button>
  )
}

// Section label
function Label({ children, aside }: { children: string; aside?: string }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400
                  dark:text-neutral-500 font-medium mb-2">
      {children}
      {aside && <span className="ml-2 normal-case text-neutral-500">{aside}</span>}
    </p>
  )
}

export function FilterBar({ filters, onChange, totalVisible, totalAll, loading }: Props) {
  const hasAny =
    filters.regions.length > 0   ||
    filters.cuisines.length > 0  ||
    filters.vibes.length > 0     ||
    filters.prices.length > 0    ||
    filters.minRating > 0        ||
    filters.openNow

  function clearAll() {
    onChange({
      regions: [], cuisines: [], vibes: [], prices: [],
      minRating: 0, openNow: false, sort: 'rating',
    })
  }

  return (
    <div className="space-y-4 mb-6">

      {/* ── Count + clear ────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-['Bebas_Neue'] text-[28px] leading-none tracking-wider
                           text-neutral-900 dark:text-white">
            {loading ? '—' : totalVisible}
          </span>
          <span className="text-[11px] uppercase tracking-[0.1em] text-neutral-400">
            {loading ? 'loading...' : `of ${totalAll} places`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* ── Open Now toggle ─────────────────────────────── */}
          <button
            onClick={() => onChange({ ...filters, openNow: !filters.openNow })}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[11px]
              font-medium border transition-all duration-150 uppercase tracking-[0.07em]
              ${filters.openNow
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-emerald-400 hover:text-emerald-600'
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              filters.openNow ? 'bg-white animate-pulse' : 'bg-neutral-300 dark:bg-neutral-600'
            }`} />
            Open Now
          </button>

          {hasAny && (
            <button
              onClick={clearAll}
              className="text-[11px] text-neutral-400 hover:text-neutral-700
                         dark:hover:text-neutral-200 underline underline-offset-4
                         transition-colors uppercase tracking-wider"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Sort ─────────────────────────────────────────────── */}
      <div>
        <Label>Sort by</Label>
        <div className="flex flex-wrap gap-2">
          {SORTS.map(s => (
            <button
              key={s.value}
              onClick={() => onChange({ ...filters, sort: s.value })}
              className={`px-3 py-1.5 rounded-sm text-[11px] uppercase tracking-[0.07em]
                font-medium border transition-all duration-150
                ${filters.sort === s.value
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                  : 'bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Neighbourhood ────────────────────────────────────── */}
      <div>
        <Label aside={
          filters.regions.length > 0
            ? `· ${filters.regions.length} selected · live Google data`
            : undefined
        }>
          Neighbourhood
        </Label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(r => (
            <Pill
              key={r.key}
              label={r.label}
              active={filters.regions.includes(r.key)}
              onClick={() => onChange({ ...filters, regions: toggleArr(filters.regions, r.key) })}
            />
          ))}
        </div>
      </div>

      {/* ── Craving ──────────────────────────────────────────── */}
      <div>
        <Label aside={filters.cuisines.length > 0 ? `· ${filters.cuisines.length} selected` : undefined}>
          Craving
        </Label>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map(c => (
            <Pill
              key={c.key}
              label={c.label}
              active={filters.cuisines.includes(c.key)}
              accent="#D85A30"
              onClick={() => onChange({ ...filters, cuisines: toggleArr(filters.cuisines, c.key) })}
            />
          ))}
        </div>
      </div>

      {/* ── Vibe ─────────────────────────────────────────────── */}
      <div>
        <Label aside={filters.vibes.length > 0 ? `· ${filters.vibes.length} selected` : undefined}>
          Vibe
        </Label>
        <div className="flex flex-wrap gap-2">
          {VIBES.map(v => (
            <Pill
              key={v.key}
              label={v.label}
              active={filters.vibes.includes(v.key)}
              accent="#7F77DD"
              onClick={() => onChange({ ...filters, vibes: toggleArr(filters.vibes, v.key) })}
            />
          ))}
        </div>
      </div>

      {/* ── Price ────────────────────────────────────────────── */}
      <div>
        <Label aside={filters.prices.length > 0 ? `· ${filters.prices.length} selected` : undefined}>
          Price
        </Label>
        <div className="flex flex-wrap gap-2">
          {PRICES.map(p => (
            <button
              key={p.value}
              onClick={() => onChange({ ...filters, prices: toggleArr(filters.prices, p.value) })}
              className={`px-4 py-1.5 rounded-sm text-[13px] font-medium border
                transition-all duration-150
                ${filters.prices.includes(p.value)
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                  : 'bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Min Rating ───────────────────────────────────────── */}
      <div>
        <Label>Minimum rating</Label>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map(r => (
            <button
              key={r.value}
              onClick={() => onChange({ ...filters, minRating: r.value })}
              className={`px-3 py-1.5 rounded-sm text-[11px] uppercase tracking-[0.07em]
                font-medium border transition-all duration-150
                ${filters.minRating === r.value
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-transparent text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-amber-400 hover:text-amber-600'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Active chips summary ──────────────────────────────── */}
      {hasAny && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 self-center mr-1">
            Active:
          </span>

          {filters.openNow && (
            <button
              onClick={() => onChange({ ...filters, openNow: false })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                         bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400
                         hover:bg-emerald-100 transition-colors">
              🟢 Open Now ×
            </button>
          )}

          {filters.regions.map(r => (
            <button key={r}
              onClick={() => onChange({ ...filters, regions: filters.regions.filter(x => x !== r) })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                         bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300
                         hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
              {REGIONS.find(x => x.key === r)?.label} ×
            </button>
          ))}

          {filters.cuisines.map(c => (
            <button key={c}
              onClick={() => onChange({ ...filters, cuisines: filters.cuisines.filter(x => x !== c) })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                         bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400
                         hover:bg-orange-100 transition-colors">
              {CUISINES.find(x => x.key === c)?.label} ×
            </button>
          ))}

          {filters.vibes.map(v => (
            <button key={v}
              onClick={() => onChange({ ...filters, vibes: filters.vibes.filter(x => x !== v) })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                         bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400
                         hover:bg-purple-100 transition-colors">
              {VIBES.find(x => x.key === v)?.label} ×
            </button>
          ))}

          {filters.prices.map(p => (
            <button key={p}
              onClick={() => onChange({ ...filters, prices: filters.prices.filter(x => x !== p) })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                         bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300
                         hover:bg-neutral-200 transition-colors">
              {PRICES.find(x => x.value === p)?.label} ×
            </button>
          ))}

          {filters.minRating > 0 && (
            <button
              onClick={() => onChange({ ...filters, minRating: 0 })}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]
                         bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400
                         hover:bg-amber-100 transition-colors">
              {filters.minRating}+ ⭐ ×
            </button>
          )}
        </div>
      )}
    </div>
  )
}
