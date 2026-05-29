"use client";

import { useParams, useRouter } from 'next/navigation';
import { CATEGORY_CONFIG, type Category } from '@/data/places';
import { placeLongFormContent } from '@/data/place-content';
import {
  ChevronLeft, MapPin, Clock, Ticket, Star, Sunrise,
  Lightbulb, Navigation, Share2, Info, Calendar,
  Bus, Car, Footprints, CameraOff, HelpCircle, ArrowRight, Heart
} from 'lucide-react';
import TourGuideBottomNav from '@/components/TourGuideBottomNav';
import { useFavorites } from '@/lib/tour-guide-utils';
import { useEffect, useState, useRef } from 'react';
import { fetchPlaceDetail, PlaceDetail } from '@/lib/supabase';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function PlaceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [detail, setDetail] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const longForm = placeLongFormContent[id as string];
  const { isFav, toggle: toggleFav } = useFavorites();
  const isThisFav = detail ? isFav(detail.id) : false;
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (!id) return;
    fetchPlaceDetail(id as string).then((res) => {
      setDetail(res);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] text-[#1B3A2D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1B3A2D]/10 border-t-[#B8956A] rounded-full animate-spin" />
          <p className="text-xs font-serif tracking-[0.3em] uppercase opacity-40">Curating Experience…</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-[#FBF7F0] text-[#1B3A2D] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-serif mb-4">Location Unmapped</h1>
        <button
          onClick={() => router.back()}
          className="px-8 py-3 bg-[#1B3A2D] text-white rounded-full font-bold shadow-xl"
        >
          Return to Guide
        </button>
      </div>
    );
  }

  const cfg = CATEGORY_CONFIG[detail.category as Category] ?? {
    label: detail.category,
    color: '#B8956A',
    borderColor: '#B8956A',
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#1B3A2D] font-body selection:bg-[#B8956A] selection:text-white pb-20">
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#B8956A] z-[70] origin-left"
        style={{ scaleX }}
      />

      <main>
        {/* Magazine Hero Section — floating back/save, mobile-optimized typography */}
        <section className="relative w-full h-[60vh] sm:h-[70vh] md:h-[85vh] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={detail.image_url || `https://maojwszmbrlnrjrllhar.supabase.co/storage/v1/object/public/places-image/${detail.id}.jpg`}
            alt={detail.name}
            className="w-full h-full object-cover scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590733441218-36938a9d167a?q=80&w=1200'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A2D] via-[#1B3A2D]/15 to-transparent" />

          {/* Floating circular controls */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              aria-label="Back"
              className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md text-[#1B3A2D] flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFav(detail.id)}
                aria-label={isThisFav ? "Remove from favourites" : "Save place"}
                aria-pressed={isThisFav}
                className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-105 transition-all ${
                  isThisFav
                    ? "bg-rose-500 text-white"
                    : "bg-white/95 text-[#1B3A2D] hover:bg-white hover:text-rose-500"
                }`}
              >
                <Heart size={20} className={isThisFav ? "fill-current" : ""} />
              </button>
              <button
                onClick={() => {
                  const url = typeof window !== "undefined" ? window.location.href : "";
                  if (navigator.share) {
                    navigator.share({ title: detail.name, url }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(url).catch(() => {});
                  }
                }}
                aria-label="Share"
                className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md text-[#1B3A2D] flex items-center justify-center shadow-lg hover:bg-white hover:scale-105 transition-all"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10 md:p-16 lg:p-24 text-white">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl"
            >
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-3 sm:mb-5 text-white shadow-md"
                style={{ backgroundColor: cfg.color }}
              >
                {cfg.label}
              </span>
              <h1 className="font-heading font-black leading-[1.04] mb-3 sm:mb-5 drop-shadow-lg text-[2.4rem] sm:text-6xl lg:text-7xl xl:text-8xl">
                {detail.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-white/85 text-[11px] sm:text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-[#C9972D] fill-[#C9972D]" /> {detail.rating} rating
                </div>
                <div className="flex items-center gap-1.5"><MapPin size={14} /> Mysuru</div>
                <div className="flex items-center gap-1.5"><Clock size={14} /> {detail.time_needed}</div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-10 sm:py-16 lg:py-20 grid lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-14 sm:space-y-20 lg:space-y-24">

            {/* Quick info row — Location · Hours · Best time (matches reference UI) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-3 gap-2 sm:gap-3 -mt-4 sm:-mt-10 lg:-mt-16 relative z-10 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#1B3A2D]/5 shadow-xl shadow-[#1B3A2D]/5"
            >
              <InfoQuick icon={<MapPin size={16} />} label="Location" value="Mysuru, KA" />
              <InfoQuick icon={<Clock size={16} />} label="Hours" value={detail.hours || "Always open"} />
              <InfoQuick icon={<Sunrise size={16} />} label="Best time" value={detail.best_time || "—"} />
            </motion.div>

            {/* Introduction — refined mobile typography */}
            <article>
              <p className="font-body text-[15px] sm:text-lg lg:text-xl text-[#1B3A2D]/85 leading-[1.7] sm:leading-[1.75] first-letter:text-5xl sm:first-letter:text-7xl first-letter:font-heading first-letter:float-left first-letter:mr-3 sm:first-letter:mr-4 first-letter:mt-1.5 first-letter:leading-none first-letter:text-[#B8956A] first-letter:font-black">
                {longForm?.intro || detail.description}
              </p>
            </article>

            {/* History Section */}
            {longForm?.history && (
              <section id="history" className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-[#1B3A2D]/10" />
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#B8956A]">{longForm.history.title}</h2>
                  <div className="h-[1px] flex-1 bg-[#1B3A2D]/10" />
                </div>
                <div className="columns-1 md:columns-2 gap-12 space-y-6 text-[#1B3A2D]/80 leading-relaxed text-lg font-heading">
                  {longForm.history.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                
                {/* GEO Fact Box */}
                <motion.div 
                  whileInView={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  className="p-8 md:p-12 rounded-[40px] bg-white border border-[#B8956A]/20 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 text-[#B8956A]/5 group-hover:rotate-12 transition-transform duration-1000">
                    <Info size={120} />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3 text-[#B8956A]">
                      <Info size={20} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">GEO Fact Box</span>
                    </div>
                    <p className="text-xl md:text-2xl font-heading italic leading-relaxed text-[#1B3A2D]">
                      {longForm.history.factBox}
                    </p>
                  </div>
                </motion.div>
              </section>
            )}

            {/* Architecture Section */}
            {longForm?.architecture && (
              <section id="architecture" className="space-y-12">
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-heading font-black">{longForm.architecture.title}</h2>
                  <p className="text-lg text-[#1B3A2D]/70">{longForm.architecture.content}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {longForm.architecture.highlights.map((item, i) => (
                    <div key={i} className="p-8 rounded-3xl bg-white border border-[#1B3A2D]/5 hover:border-[#B8956A]/30 transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-[#FBF7F0] flex items-center justify-center text-[#B8956A] mb-6 group-hover:bg-[#B8956A] group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <h3 className="text-xl font-heading font-bold mb-3">{item.title}</h3>
                      <p className="text-sm text-[#1B3A2D]/60 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Attractions Section */}
            {longForm?.attractions && (
              <section id="attractions" className="space-y-12">
                <div className="flex items-center gap-4">
                   <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#B8956A]">{longForm.attractions.title}</h2>
                   <div className="h-[1px] flex-1 bg-[#1B3A2D]/10" />
                </div>
                <div className="space-y-4">
                  {longForm.attractions.items.map((item, i) => (
                    <div key={i} className="flex gap-6 p-6 rounded-2xl hover:bg-white transition-colors group">
                      <div className="text-2xl font-heading text-[#B8956A] opacity-20 group-hover:opacity-100 transition-opacity">{(i + 1).toString().padStart(2, '0')}</div>
                      <div>
                        <h4 className="text-xl font-heading font-bold mb-1">{item.name}</h4>
                        <p className="text-sm text-[#1B3A2D]/60">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Illumination & Events */}
            {longForm?.illumination && (
              <section className="bg-[#1B3A2D] rounded-[50px] p-8 md:p-16 text-white space-y-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 blur-[100px] -mr-32 -mt-32" />
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 text-yellow-400">
                    <Sunrise size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Spectacle</span>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-heading font-black">{longForm.illumination.title}</h2>
                  <p className="text-lg text-white/70 leading-relaxed font-heading italic max-w-2xl">
                    "{longForm.illumination.content}"
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 relative z-10">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-widest text-white/40">Schedule</h4>
                    <ul className="space-y-3">
                      {longForm.illumination.schedule.map((s, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Display Timing</p>
                       <p className="text-xl font-heading font-bold">{longForm.illumination.timing}</p>
                    </div>
                    <p className="text-xs text-white/40 italic">{longForm.illumination.cost}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Timings & Tickets Tables */}
            {(longForm?.timings || longForm?.tickets) && (
              <section id="planning" className="grid md:grid-cols-2 gap-12">
                {longForm.timings && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <Clock size={24} className="text-[#B8956A]" /> Timings
                    </h3>
                    <div className="rounded-3xl overflow-hidden border border-[#1B3A2D]/5 bg-white">
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-[#1B3A2D]/5">
                          {longForm.timings.table.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[#1B3A2D]/40">{row.day}</td>
                              <td className="px-6 py-4 text-sm font-bold">{row.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[10px] text-[#1B3A2D]/40 italic leading-relaxed">{longForm.timings.disclaimer}</p>
                  </div>
                )}

                {longForm.tickets && (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <Ticket size={24} className="text-[#B8956A]" /> Ticket Prices
                    </h3>
                    <div className="rounded-3xl overflow-hidden border border-[#1B3A2D]/5 bg-white">
                      <table className="w-full text-left">
                        <tbody className="divide-y divide-[#1B3A2D]/5">
                          {longForm.tickets.table.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-xs font-black uppercase tracking-wider text-[#1B3A2D]/40">{row.category}</td>
                              <td className="px-6 py-4 text-sm font-bold">{row.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#B8956A]/5 border border-[#B8956A]/10 flex gap-3">
                      <Info size={16} className="text-[#B8956A] shrink-0" />
                      <p className="text-[10px] text-[#B8956A] font-medium leading-relaxed">{longForm.tickets.audioGuide}</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* How to Reach & Best Time */}
            {longForm?.howToReach && (
              <section id="access" className="space-y-16">
                 <div className="p-8 md:p-12 rounded-[40px] bg-white border border-[#1B3A2D]/5 shadow-xl space-y-12">
                    <div className="space-y-4">
                      <h3 className="text-3xl font-heading font-black">{longForm.howToReach.title}</h3>
                      <div className="flex items-start gap-3 text-[#1B3A2D]/60">
                        <MapPin size={20} className="shrink-0 mt-1" />
                        <p className="text-sm font-medium">{longForm.howToReach.address}</p>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-8">
                      {longForm.howToReach.options.map((opt, i) => (
                        <div key={i} className="space-y-3">
                          <div className="flex items-center gap-3 text-[#B8956A]">
                            {opt.mode.includes('Auto') && <Footprints size={18} />}
                            {opt.mode.includes('Bus') && <Bus size={18} />}
                            {opt.mode.includes('Car') && <Car size={18} />}
                            {opt.mode.includes('Bengaluru') && <ArrowRight size={18} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{opt.mode}</span>
                          </div>
                          <p className="text-xs text-[#1B3A2D]/70 leading-relaxed">{opt.description}</p>
                        </div>
                      ))}
                    </div>
                 </div>

                 {longForm.bestTime && (
                   <div className="space-y-12">
                     <h3 className="text-3xl font-heading font-black text-center">{longForm.bestTime.title}</h3>
                     <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {longForm.bestTime.seasons.map((s, i) => (
                          <div key={i} className="p-6 rounded-3xl bg-white border border-[#1B3A2D]/5 hover:scale-[1.02] transition-transform">
                             <h5 className="text-sm font-black text-[#B8956A] mb-2">{s.season}</h5>
                             <p className="text-[11px] text-[#1B3A2D]/60 leading-relaxed">{s.description}</p>
                          </div>
                        ))}
                     </div>
                     <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-[#1B3A2D] text-white text-center space-y-3">
                        <p className="text-sm font-heading italic">"{longForm.bestTime.advice}"</p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Pro Advice</p>
                     </div>
                   </div>
                 )}
              </section>
            )}

            {/* Insider Tips */}
            {longForm?.tips && (
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-[#1B3A2D]/10" />
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#B8956A]">Insider Tips</h2>
                  <div className="h-[1px] flex-1 bg-[#1B3A2D]/10" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {longForm.tips.map((tip, i) => (
                    <div key={i} className="flex gap-4 p-6 rounded-2xl bg-white border border-[#1B3A2D]/5">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-[#B8956A]/10 flex items-center justify-center text-[#B8956A]">
                        <Lightbulb size={16} />
                      </div>
                      <p className="text-sm font-medium text-[#1B3A2D]/80 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQs */}
            {longForm?.faqs && (
              <section className="space-y-12">
                <h3 className="text-3xl font-heading font-black flex items-center gap-4">
                  <HelpCircle size={32} className="text-[#B8956A]" /> Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {longForm.faqs.map((faq, i) => (
                    <details key={i} className="group rounded-3xl border border-[#1B3A2D]/5 bg-white overflow-hidden">
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                        <span className="font-heading font-bold text-lg pr-8">{faq.q}</span>
                        <ChevronLeft className="-rotate-90 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-6 pb-6 text-[#1B3A2D]/60 text-sm leading-relaxed border-t border-[#1B3A2D]/5 pt-6">
                        {faq.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Conclusion */}
            <footer className="pt-20 text-center space-y-8">
               <div className="w-24 h-[1px] bg-[#1B3A2D]/20 mx-auto" />
               <p className="text-3xl font-heading italic text-[#1B3A2D]/90 max-w-2xl mx-auto leading-relaxed">
                 {longForm?.conclusion}
               </p>
               <button
                 onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#B8956A] hover:text-[#1B3A2D] transition-colors"
               >
                 Back to Top
               </button>
            </footer>

          </div>

          {/* Sidebar / Sidebar Widgets */}
          <aside className="lg:col-span-4 space-y-12">
            
            {/* Quick Actions Card */}
            <div className="sticky top-24 space-y-8">
              <div className="p-8 rounded-[40px] bg-[#1B3A2D] text-white shadow-2xl space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Next Destination?</p>
                  <h4 className="text-2xl font-heading font-bold">Plan Your Visit</h4>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-yellow-400">
                        <Ticket size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Entry From</p>
                        <p className="text-lg font-bold">{detail.entry_fee || '₹50'}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Closes At</p>
                        <p className="text-lg font-bold">5:30 PM</p>
                      </div>
                   </div>
                </div>

                <button
                  onClick={() => window.open(`https://www.google.com/maps?q=${detail.lat},${detail.lng}`, '_blank')}
                  className="w-full py-5 rounded-2xl bg-[#B8956A] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <Navigation size={16} fill="currentColor" />
                  Get Directions
                </button>
              </div>

              {/* Rules & Warnings */}
              <div className="p-8 rounded-[40px] bg-white border border-red-100 space-y-6">
                <div className="flex items-center gap-3 text-red-500">
                  <CameraOff size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Important Rules</span>
                </div>
                <p className="text-sm text-[#1B3A2D]/60 leading-relaxed font-medium">
                  {longForm?.rules || "Photography inside the interior is strictly prohibited. You may take photos on the grounds."}
                </p>
              </div>

              {/* Nearby Mini Table */}
              {longForm?.nearby && (
                <div className="space-y-6">
                  <h5 className="text-xs font-black uppercase tracking-widest text-[#1B3A2D]/40 px-2">Nearby Gems</h5>
                  <div className="space-y-2">
                    {longForm.nearby.table.slice(0, 4).map((n, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#1B3A2D]/5 hover:border-[#B8956A]/30 transition-colors">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold">{n.name}</p>
                          <p className="text-[9px] text-[#1B3A2D]/40 uppercase font-black">{n.type}</p>
                        </div>
                        <p className="text-[10px] font-black text-[#B8956A]">{n.distance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </aside>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <TourGuideBottomNav />

      {/* Global Aesthetics */}
      <style jsx global>{`
        body {
          background-color: #FBF7F0;
          color: #1B3A2D;
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #FBF7F0;
        }
        ::-webkit-scrollbar-thumb {
          background: #B8956A;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #1B3A2D;
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────
// Quick info chip used in the floating info row
// ──────────────────────────────────────────────
function InfoQuick({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FBF7F0] text-[#B8956A] mx-auto mb-1.5">
        {icon}
      </div>
      <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#1B3A2D]/40 font-bold">
        {label}
      </div>
      <div className="text-[11px] sm:text-sm font-bold text-[#1B3A2D] mt-0.5 truncate">
        {value}
      </div>
    </div>
  );
}
