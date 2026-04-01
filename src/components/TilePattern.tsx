/**
 * SVG tile pattern decorations inspired by the authentic
 * Mysuru-style green & white geometric tile art from the store.
 * These are used as decorative illustrations throughout the site.
 */
import React from "react";

interface TilePatternProps {
  className?: string;
  opacity?: number;
  color?: string;
  size?: number;
}

/**
 * WOMPBg — uses the official "World Of Mysore Pak-15.svg" brand illustration
 * as a tiled/watermark background across every section.
 *
 * @param opacity  — CSS opacity on the container (SVG paths already have 10%
 *                   internal opacity, so set this value 5-10× higher than you
 *                   would for a plain colour overlay; default 0.55 ≈ ~5.5% net)
 * @param light    — true on dark backgrounds: applies brightness(10) to flip
 *                   the near-black paths to cream/white
 * @param cover    — true: background-size:cover (single large watermark)
 *                   false (default): background-size:1100px, repeat tiles
 */
export const WOMPBg = ({
  opacity = 0.55,
  light = false,
  cover = false,
  className = "",
}: {
  opacity?: number;
  light?: boolean;
  cover?: boolean;
  className?: string;
}) => (
  <div
    aria-hidden
    className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    style={{
      backgroundImage: "url('/womp-bg.svg')",
      backgroundRepeat: cover ? "no-repeat" : "repeat",
      backgroundSize: cover ? "cover" : "1100px auto",
      backgroundPosition: "center",
      opacity,
      filter: light ? "brightness(10)" : "none",
      transform: "translateZ(0)",
      willChange: "auto",
      contain: "strict" as React.CSSProperties["contain"],
    }}
  />
);

/* ── Single Tile Unit (the cross-floral motif) ── */
const SingleTile = ({ color = "#2D5A3D", size = 80 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Center 8-pointed star */}
    <path
      d="M40 28 L44 36 L52 40 L44 44 L40 52 L36 44 L28 40 L36 36 Z"
      fill={color}
      opacity={0.9}
    />
    {/* Corner fleur-de-lis petals - top-left */}
    <path
      d="M0 0 Q20 8 16 20 Q8 16 0 0Z"
      fill={color}
      opacity={0.7}
    />
    <path
      d="M0 0 Q8 20 20 16 Q16 8 0 0Z"
      fill={color}
      opacity={0.7}
    />
    {/* Corner petals - top-right */}
    <path
      d="M80 0 Q60 8 64 20 Q72 16 80 0Z"
      fill={color}
      opacity={0.7}
    />
    <path
      d="M80 0 Q72 20 60 16 Q64 8 80 0Z"
      fill={color}
      opacity={0.7}
    />
    {/* Corner petals - bottom-left */}
    <path
      d="M0 80 Q20 72 16 60 Q8 64 0 80Z"
      fill={color}
      opacity={0.7}
    />
    <path
      d="M0 80 Q8 60 20 64 Q16 72 0 80Z"
      fill={color}
      opacity={0.7}
    />
    {/* Corner petals - bottom-right */}
    <path
      d="M80 80 Q60 72 64 60 Q72 64 80 80Z"
      fill={color}
      opacity={0.7}
    />
    <path
      d="M80 80 Q72 60 60 64 Q64 72 80 80Z"
      fill={color}
      opacity={0.7}
    />
    {/* Cross arms from center */}
    <path
      d="M38 20 Q40 12 42 20 L42 28 L38 28 Z"
      fill={color}
      opacity={0.6}
    />
    <path
      d="M38 52 Q40 60 42 52 L42 60 L38 60 Z"
      fill={color}
      opacity={0.6}
    />
    <path
      d="M20 38 Q12 40 20 42 L28 42 L28 38 Z"
      fill={color}
      opacity={0.6}
    />
    <path
      d="M52 38 Q60 40 52 42 L60 42 L60 38 Z"
      fill={color}
      opacity={0.6}
    />
  </svg>
);

/* ── Repeating tile background pattern (as inline SVG pattern) ── */
export const TilePatternBg = ({
  className = "",
  opacity = 0.06,
  color = "#2D5A3D",
  patternId = "mysuru-tile",
}: TilePatternProps & { patternId?: string }) => (
  <div
    className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    style={{ opacity }}
  >
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id={patternId} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Center star */}
          <path d="M40 28 L44 36 L52 40 L44 44 L40 52 L36 44 L28 40 L36 36 Z" fill={color} />
          {/* Corner petal clusters */}
          <path d="M0 0 Q18 6 14 18 Q6 14 0 0Z" fill={color} />
          <path d="M0 0 Q6 18 18 14 Q14 6 0 0Z" fill={color} />
          <path d="M80 0 Q62 6 66 18 Q74 14 80 0Z" fill={color} />
          <path d="M80 0 Q74 18 62 14 Q66 6 80 0Z" fill={color} />
          <path d="M0 80 Q18 74 14 62 Q6 66 0 80Z" fill={color} />
          <path d="M0 80 Q6 62 18 66 Q14 74 0 80Z" fill={color} />
          <path d="M80 80 Q62 74 66 62 Q74 66 80 80Z" fill={color} />
          <path d="M80 80 Q74 62 62 66 Q66 74 80 80Z" fill={color} />
          {/* Cross arms */}
          <line x1="40" y1="20" x2="40" y2="28" stroke={color} strokeWidth="3" />
          <line x1="40" y1="52" x2="40" y2="60" stroke={color} strokeWidth="3" />
          <line x1="20" y1="40" x2="28" y2="40" stroke={color} strokeWidth="3" />
          <line x1="52" y1="40" x2="60" y2="40" stroke={color} strokeWidth="3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  </div>
);

/* ── Floral vine pattern (inspired by the coral plate design) ── */
export const FloralPatternBg = ({
  className = "",
  opacity = 0.04,
  color = "#C9972D",
}: TilePatternProps) => (
  <div
    className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    style={{ opacity }}
  >
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="mysuru-floral" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          {/* Central flower */}
          <circle cx="60" cy="60" r="6" fill={color} />
          <circle cx="60" cy="60" r="10" fill="none" stroke={color} strokeWidth="1.5" />
          {/* Petals around center */}
          <ellipse cx="60" cy="46" rx="4" ry="8" fill={color} opacity="0.6" />
          <ellipse cx="60" cy="74" rx="4" ry="8" fill={color} opacity="0.6" />
          <ellipse cx="46" cy="60" rx="8" ry="4" fill={color} opacity="0.6" />
          <ellipse cx="74" cy="60" rx="8" ry="4" fill={color} opacity="0.6" />
          {/* Vine curves */}
          <path d="M0 60 Q30 45 60 60 Q90 75 120 60" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
          <path d="M60 0 Q45 30 60 60 Q75 90 60 120" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
          {/* Corner buds */}
          <circle cx="0" cy="0" r="4" fill={color} opacity="0.3" />
          <circle cx="120" cy="0" r="4" fill={color} opacity="0.3" />
          <circle cx="0" cy="120" r="4" fill={color} opacity="0.3" />
          <circle cx="120" cy="120" r="4" fill={color} opacity="0.3" />
          {/* Small leaf shapes */}
          <path d="M20 20 Q30 15 25 25 Q20 30 20 20Z" fill={color} opacity="0.35" />
          <path d="M100 20 Q90 15 95 25 Q100 30 100 20Z" fill={color} opacity="0.35" />
          <path d="M20 100 Q30 95 25 105 Q20 110 20 100Z" fill={color} opacity="0.35" />
          <path d="M100 100 Q90 95 95 105 Q100 110 100 100Z" fill={color} opacity="0.35" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mysuru-floral)" />
    </svg>
  </div>
);

/* ── Decorative border strip (horizontal tile band) ── */
export const TileBorderStrip = ({
  className = "",
  color = "#2D5A3D",
}: {
  className?: string;
  color?: string;
}) => (
  <div className={`w-full overflow-hidden ${className}`}>
    <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="border-tile" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="transparent" />
          <path d="M20 8 L23 16 L31 20 L23 24 L20 32 L17 24 L9 20 L17 16 Z" fill={color} opacity="0.15" />
          <path d="M0 0 Q10 4 7 10 Q3 7 0 0Z" fill={color} opacity="0.1" />
          <path d="M40 0 Q30 4 33 10 Q37 7 40 0Z" fill={color} opacity="0.1" />
          <path d="M0 40 Q10 36 7 30 Q3 33 0 40Z" fill={color} opacity="0.1" />
          <path d="M40 40 Q30 36 33 30 Q37 33 40 40Z" fill={color} opacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#border-tile)" />
    </svg>
  </div>
);

/* ── Corner ornament (single decorative corner piece) ── */
export const CornerOrnament = ({
  className = "",
  color = "#2D5A3D",
  size = 120,
}: {
  className?: string;
  color?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main floral corner */}
    <path
      d="M0 0 Q40 10 30 30 Q10 40 0 0Z"
      fill={color}
      opacity="0.15"
    />
    <path
      d="M0 0 Q10 40 30 30 Q40 10 0 0Z"
      fill={color}
      opacity="0.12"
    />
    {/* Inner arcs */}
    <path
      d="M5 5 Q25 12 20 25"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      opacity="0.2"
    />
    <path
      d="M5 5 Q12 25 25 20"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      opacity="0.2"
    />
    {/* Star accent */}
    <path
      d="M45 45 L48 50 L53 53 L48 56 L45 61 L42 56 L37 53 L42 50 Z"
      fill={color}
      opacity="0.1"
    />
    {/* Small decorative dots */}
    <circle cx="15" cy="15" r="2" fill={color} opacity="0.15" />
    <circle cx="35" cy="10" r="1.5" fill={color} opacity="0.1" />
    <circle cx="10" cy="35" r="1.5" fill={color} opacity="0.1" />
  </svg>
);

export default SingleTile;
