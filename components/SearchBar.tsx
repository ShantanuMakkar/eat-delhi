'use client';
import { useRef } from 'react';

type Props = { value: string; onChange: (v: string) => void };

const SUGGESTIONS = [
  'biryani', 'momos', 'butter chicken', 'dosa', 'chaat',
  'kebab', 'pizza', 'date night', 'budget', 'breakfast',
  'jalebi', 'paratha', 'seafood', 'thali', 'coffee',
];

export function SearchBar({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-6">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4
                        text-neutral-400 pointer-events-none"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="biryani, momos, date night, jalebi, seafood..."
          className="w-full pl-11 pr-10 py-3.5 text-sm font-light italic
                     bg-neutral-50 dark:bg-neutral-800/60
                     border border-neutral-200 dark:border-neutral-700 rounded-sm
                     outline-none text-neutral-800 dark:text-neutral-200
                     placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                     focus:border-neutral-500 dark:focus:border-neutral-400
                     transition-colors font-['DM_Sans']"
        />
        {value && (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400
                       hover:text-neutral-700 dark:hover:text-neutral-200
                       text-xl leading-none transition-colors"
          >×</button>
        )}
      </div>

      {/* Quick suggestion pills — only when input is empty */}
      {!value && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400
                           self-center">Try:</span>
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => onChange(s)}
              className="text-[11px] px-2.5 py-1 rounded-full border border-neutral-200
                         dark:border-neutral-700 text-neutral-500 dark:text-neutral-400
                         hover:border-neutral-400 hover:text-neutral-700
                         dark:hover:text-neutral-200 transition-colors italic"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}