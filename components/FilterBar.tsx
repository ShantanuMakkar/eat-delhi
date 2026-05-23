'use client';

type FilterOption = { key: string; label: string };
type FilterGroup  = { groupLabel: string; options: FilterOption[] };
type Props = { active: string; onChange: (key: string) => void };

const FILTER_GROUPS: FilterGroup[] = [
  {
    groupLabel: 'Neighbourhood',
    options: [
      { key: 'all',          label: 'All Delhi' },
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
    ],
  },
  {
    groupLabel: 'Craving',
    options: [
      { key: 'all',         label: 'Everything' },
      { key: 'indian',      label: 'Indian' },
      { key: 'street',      label: 'Street Food' },
      { key: 'continental', label: 'Continental' },
      { key: 'asian',       label: 'Asian' },
      { key: 'fusion',      label: 'Fusion' },
      { key: 'cafe',        label: 'Cafe' },
    ],
  },
  {
    groupLabel: 'Vibe',
    options: [
      { key: 'all',        label: 'Any Vibe' },
      { key: 'finedining', label: 'Fine Dining' },
      { key: 'casual',     label: 'Casual' },
      { key: 'budget',     label: 'Budget' },
      { key: 'romantic',   label: 'Romantic' },
      { key: 'artsy',      label: 'Artsy' },
    ],
  },
];

export function FilterBar({ active, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {FILTER_GROUPS.map((group) => (
        <div key={group.groupLabel}>
          <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-400
                        dark:text-neutral-500 font-medium mb-2">
            {group.groupLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.options.map((opt) => {
              const isOn = active === opt.key;
              return (
                <button
                  key={`${group.groupLabel}-${opt.key}`}
                  onClick={() => onChange(opt.key)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm
                    text-[11px] uppercase tracking-[0.07em] font-medium border
                    transition-all duration-150
                    ${isOn
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                      : 'bg-transparent text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                    }
                  `}
                >
                  {opt.key !== 'all' && (
                    <span className={`block w-1.5 h-1.5 rounded-full transition-colors ${
                      isOn ? 'bg-white dark:bg-neutral-900' : 'bg-neutral-300 dark:bg-neutral-600'
                    }`} />
                  )}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
