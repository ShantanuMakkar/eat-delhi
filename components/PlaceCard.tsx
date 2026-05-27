'use client';

import { motion } from 'framer-motion';
import type { Place } from '@/lib/types';

type Props = { place: Place; index: number };

const ACCENT_COLORS = [
  '#D85A30','#1D9E75','#7F77DD','#EF9F27','#D4537E',
  '#378ADD','#639922','#5DCAA5','#BA7517','#C94B8A',
];

function PriceDots({ level }: { level: number }) {
  if (level === 0) return null;
  return (
    <div className="flex gap-[3px] items-center">
      {[1,2,3,4].map(i => (
        <span key={i} className={`block w-[5px] h-[5px] rounded-full ${
          i <= level ? 'bg-white/90' : 'bg-white/20'
        }`} />
      ))}
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  return (
    <span className="text-amber-400 text-xs tracking-tighter">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

export function PlaceCard({ place, index }: Props) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const photoSrc = place.photoName
    ? `/api/photo?name=${encodeURIComponent(place.photoName)}`
    : place.photo ?? null;

  const formatRatingCount = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.25,0.46,0.45,0.94] }}
      className="relative group overflow-hidden rounded-lg border
                 border-neutral-200 dark:border-neutral-800
                 bg-white dark:bg-neutral-900 cursor-default"
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-10"
           style={{ background: accent }} />

      {/* Photo */}
      <div className="relative h-44 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={place.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform
                       duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          font-['Bebas_Neue'] text-4xl tracking-widest"
               style={{ color: accent + '60' }}>
            {place.name.slice(0,2).toUpperCase()}
          </div>
        )}

        {/* Open/closed badge */}
        {place.isOpenNow !== null && (
          <div className={`absolute top-3 left-3 text-[10px] font-semibold
                           uppercase tracking-widest px-2 py-0.5 rounded-sm ${
            place.isOpenNow
              ? 'bg-emerald-500/90 text-white'
              : 'bg-neutral-800/80 text-neutral-300'
          }`}>
            {place.isOpenNow ? 'Open' : 'Closed'}
          </div>
        )}

        {/* Price level */}
        <div className="absolute top-3 right-3">
          <PriceDots level={place.priceLevel} />
        </div>
      </div>

      {/* Default card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-['Bebas_Neue'] text-[22px] leading-none tracking-wide
                         text-neutral-900 dark:text-white">
            {place.name}
          </h3>
          {place.rating > 0 && (
            <div className="flex-shrink-0 text-right">
              <div className="font-['Bebas_Neue'] text-[18px] leading-none
                              text-neutral-900 dark:text-white tracking-wider">
                {place.rating.toFixed(1)}
              </div>
              <div className="text-[10px] text-neutral-400">
                {formatRatingCount(place.ratingCount)}
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-neutral-400 uppercase tracking-wider mb-2">
          {place.type}
          {place.address && ` · ${place.address.split(',').slice(0,2).join(',')}`}
        </p>

        {place.summary ? (
          <p className="text-[12px] text-neutral-500 dark:text-neutral-400
                        leading-relaxed font-light line-clamp-2">
            {place.summary}
          </p>
        ) : (
          place.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating rating={place.rating} />
              <span className="text-[11px] text-neutral-400">
                {formatRatingCount(place.ratingCount)} reviews
              </span>
            </div>
          )
        )}
      </div>

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-between p-5
                   opacity-0 group-hover:opacity-100
                   transition-opacity duration-[220ms]"
        style={{ background: '#0A0A0A' }}
      >
        <div>
          <h3 className="font-['Bebas_Neue'] text-[26px] leading-none tracking-wide
                         text-white mb-0.5">
            {place.name}
          </h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mb-4">
            {place.type}
          </p>

          {place.summary && (
            <div className="mb-3">
              <p className="text-[9px] text-white/40 uppercase tracking-[0.15em] mb-1">
                About
              </p>
              <p className="text-[12px] text-white/75 leading-relaxed font-light">
                {place.summary}
              </p>
            </div>
          )}

          {place.hoursToday && (
            <div className="mb-3">
              <p className="text-[9px] text-white/40 uppercase tracking-[0.15em] mb-1">
                Today's hours
              </p>
              <p className="text-[12px] text-white/75 font-light">
                {place.hoursToday}
              </p>
            </div>
          )}

          {place.address && (
            <div className="mb-3">
              <p className="text-[9px] text-white/40 uppercase tracking-[0.15em] mb-1">
                Address
              </p>
              <p className="text-[12px] text-white/60 font-light leading-relaxed">
                {place.address}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between pt-3 border-t border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-['Bebas_Neue'] text-[24px] leading-none text-white tracking-wider">
                {place.rating > 0 ? place.rating.toFixed(1) : '—'}
              </p>
              {place.rating > 0 && <StarRating rating={place.rating} />}
            </div>
            <p className="text-[10px] text-white/30 font-light">
              {place.ratingCount > 0 ? `${formatRatingCount(place.ratingCount)} reviews on Google` : 'No reviews yet'}
            </p>
          </div>

          {place.googleMapsUri && (
            <a
              href={place.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="text-[10px] uppercase tracking-widest text-white/40
                         hover:text-white/80 border border-white/20 hover:border-white/50
                         px-3 py-1.5 rounded-sm transition-colors"
            >
              Maps ↗
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
