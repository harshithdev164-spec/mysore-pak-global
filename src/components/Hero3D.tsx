"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

/* ─── Floating Image with 3D Perspective ─── */
interface FloatingImageProps {
  src: string;
  alt: string;
  className?: string;
  depth: number; // 0.5 = far, 1 = close
  delay?: number;
  rotation?: number;
  size?: string;
  priority?: boolean;
}

const FloatingImage = ({
  src,
  alt,
  className = "",
  depth,
  delay = 0,
  rotation = 0,
  size = "w-48 h-48",
  priority = false,
}: FloatingImageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 1,
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
      className={`absolute ${className}`}
      style={{
        zIndex: Math.round(depth * 10),
      }}
    >
      <motion.div
        animate={{
          y: [0, -8 * depth, 0],
          rotate: [rotation, rotation + 2, rotation],
        }}
        transition={{
          duration: 4 + depth * 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className={`${size} rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 relative`}
          style={{
            transform: `perspective(800px) rotateY(${rotation}deg)`,
            boxShadow: `0 ${20 * depth}px ${40 * depth}px rgba(27, 58, 45, ${0.15 * depth})`,
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 10rem, (max-width: 1024px) 13rem, 16rem"
            priority={priority}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Gold Sparkle Particle ─── */
const GoldSparkle = ({ style, delay }: { style: React.CSSProperties; delay: number }) => (
  <motion.div
    className="absolute w-1.5 h-1.5 rounded-full bg-[#C9972D]"
    style={style}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.8, 0],
      scale: [0, 1.2, 0],
    }}
    transition={{
      duration: 2.5,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

/* ─── Main Hero Component ─── */
const Hero3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for mouse tracking
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Transform mouse position to rotation values
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

  // Parallax transforms for different depth layers
  const layer1X = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const layer1Y = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  const layer2X = useTransform(smoothX, [-0.5, 0.5], [35, -35]);
  const layer2Y = useTransform(smoothY, [-0.5, 0.5], [25, -25]);
  const layer3X = useTransform(smoothX, [-0.5, 0.5], [12, -12]);
  const layer3Y = useTransform(smoothY, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Generate sparkle positions
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    style: {
      left: `${15 + Math.random() * 70}%`,
      top: `${10 + Math.random() * 80}%`,
    },
    delay: Math.random() * 3,
  }));

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[450px] sm:h-[550px] lg:h-[650px] overflow-visible"
      style={{ perspective: "1200px" }}
    >
      {/* Gold sparkle particles */}
      {sparkles.map((s, i) => (
        <GoldSparkle key={i} style={s.style} delay={s.delay} />
      ))}

      {/* ── Central Hero Image (largest, center stage) ── */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ x: layer1X, y: layer1Y, rotateX, rotateY }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 60 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-3xl overflow-hidden border-3 border-[#C9972D]/30 relative"
              style={{
                boxShadow: "0 30px 60px rgba(27, 58, 45, 0.3), 0 0 80px rgba(201, 151, 45, 0.15)",
              }}
            >
              <Image
                src="/hero-stack.png"
                alt="Mysore Pak Stack"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 14rem, (max-width: 1024px) 18rem, 20rem"
                priority
              />
            </div>
            {/* Reflection glow underneath */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#C9972D]/10 blur-2xl rounded-full" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ── Secondary Image - Top Right (Gift Box) ── */}
      <motion.div
        className="absolute right-2 sm:right-4 top-4 sm:top-8 z-10"
        style={{ x: layer2X, y: layer2Y }}
      >
        <FloatingImage
          src="/hero-giftbox.png"
          alt="Premium Gift Box"
          depth={0.7}
          delay={0.5}
          rotation={-5}
          size="w-36 h-36 sm:w-44 sm:h-44 lg:w-52 lg:h-52"
        />
      </motion.div>

      {/* ── Tertiary Image - Bottom Left (Close-up) ── */}
      <motion.div
        className="absolute left-0 sm:left-4 bottom-8 sm:bottom-12 z-15"
        style={{ x: layer2X, y: layer2Y }}
      >
        <FloatingImage
          src="/hero-closeup.png"
          alt="Mysore Pak Close-up"
          depth={0.85}
          delay={0.7}
          rotation={4}
          size="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48"
        />
      </motion.div>

      {/* ── Small accent image - Top Left (Preparation) ── */}
      <motion.div
        className="absolute left-8 sm:left-16 top-0 sm:top-4 z-5"
        style={{ x: layer3X, y: layer3Y }}
      >
        <FloatingImage
          src="/hero-preparation.png"
          alt="Traditional preparation"
          depth={0.5}
          delay={0.9}
          rotation={-3}
          size="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36"
        />
      </motion.div>

      {/* ── Small accent image - Right Center (Mysore Pak) ── */}
      <motion.div
        className="absolute right-0 sm:right-8 bottom-20 sm:bottom-28 z-8 hidden sm:block"
        style={{ x: layer3X, y: layer3Y }}
      >
        <FloatingImage
          src="/hero-mysore-pak.png"
          alt="Mysore Pak"
          depth={0.6}
          delay={1.1}
          rotation={6}
          size="w-28 h-28 sm:w-32 sm:h-32"
        />
      </motion.div>

      {/* ── Decorative Ring (behind images) ── */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        style={{ x: layer3X, y: layer3Y }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full border border-[#C9972D]/10"
        />
      </motion.div>

      {/* ── Second decorative ring ── */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        style={{ x: layer3X, y: layer3Y }}
      >
        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="w-[350px] h-[350px] sm:w-[460px] sm:h-[460px] lg:w-[570px] lg:h-[570px] rounded-full border border-dashed border-[#2D5A3D]/8"
        />
      </motion.div>

      {/* ── Background glow ── */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full bg-gradient-radial from-[#C9972D]/8 via-[#2D5A3D]/4 to-transparent blur-3xl z-0" />
    </div>
  );
};

export default Hero3D;
