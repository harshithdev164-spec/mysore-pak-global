"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase, IMAGE_BUCKET, getImageUrl } from '@/lib/supabase';
import { CATEGORY_CONFIG, type Category } from '@/data/places';
import { ChevronLeft, Upload, Check, AlertCircle, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PlaceDB {
  id: string;
  name: string;
  emoji: string | null;
  category: Category;
  image_url: string | null;
}

export default function AdminExplorePage() {
  const router = useRouter();
  const [places, setPlaces] = useState<PlaceDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, 'ok' | 'err' | 'loading'>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchPlaces();
  }, []);

  async function fetchPlaces() {
    setLoading(true);
    const { data, error } = await (supabase as any).from('places').select('id, name, emoji, category, image_url').order('name');
    if (!error && data) setPlaces(data);
    setLoading(false);
  }

  async function uploadFile(placeId: string, file: File) {
    setUploading(placeId);
    setStatus(s => ({ ...s, [placeId]: 'loading' }));

    try {
      // 1. Compress image client-side (max 1000px)
      const compressed = await compressImage(file, 1000);
      
      // 2. Upload to Supabase Storage
      const fileName = `${placeId}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(fileName, compressed, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      // 3. Get Public URL (Robust method)
      const { data: { publicUrl } } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(fileName);
      const url = `${publicUrl}?t=${Date.now()}`;

      // 4. Update Database
      const { error: dbError } = await (supabase as any)
        .from('places')
        .update({ image_url: url })
        .eq('id', placeId);

      if (dbError) throw dbError;

      // 5. Update local state
      setPlaces(prev => prev.map(p => p.id === placeId ? { ...p, image_url: url } : p));
      setStatus(s => ({ ...s, [placeId]: 'ok' }));
      
    } catch (err: any) {
      console.error("Upload error:", err);
      setStatus(s => ({ ...s, [placeId]: 'err' }));
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1610] text-[#FBF7F0] font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A1610]/95 backdrop-blur-md border-b border-white/10 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-[#B8956A]">Explore Admin</h1>
            <p className="text-xs text-white/40 font-medium">Manage Discovery Place Images</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
             <div className="text-xl font-black text-[#B8956A] leading-none">
               {places.filter(p => p.image_url).length} / {places.length}
             </div>
             <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Images Uploaded</div>
          </div>
          <button 
            onClick={fetchPlaces}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
            title="Refresh List"
          >
            <Loader2 size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto p-6">
        {loading && places.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Loader2 size={48} className="animate-spin mb-4" />
            <p className="font-black uppercase tracking-[0.3em]">Syncing with Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {places.map(place => {
              const cfg = CATEGORY_CONFIG[place.category] || { color: '#B8956A', label: place.category };
              const st = status[place.id];
              const isUploading = uploading === place.id;

              return (
                <div key={place.id} className={`group relative bg-white/5 rounded-3xl overflow-hidden border transition-all duration-300 ${st === 'ok' ? 'border-green-500/50 shadow-lg shadow-green-500/10' : 'border-white/10 hover:border-[#B8956A]/50'}`}>
                  {/* Image Preview */}
                  <div className="relative aspect-video bg-black/40">
                    {place.image_url ? (
                      <img 
                        src={place.image_url} 
                        alt={place.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225/111/444?text=Missing+Image'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                        <ImageIcon size={40} strokeWidth={1} />
                        <span className="text-[10px] uppercase font-bold mt-2">No Image</span>
                      </div>
                    )}
                    
                    {/* Category Tag */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg" style={{ backgroundColor: cfg.color }}>
                      {cfg.label}
                    </div>

                    {/* Status Overlays */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                        <Loader2 size={32} className="animate-spin text-[#B8956A]" />
                      </div>
                    )}
                    {st === 'ok' && (
                      <div className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
                          <Check size={24} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider line-clamp-1">{place.emoji} {place.name}</h3>
                        <p className="text-[10px] font-mono text-white/30 uppercase mt-1">{place.id}</p>
                      </div>
                      <Link href={`/tour-guide/place/${place.id}`} target="_blank" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                        <ExternalLink size={14} />
                      </Link>
                    </div>

                    {/* Actions */}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      ref={el => { fileRefs.current[place.id] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadFile(place.id, file);
                      }}
                    />
                    
                    <button
                      onClick={() => fileRefs.current[place.id]?.click()}
                      disabled={isUploading}
                      className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${
                        place.image_url 
                          ? 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white' 
                          : 'bg-[#B8956A] text-[#0A1610] shadow-lg shadow-[#B8956A]/20 hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {place.image_url ? <ImageIcon size={14} /> : <Upload size={14} />}
                      {place.image_url ? "Replace Image" : "Upload Image"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style jsx global>{`
        body { background-color: #0A1610; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

// ─── Image Compression Utility ───────────────────────────────────────────────
function compressImage(file: File, maxWidth: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error("Canvas failed"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/jpeg', 0.85);
    };
    img.onerror = reject;
    img.src = url;
  });
}
