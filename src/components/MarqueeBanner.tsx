// Pure-CSS marquee — no JS animation overhead, GPU-composited transform only
interface MarqueeBannerProps {
  items: string[];
  bgColor?: string;
  textColor?: string;
  speed?: number;
  separator?: string;
}

const MarqueeBanner = ({
  items,
  bgColor = "bg-[#1B3A2D]",
  textColor = "text-[#FBF7F0]",
  speed = 20,
  separator = "✦",
}: MarqueeBannerProps) => {
  const content = items.join(` ${separator} `) + ` ${separator} `;

  return (
    <div className={`${bgColor} ${textColor} overflow-hidden py-3 select-none`}>
      {/* Two identical copies — CSS animates to -50%, making the loop seamless */}
      <div
        className="flex whitespace-nowrap animate-marquee"
        style={{ "--marquee-duration": `${speed}s` } as React.CSSProperties}
      >
        <span className="font-body text-sm tracking-[0.2em] uppercase font-medium px-4">
          {content}
        </span>
        <span className="font-body text-sm tracking-[0.2em] uppercase font-medium px-4" aria-hidden>
          {content}
        </span>
      </div>
    </div>
  );
};

export default MarqueeBanner;
