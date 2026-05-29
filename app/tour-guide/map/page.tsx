"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Lightbulb, Layers, X, ExternalLink, Plus, Minus } from 'lucide-react';
import { CATEGORY_CONFIG, type Category } from '@/data/places';
import { calculateDistance } from '@/lib/geoUtils';
import TourGuideBottomNav from '@/components/TourGuideBottomNav';

const MAP_STYLES = [
  { id: 'streets', name: 'Standard', url: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'dark', name: 'Dark', url: 'mapbox://styles/mapbox/dark-v11' },
  { id: 'satellite', name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-streets-v12' }
];

export default function TourGuideMapPage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [findingNearest, setFindingNearest] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[] | null>(null);
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLES[0]);
  const [showStyleSwitcher, setShowStyleSwitcher] = useState(false);
  const [showLocateHint, setShowLocateHint] = useState(true);   // pulsing hint on the locate button

  // 1. Fetch Data
  useEffect(() => {
    fetch('/api/places', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setPlaces(j.data || []))
      .catch((e) => setError("Failed to load map locations."))
      .finally(() => setLoading(false));
  }, []);

  // 2. Initialize Map
  useEffect(() => {
    if (!mapContainer.current || typeof window === 'undefined') return;

    let m: any = null;

    const initMap = async () => {
      try {
        const mapboxgl = (await import('mapbox-gl')).default;
        // CSS side-effect import — TS has no types for .css modules.
        // @ts-expect-error: css file has no type declarations
        await import('mapbox-gl/dist/mapbox-gl.css');

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token || !token.startsWith('pk.')) {
          setError(
            "Map unavailable: a valid Mapbox access token is not configured. Set NEXT_PUBLIC_MAPBOX_TOKEN in your environment to a public token (starts with 'pk.')."
          );
          return;
        }

        mapboxgl.accessToken = token;

        m = new mapboxgl.Map({
          container: mapContainer.current!,
          style: currentStyle.url,
          center: [76.6394, 12.2958],
          zoom: 12,
          attributionControl: false
        });

        m.on('load', () => {
          mapInstance.current = m;
          setMapReady(true);
        });

        // Surface auth/network failures (e.g. invalid token → 401) instead of
        // buffering forever, since 'load' never fires when the style fails.
        m.on('error', (e: any) => {
          const msg: string = e?.error?.message || '';
          if (/401|unauthorized|access token|forbidden/i.test(msg)) {
            setError(
              "Map failed to load: the Mapbox access token was rejected. Check NEXT_PUBLIC_MAPBOX_TOKEN."
            );
          }
        });

        // Custom right-side controls replace Mapbox NavigationControl so all
        // buttons share the same w-12 h-12 rounded-2xl shape.

      } catch (err: any) {
        setError(`Map Init Failed: ${err.message}`);
      }
    };

    if (!mapInstance.current) {
      initMap();
    } else {
      mapInstance.current.setStyle(currentStyle.url);
    }
  }, [currentStyle]);

  // 3. Sync Markers
  useEffect(() => {
    if (!mapInstance.current || loading || !mapReady) return;

    const syncMarkers = async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      
      const visible = activeCategory === 'all' 
        ? places 
        : places.filter(p => p.category === activeCategory);

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      visible.forEach((p, i) => {
        const cfg = CATEGORY_CONFIG[p.category as Category] || { color: '#B8956A', label: 'Place', borderColor: '#B8956A' };
        const imgUrl = p.image_url || `https://maojwszmbrlnrjrllhar.supabase.co/storage/v1/object/public/places-image/${p.id}.jpg`;
        
        const el = document.createElement('div');
        el.className = 'marker-pin-wrapper';
        el.style.cursor = 'pointer';

        el.innerHTML = `
          <div style="position: relative; width: 44px; height: 44px;">
            <div style="position: absolute; width: 100%; height: 100%; background: white; border-radius: 50%; box-shadow: 0 4px 15px rgba(0,0,0,0.25); border: 2.5px solid ${cfg.color}; z-index: 1;"></div>
            <div style="position: absolute; top: 4px; left: 4px; width: 36px; height: 36px; border-radius: 50%; overflow: hidden; z-index: 2; background: ${cfg.color}15; display: flex; align-items: center; justify-content: center;">
              <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
              <span style="display: none; font-size: 18px;">${p.emoji || '📍'}</span>
            </div>
            <div style="position: absolute; bottom: -4px; left: 50%; margin-left: -6px; width: 12px; height: 12px; background: white; border-right: 2.5px solid ${cfg.color}; border-bottom: 2.5px solid ${cfg.color}; transform: rotate(45deg); z-index: 0;"></div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 35, closeButton: false }).setHTML(`
          <div style="padding: 10px; min-width: 160px; font-family: var(--font-serif); color: #1B3A2D;">
            <div style="font-weight: 900; font-size: 16px; margin-bottom: 4px;">${p.name}</div>
            <div style="font-size: 10px; color: ${cfg.color}; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;">${cfg.label}</div>
            <button onclick="window.location.href='/tour-guide/place/${p.id}'" style="width: 100%; background: #1B3A2D; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer;">View Details</button>
          </div>
        `);

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([p.lng, p.lat])
          .setPopup(popup)
          .addTo(mapInstance.current);
        
        markersRef.current.push(marker);
      });
    };

    syncMarkers();
  }, [places, loading, activeCategory, mapReady]);

  // 4. Find Nearest Logic
  const findNearest = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported.");
      return;
    }

    setFindingNearest(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: uLat, longitude: uLng } = pos.coords;
        const sorted = [...places].map(p => ({
          ...p,
          dist: calculateDistance(uLat, uLng, p.lat, p.lng)
        })).sort((a, b) => a.dist - b.dist);

        setNearbyPlaces(sorted.slice(0, 3));
        setFindingNearest(false);
      },
      (err) => {
        alert("GPS Error. Check permissions.");
        setFindingNearest(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FBF7F0] overflow-hidden font-body">
      {/* Mini Header */}
      <header className="shrink-0 bg-white border-b border-[#1B3A2D]/10 z-50 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={20} className="text-[#1B3A2D]" />
        </button>
        <div className="flex-1">
          <h1 className="font-heading text-sm font-black text-[#1B3A2D] uppercase tracking-widest">Discovery Map</h1>
        </div>
      </header>

      {/* Map Viewport */}
      <main className="flex-1 relative overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

        {/* ── Top filter strip — sits inside the map viewport ── */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-white/95 via-white/80 to-transparent backdrop-blur-sm pt-3 pb-5 px-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {(['all', 'heritage', 'temple', 'nature', 'culture', 'food', 'adventure'] as const).map((cat) => {
              const isActive = activeCategory === cat;
              const accent = cat === 'all' ? '#1B3A2D' : (CATEGORY_CONFIG[cat as Category]?.color ?? '#C9972D');
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'bg-white/90 text-[#1B3A2D]/60 hover:bg-white shadow-sm border border-black/5'
                  }`}
                  style={isActive ? { backgroundColor: accent, boxShadow: `0 4px 14px ${accent}40` } : undefined}
                >
                  {cat === 'all' ? '🌍' : ''} {cat}
                </button>
              );
            })}
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 transition-colors"
              >
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Right-side floating controls (all uniform w-12 h-12 rounded-2xl) ── */}
        <div className="absolute top-16 right-3 z-40 flex flex-col gap-2.5">
          {/* Zoom in */}
          <MapBtn
            label="Zoom in"
            onClick={() => mapInstance.current?.zoomIn()}
            icon={<Plus size={20} strokeWidth={2.5} />}
          />
          {/* Zoom out */}
          <MapBtn
            label="Zoom out"
            onClick={() => mapInstance.current?.zoomOut()}
            icon={<Minus size={20} strokeWidth={2.5} />}
          />

          {/* Map style switcher */}
          <div className="relative">
            <MapBtn
              label="Map style"
              onClick={() => setShowStyleSwitcher(!showStyleSwitcher)}
              icon={<Layers size={20} />}
            />
            {showStyleSwitcher && (
              <div className="absolute top-0 right-14 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[140px] flex flex-col gap-1 overflow-hidden">
                {MAP_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => { setCurrentStyle(style); setShowStyleSwitcher(false); }}
                    className={`px-4 py-2 text-[10px] font-bold rounded-xl text-left transition-colors whitespace-nowrap ${currentStyle.id === style.id ? 'bg-[#1B3A2D] text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Locate / Near me — with pulsing hint */}
          <div className="relative">
            <button
              onClick={() => { setShowLocateHint(false); findNearest(); }}
              disabled={findingNearest}
              aria-label="Find places near me"
              className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white shadow-xl border border-gray-100 active:scale-90 ${
                findingNearest ? 'text-gray-300' : 'text-[#C9972D] hover:bg-gray-50'
              }`}
            >
              {findingNearest ? <Loader2 size={20} className="animate-spin" /> : <Lightbulb size={20} className="fill-[#C9972D]/20" />}
              {/* Pulsing ring to draw attention until the user taps it once */}
              {showLocateHint && !findingNearest && (
                <span className="absolute inset-0 rounded-2xl ring-2 ring-[#C9972D] animate-ping opacity-70 pointer-events-none" />
              )}
              {/* Red dot indicator */}
              {showLocateHint && !findingNearest && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-white" />
              )}
            </button>
            {/* Tooltip label slot — only when the hint is active */}
            {showLocateHint && (
              <div className="absolute top-1/2 right-14 -translate-y-1/2 bg-[#1B3A2D] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg whitespace-nowrap shadow-lg">
                Tap to find places near you
                <span className="absolute top-1/2 -translate-y-1/2 -right-1 w-2 h-2 bg-[#1B3A2D] rotate-45" />
              </div>
            )}
          </div>
        </div>

        {/* Nearby Results Popup */}
        {nearbyPlaces && (
          <div className="absolute inset-x-4 bottom-24 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white/95 backdrop-blur-md rounded-[32px] shadow-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-lg font-black text-[#1B3A2D]">Gems Nearby</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Recommended for you</p>
                </div>
                <button onClick={() => setNearbyPlaces(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  <X size={20} className="text-[#1B3A2D]" />
                </button>
              </div>
              <div className="space-y-3">
                {nearbyPlaces.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-3 rounded-2xl bg-[#FBF7F0] border border-black/5 group hover:bg-[#1B3A2D] hover:border-[#1B3A2D] transition-all cursor-pointer" onClick={() => {
                    mapInstance.current?.flyTo({ center: [p.lng, p.lat], zoom: 16 });
                    setNearbyPlaces(null);
                  }}>
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                      <img src={p.image_url || `https://maojwszmbrlnrjrllhar.supabase.co/storage/v1/object/public/places-image/${p.id}.jpg`} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-sm font-bold text-[#1B3A2D] group-hover:text-white truncate">{p.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-[#C9972D] uppercase tracking-tighter">{p.dist.toFixed(1)} KM AWAY</span>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-lg bg-white/50 group-hover:bg-white flex items-center justify-center transition-colors">
                      <ExternalLink size={14} className="text-[#1B3A2D]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* State Overlays */}
        {(loading || !mapReady) && !error && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 size={40} className="text-[#1B3A2D] animate-spin mb-4" />
            <p className="font-heading text-sm font-bold text-[#1B3A2D] tracking-widest animate-pulse">PREPARING DISCOVERY...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm px-8 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <X size={24} className="text-rose-500" />
            </div>
            <p className="font-heading text-sm font-black text-[#1B3A2D] tracking-widest mb-2">MAP UNAVAILABLE</p>
            <p className="text-xs text-gray-500 max-w-xs leading-relaxed">{error}</p>
          </div>
        )}


      </main>

      <style jsx global>{`
        .mapboxgl-popup-content { 
          border-radius: 20px; 
          padding: 12px; 
          box-shadow: 0 15px 45px rgba(0,0,0,0.2) !important; 
          border: 1px solid rgba(27,58,45,0.05); 
          color: #1B3A2D;
          font-family: var(--font-poppins);
        }
        .mapboxgl-popup-content h3, .mapboxgl-popup-content .font-serif {
          font-family: var(--font-playfair);
        }
        .mapboxgl-ctrl-group { border-radius: 12px !important; border: none !important; box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; }
        .mapboxgl-marker { transition: none !important; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Mobile bottom navigation */}
      <TourGuideBottomNav />
    </div>
  );
}

// ──────────────────────────────────────────────
// Reusable map control button — uniform w-12 h-12 rounded-2xl
// ──────────────────────────────────────────────
function MapBtn({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-xl border border-gray-100 text-[#1B3A2D] hover:bg-gray-50 active:scale-95 transition-all"
    >
      {icon}
    </button>
  );
}
