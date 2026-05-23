'use client';

import { motion } from 'framer-motion';
import type { Place } from '@/lib/types';
import { ACCENTS } from '@/lib/places';

type Props = { place: Place; index: number };

function PriceDots({ level }: { level: number }) {
  return (
    <div className="flex gap-1 items-center">
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`block w-1.5 h-1.5 rounded-full ${
          i <= level ? 'bg-white/90' : 'bg-white/20'
        }`} />
      ))}
    </div>
  );
}

export function PlaceCard({ place, index }: Props) {
  const accent = ACCENTS[place.id] ?? '#D85A30';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative group overflow-hidden rounded-lg border border-neutral-200
                 dark:border-neutral-800 bg-white dark:bg-neutral-900 cursor-default"
    >
      {/* Accent top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-10"
           style={{ background: accent }} />

      {/* Photo */}
      <div className="relative h-48 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {place.photo ? (
          <img src={place.photo} alt={place.name}
               className="w-full h-full object-cover transition-transform
                          duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          font-['Bebas_Neue'] text-5xl text-neutral-300 dark:text-neutral-600">
            {place.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Rank */}
        <div className="absolute top-3 left-3 bg-black/60 text-white text-[11px]
                        font-mono px-2 py-0.5 rounded-sm tracking-widest">
          No.{String(index + 1).padStart(2, '0')}
        </div>

        {/* Must Try badge */}
        {place.mustTry && (
          <div className="absolute top-3 right-10 text-[9px] font-semibold
                          uppercase tracking-widest px-2 py-0.5 rounded-sm"
               style={{ background: accent, color: '#fff' }}>
            Must Try
          </div>
        )}

        {/* Price dots */}
        <div className="absolute top-3 right-3">
          <PriceDots level={place.price} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-['Bebas_Neue'] text-[26px] leading-none tracking-wide
                       text-neutral-900 dark:text-white mb-0.5">
          {place.name}
        </h3>
        <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-3">
          {place.neighbourhood} · {place.location.split(',').pop()?.trim()}
        </p>
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400
                      leading-relaxed font-light">
          {place.intro}
        </p>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-5
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-[250ms] ease-in-out"
           style={{ background: '#0A0A0A' }}>
        <div>
          <div className="mb-3">
            <h3 className="font-['Bebas_Neue'] text-[28px] leading-none
                           tracking-wide text-white">
              {place.name}
            </h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
              {place.neighbourhood}
            </p>
          </div>

          <div className="mb-3">
            <p className="text-[9px] text-white/40 uppercase tracking-[0.15em]
                          mb-1 font-medium">Famous for</p>
            <p className="text-[12px] text-white/80 leading-relaxed font-light">
              {place.famous}
            </p>
          </div>

          <div className="mb-3">
            <p className="text-[9px] text-white/40 uppercase tracking-[0.15em]
                          mb-1 font-medium">Insider tip</p>
            <p className="text-[12px] text-white/60 leading-relaxed font-light italic">
              {place.tip}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {place.cuisine.map((c) => (
              <span key={c} className="text-[10px] px-2 py-0.5 border
                border-white/20 text-white/60 rounded-sm uppercase tracking-wider">
                {c}
              </span>
            ))}
            {place.vibe.map((v) => (
              <span key={v} className="text-[10px] px-2 py-0.5 border
                border-white/10 text-white/40 rounded-sm uppercase tracking-wider">
                {v}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-white/10">
          <div>
            <p className="font-['Bebas_Neue'] text-[22px] leading-none text-white tracking-wider">
              {place.rating}
              <span className="text-[14px] text-white/30 ml-1">/ 5</span>
            </p>
            <p className="text-[10px] text-white/30 font-light mt-0.5">
              {place.ratingCount} reviews
            </p>
          </div>
          <div className="text-right">
            {place.hours.split(' · ').map((h, i) => (
              <p key={i} className="text-[11px] text-white/40 font-light">{h}</p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
