"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Star, MapPin, ChevronRight, Navigation, Calendar, Menu, X, Sparkles, Heart, Compass, Globe2 } from 'lucide-react';
import { CATEGORY_CONFIG, type Place, type Category } from '@/data/places';
import { ITINERARY_DAYS } from '@/data/itinerary';
import TourGuideBottomNav from '@/components/TourGuideBottomNav';
import { useFavorites, isOpenNow, kmBetween, formatKm, useUserLocation } from '@/lib/tour-guide-utils';

// Supabase place row shape (snake_case from /api/places)
interface PlaceRow {
  id: string;
  name: string;
  emoji: string | null;
  category: Category;
  description: string;
  entry_fee: string | null;
  best_time: string | null;
  time_needed: string | null;
  rating: number | null;
  tip: string | null;
  hours: string | null;
  image_url: string | null;
  lat: number;
  lng: number;
}

// Fallback cover image from Supabase Storage `places-image` bucket if no image_url.
function placeImageFor(supabaseUrl: string, p: PlaceRow): string {
  if (p.image_url) return p.image_url;
  return `${supabaseUrl}/storage/v1/object/public/places-image/${p.id}.jpg`;
}

// Map a PlaceRow to the local Place shape used by the existing cards.
function rowToPlace(row: PlaceRow, supabaseUrl: string): Place {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji ?? '📍',
    category: row.category,
    lat: row.lat,
    lng: row.lng,
    description: row.description,
    entryFee: row.entry_fee ?? '',
    bestTime: row.best_time ?? '',
    timeNeeded: row.time_needed ?? '',
    rating: row.rating ?? 0,
    tip: row.tip ?? '',
    image: placeImageFor(supabaseUrl, row),
    hours: row.hours ?? undefined,
  };
}

type FilterMode = 'all' | 'open' | 'favorites' | 'near';

export default function WanderlogStyleTourGuide() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialView = (searchParams?.get('view') ?? 'all') as FilterMode;
  const [activeDay, setActiveDay] = useState<number | 'overview'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [filter, setFilter] = useState<FilterMode>(
    ['all', 'open', 'favorites', 'near'].includes(initialView) ? initialView : 'all'
  );

  const { isFav, toggle: toggleFav, count: favCount } = useFavorites();
  const { loc: userLoc, status: locStatus, request: requestLoc } = useUserLocation();

  // Fetch places from Supabase via /api/places
  useEffect(() => {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
    setPlacesLoading(true);
    fetch('/api/places', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        const rows: PlaceRow[] = j.data ?? [];
        setPlaces(rows.map((r) => rowToPlace(r, supabaseUrl)));
      })
      .catch(() => setPlaces([]))
      .finally(() => setPlacesLoading(false));
  }, []);

  // Sync active day based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'overview', day: 'overview' },
        ...ITINERARY_DAYS.map(day => ({ id: `day-${day.day}`, day: day.day }))
      ];
      
      const scrollPosition = window.scrollY + 150;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i].id);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveDay(sections[i].day as any);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#1B3A2D] font-body selection:bg-[#B8956A] selection:text-white">
      {/* ── SEO ─────────────────────────────────────────────────────────── */}
      <title>Mysuru Itinerary & Guide | World of Mysore Pak</title>

      {/* ── MOBILE HEADER ───────────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-50 bg-white border-b border-[#1B3A2D]/5 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2">
          <Menu size={20} />
        </button>
        <h1 className="text-sm font-heading font-bold">Royal Mysuru Guide</h1>
        <span className="w-8" />
      </header>

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {(isSidebarOpen || true) && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            className={`fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-[#1B3A2D]/5 lg:translate-x-0 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}
          >
            <div className="flex flex-col h-full p-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                  <div className="w-8 h-8 rounded-full bg-[#1B3A2D] flex items-center justify-center text-white font-heading text-lg italic">M</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1B3A2D]/40">World of Mysore Pak</span>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2">
                   <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 space-y-1">
                <button 
                  onClick={() => scrollToId('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeDay === 'overview' ? 'bg-[#1B3A2D]/5 text-[#1B3A2D]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Calendar size={18} /> Overview
                </button>
                <div className="pt-4 pb-2">
                   <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#1B3A2D]/20">Daily Itinerary</h3>
                </div>
                {ITINERARY_DAYS.map(day => (
                  <button 
                    key={day.day}
                    onClick={() => scrollToId(`day-${day.day}`)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeDay === day.day ? 'bg-[#1B3A2D] text-white shadow-lg shadow-[#1B3A2D]/20' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] ${activeDay === day.day ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                       {day.day}
                    </div>
                    Day {day.day}
                  </button>
                ))}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <main className="lg:ml-72 min-h-screen">
        
        {/* Itinerary Header / Overview */}
        <section id="overview" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pt-6 sm:pt-12 pb-12 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative aspect-[4/5] sm:aspect-[21/10] rounded-[28px] sm:rounded-[32px] overflow-hidden mb-8 sm:mb-12 shadow-2xl shadow-[#1B3A2D]/20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/womp tour guide hero.png"
              className="w-full h-full object-cover"
              alt="Mysuru"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/10" />

            {/* Top chip */}
            <div className="absolute top-5 left-5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold uppercase tracking-widest text-[#1B3A2D]">
                <Sparkles size={11} className="text-[#B8956A]" /> Curated guide
              </span>
            </div>

            {/* Bottom title block */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] mb-2 sm:mb-3 drop-shadow-lg">
                Discover<br className="sm:hidden" /> Mysuru
              </h1>
              <p className="text-white/80 text-xs sm:text-sm font-medium max-w-md leading-relaxed">
                3 days through palaces, markets, kitchens — curated by World of Mysore Pak.
              </p>
            </div>
          </motion.div>

          {/* Stats row — chip-style for mobile */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-3 gap-2 sm:gap-3 mb-10 sm:mb-12"
          >
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#1B3A2D]/5 text-center">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#1B3A2D]/40 mb-0.5">Duration</div>
              <div className="font-heading text-lg sm:text-2xl font-bold text-[#1B3A2D] leading-none">3 Days</div>
            </div>
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#1B3A2D]/5 text-center">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#1B3A2D]/40 mb-0.5">Stops</div>
              <div className="font-heading text-lg sm:text-2xl font-bold text-[#1B3A2D] leading-none">18+</div>
            </div>
            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#1B3A2D]/5 text-center">
              <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#1B3A2D]/40 mb-0.5">Rating</div>
              <div className="font-heading text-lg sm:text-2xl font-bold text-[#1B3A2D] leading-none flex items-center justify-center gap-1">
                4.9 <Star size={14} className="text-[#C9972D] fill-[#C9972D]" />
              </div>
            </div>
          </motion.div>

          {/* Intro pull-quote */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-heading text-base sm:text-xl italic text-[#1B3A2D]/60 leading-relaxed border-l-2 border-[#B8956A] pl-4 sm:pl-6"
          >
            &ldquo;Welcome to the city of palaces and pure ghee. This guide takes you
            through the winding heritage of Mysuru — from the grand corridors of the
            Wadiyar dynasty to the serene heights of Chamundi Hills.&rdquo;
          </motion.p>
        </section>

        {/* ── FILTER PILLS ───────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <FilterPill
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              icon={<Globe2 size={12} />}
              label="All places"
            />
            <FilterPill
              active={filter === 'open'}
              onClick={() => setFilter('open')}
              icon={<Clock size={12} />}
              label="Open now"
              accentColor="#10b981"
            />
            <FilterPill
              active={filter === 'favorites'}
              onClick={() => setFilter('favorites')}
              icon={<Heart size={12} className={filter === 'favorites' ? 'fill-current' : ''} />}
              label={favCount > 0 ? `Favorites · ${favCount}` : 'Favorites'}
              accentColor="#ef4444"
            />
            <FilterPill
              active={filter === 'near'}
              onClick={() => {
                setFilter('near');
                if (!userLoc) requestLoc();
              }}
              icon={<Compass size={12} />}
              label={
                filter === 'near' && locStatus === 'loading'
                  ? 'Locating…'
                  : filter === 'near' && locStatus === 'denied'
                  ? 'Need location'
                  : 'Near me'
              }
              accentColor="#3b82f6"
            />
          </div>
        </section>

        {/* The List View */}
        <div className="max-w-4xl mx-auto px-6 lg:px-12 pb-32 space-y-24">
          {placesLoading && places.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-12">Loading itinerary…</p>
          )}
          {ITINERARY_DAYS.map((day, dIdx) => {
            let dayPlaces = [...day.placeIds]
              .map((id) => places.find((p) => p.id === id))
              .filter((p): p is Place => Boolean(p));

            // Apply filters
            if (filter === 'favorites') {
              dayPlaces = dayPlaces.filter((p) => isFav(p.id));
            } else if (filter === 'open') {
              dayPlaces = dayPlaces.filter((p) => isOpenNow(p.hours));
            } else if (filter === 'near' && userLoc) {
              dayPlaces = [...dayPlaces].sort(
                (a, b) =>
                  kmBetween(userLoc, { lat: a.lat, lng: a.lng }) -
                  kmBetween(userLoc, { lat: b.lat, lng: b.lng })
              );
            }

            // Hide entire day if no matches under an active filter
            if (filter !== 'all' && dayPlaces.length === 0) return null;

            return (
              <section key={day.day} id={`day-${day.day}`} className="relative">
                {dIdx < ITINERARY_DAYS.length - 1 && (
                  <div className="absolute left-6 top-10 bottom-0 w-[2px] bg-gray-100 -z-10" />
                )}

                {/* Day Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12"
                >
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#1B3A2D] to-[#0d2218] text-white flex flex-col items-center justify-center shadow-lg shadow-[#1B3A2D]/25">
                      <span className="text-[8px] uppercase tracking-[0.2em] opacity-60 font-bold">Day</span>
                      <span className="font-black text-2xl sm:text-3xl leading-none">{day.day}</span>
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#B8956A] flex items-center justify-center text-[10px]">
                      <Sparkles className="w-3 h-3 text-white" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B3A2D] leading-tight">
                      {day.title}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-[#1B3A2D]/40 font-bold tracking-[0.18em] uppercase mt-1">
                      {day.subtitle}
                    </p>
                  </div>
                </motion.div>

                {/* Stops — modern card stack */}
                <div className="space-y-5 sm:space-y-6 pl-4 sm:pl-4 border-l-2 border-gray-100 ml-5 sm:ml-6">
                  {dayPlaces.map((place, pIdx) => {
                    const cfg = CATEGORY_CONFIG[place.category] ?? { label: place.category, color: '#B8956A' };
                    return (
                      <motion.article
                        key={place.id}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: Math.min(pIdx * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
                        className="group relative"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-[33px] sm:-left-[35px] top-6 w-3.5 h-3.5 rounded-full bg-white border-[3px] border-[#1B3A2D] z-10 shadow-sm group-hover:scale-110 group-hover:border-[#B8956A] transition-all duration-300" />

                        <button
                          onClick={() => router.push(`/tour-guide/place/${place.id}`)}
                          className="block w-full text-left bg-white rounded-3xl overflow-hidden border border-[#1B3A2D]/5 hover:border-[#B8956A]/40 hover:shadow-2xl hover:shadow-[#1B3A2D]/10 hover:-translate-y-1 transition-all duration-500"
                        >
                          {/* Image with badge overlay */}
                          <div className="relative w-full aspect-[16/10] sm:aspect-[16/7] overflow-hidden bg-[#FBF7F0]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={place.image}
                              alt={place.name}
                              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                              loading="lazy"
                            />
                            {/* Bottom gradient for text legibility */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent" />

                            {/* Category chip — top left */}
                            <span
                              className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md shadow-sm"
                              style={{ backgroundColor: cfg.color }}
                            >
                              <span className="text-xs leading-none">{place.emoji}</span>
                              {cfg.label}
                            </span>

                            {/* Top-right: heart + rating */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              <button
                                aria-label={isFav(place.id) ? "Remove from favourites" : "Save to favourites"}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleFav(place.id);
                                }}
                                className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center shadow-sm transition-all ${
                                  isFav(place.id)
                                    ? "bg-rose-500 text-white hover:scale-110"
                                    : "bg-white/95 text-[#1B3A2D]/60 hover:text-rose-500 hover:scale-110"
                                }`}
                              >
                                <Heart size={14} className={isFav(place.id) ? "fill-current" : ""} />
                              </button>
                              {place.rating > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-md text-[#1B3A2D] shadow-sm">
                                  <Star size={11} className="text-[#C9972D] fill-[#C9972D]" />
                                  {place.rating.toFixed(1)}
                                </span>
                              )}
                            </div>

                            {/* Name overlaid on image — bottom */}
                            <h3 className="absolute bottom-3 left-4 right-4 font-heading text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-lg">
                              {place.name}
                            </h3>
                          </div>

                          {/* Body */}
                          <div className="px-4 sm:px-5 py-4 sm:py-5 space-y-3">
                            <p className="font-body text-[13px] sm:text-sm text-[#1B3A2D]/70 leading-[1.65] line-clamp-2">
                              {place.description}
                            </p>

                            {/* Info chips row */}
                            <div className="flex flex-wrap items-center gap-2 text-[11px]">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FBF7F0] text-[#1B3A2D]/70 font-medium">
                                <Clock size={11} /> {place.timeNeeded}
                              </span>
                              {place.entryFee && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FBF7F0] text-[#1B3A2D]/70 font-medium">
                                  {place.entryFee}
                                </span>
                              )}
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FBF7F0] text-[#1B3A2D]/70 font-medium">
                                <MapPin size={11} /> Mysuru
                              </span>
                              {userLoc && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                                  <Compass size={11} />
                                  {formatKm(kmBetween(userLoc, { lat: place.lat, lng: place.lng }))}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span
                                role="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  window.open(`https://www.google.com/maps?q=${place.lat},${place.lng}`, '_blank');
                                }}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B8956A] hover:text-[#1B3A2D] transition-colors"
                              >
                                <Navigation size={11} /> Open maps
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#1B3A2D] group-hover:text-[#B8956A] transition-colors">
                                Read story <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </button>
                      </motion.article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <TourGuideBottomNav />

      <style jsx global>{`
        body {
          background-color: #FBF7F0;
          color: #1B3A2D;
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────
// Filter pill — small reusable presentational component
// ──────────────────────────────────────────────
function FilterPill({
  active,
  onClick,
  icon,
  label,
  accentColor,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accentColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
        active
          ? "text-white shadow-md"
          : "bg-white text-[#1B3A2D]/60 border border-[#1B3A2D]/10 hover:border-[#B8956A]/40"
      }`}
      style={
        active
          ? { backgroundColor: accentColor ?? "#1B3A2D" }
          : undefined
      }
    >
      {icon} {label}
    </button>
  );
}
