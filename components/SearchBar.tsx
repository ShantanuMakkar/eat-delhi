'use client';

// ── Types ──────────────────────────────────────────────────────────────────
type Props = {
  value: string;
  onChange: (value: string) => void;
};

// ── Component ──────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative mb-5">
      {/* Search icon */}
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4
                   text-neutral-400 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M16.5 16.5L21 21" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="biryani, cosy cafe, date night, budget bites..."
        className="
          w-full pl-11 pr-4 py-3.5 text-sm font-light italic
          bg-neutral-50 dark:bg-neutral-800/60
          border border-neutral-200 dark:border-neutral-700
          rounded-sm outline-none text-neutral-800 dark:text-neutral-200
          placeholder:text-neutral-400 dark:placeholder:text-neutral-500
          focus:border-neutral-400 dark:focus:border-neutral-500
          transition-colors duration-150
          font-['DM_Sans']
        "
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400
                     hover:text-neutral-600 dark:hover:text-neutral-300
                     text-lg leading-none transition-colors"
        >
          ×
        </button>
      )}
    </div>
  );
}
