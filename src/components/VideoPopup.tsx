"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Volume2, VolumeX, Maximize2 } from "lucide-react";

const VIDEO_SRC: string | null = "/our-story.mp4";
const SHOW_DELAY_MS = 4000;

export default function VideoPopup() {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onScroll() {
      const scrollBottom = window.scrollY + window.innerHeight;
      const threshold = document.body.scrollHeight - 320;
      const isNear = scrollBottom >= threshold;
      setNearFooter((prev) => (prev === isNear ? prev : isNear));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (open) {
      v.muted = muted;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [open]);

  // Track fullscreen — cover both standard and webkit (iOS Safari)
  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(
        !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
      );
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
    if (!isFs) {
      // iOS Safari uses webkitEnterFullscreen on the video element
      if (v.requestFullscreen) {
        await v.requestFullscreen();
      } else if ((v as any).webkitEnterFullscreen) {
        (v as any).webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      data-videopopup
      animate={{ opacity: nearFooter ? 0 : 1, y: nearFooter ? 16 : 0, pointerEvents: nearFooter ? "none" : "auto" }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed bottom-6 left-4 md:left-6 z-50 flex flex-col items-start gap-3"
    >

      {/* ── Expanded player ── */}
      <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-[300px] sm:w-[340px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#0D1F17]"
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#1B3A2D]">
            <span className="font-body text-[11px] font-semibold tracking-widest uppercase text-[#C9972D]">
              World of Mysore Pak
            </span>
            <div className="flex items-center gap-2">
              {VIDEO_SRC && (
                <>
                  {/* Mute toggle */}
                  <button
                    onClick={() => {
                      const newMuted = !muted;
                      setMuted(newMuted);
                      if (videoRef.current) videoRef.current.muted = newMuted;
                    }}
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label={muted ? "Unmute" : "Mute"}
                  >
                    {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Fullscreen toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label="Fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
                aria-label="Close video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video container
              Portrait video (9:16) → rotated 90° to fill a 16:9 box.
              Math: container = W × (W·9/16). Video before rotation:
                css-width  = W·9/16  → 56.25% of container width
                css-height = W       → 177.78% of container height
              After rotate(90deg) it visually fills the box perfectly.
              In fullscreen we clear the transform so the browser handles it. */}
          {VIDEO_SRC ? (
            <div className="w-full aspect-video relative overflow-hidden bg-black">
              <video
                ref={videoRef}
                src={VIDEO_SRC}
                playsInline
                loop
                muted={muted}
                preload="none"
                style={
                  isFullscreen
                    ? { width: "100%", height: "100%", objectFit: "contain" }
                    : {
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "56.25%",
                        height: "177.78%",
                        transform: "translate(-50%, -50%) rotate(-90deg)",
                        objectFit: "cover",
                      }
                }
              />
            </div>
          ) : (
            <div className="w-full aspect-video flex flex-col items-center justify-center bg-[#0D1F17] gap-3">
              <div className="w-12 h-12 rounded-full bg-[#C9972D]/20 flex items-center justify-center">
                <Play className="w-5 h-5 text-[#C9972D] ml-0.5" />
              </div>
              <p className="font-body text-xs text-white/40 tracking-wide">Video coming soon</p>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* ── Collapsed pill ── */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group relative flex items-center gap-2.5 bg-[#1B3A2D] hover:bg-[#243f30] text-white pl-3 pr-4 py-2.5 rounded-full shadow-lg border border-[#C9972D]/30 hover:border-[#C9972D]/60 transition-all duration-300 hover:scale-105 active:scale-95"
          aria-label="Watch our story"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9972D] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#C9972D]" />
          </span>
          <span className="font-body text-[11px] font-semibold tracking-widest uppercase text-[#FBF7F0]/90 whitespace-nowrap">
            Watch Our Story
          </span>
          <Play className="w-3.5 h-3.5 text-[#C9972D] group-hover:scale-110 transition-transform" />
        </button>
      )}
    </motion.div>
  );
}
