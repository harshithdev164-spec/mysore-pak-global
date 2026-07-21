import Link from "next/link";
import Image from "next/image";
import { Home, ShoppingBag, Sparkles, Leaf, Clock, PackageCheck, ChevronRight } from "lucide-react";
import { createServerClient } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/data/products";

// Same categories as the homepage strip so returning visitors recognise the
// nav even from a 404 landing.
const POPULAR_CATEGORIES = [
  { name: "Mysore Pak",  slug: "mysore-pak",  img: "/mysoree paak.png" },
  { name: "Gift Boxes",  slug: "gift-boxes",  img: "/Gift Boxes.webp" },
  { name: "Ghee Sweets", slug: "ghee-sweets", img: "/ghee-sweets.webp" },
  { name: "Namkeens",    slug: "namkeens",    img: "/Namkeen.webp" },
  { name: "Chocolates",  slug: "chocolates",  img: "/chocolates.webp" },
];

// Server-side 404 with default brand content. Hit by:
//  - unknown product slugs (via notFound() in app/products/[slug]/page.tsx)
//  - unknown category slugs (via /c/[category] notFound())
//  - any typo'd URL
// Fetches 4 featured products so visitors always land on something clickable
// instead of a dead-end "Return to Home" link.
export default async function GlobalNotFound() {
  let featured: Product[] = [];
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("products")
      .select(`
        id, name, slug, base_price, image, badge,
        weights:product_weights(id, label, price, stock_quantity)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    featured = ((data ?? []) as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.base_price,
      category: "",
      description: "",
      ingredients: "",
      storage: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      weights: ((p.weights ?? []) as any[]).map((w) => ({
        id: w.id, label: w.label, price: w.price, stock_quantity: w.stock_quantity ?? 100,
      })),
      image: p.image ?? "",
      badge: p.badge ?? undefined,
      rating: 0,
      reviews: 0,
    }));
  } catch {
    // DB unreachable — page still renders with the hero + categories.
    featured = [];
  }

  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1B3A2D] pt-32 sm:pt-40 pb-20 sm:pb-28">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 70% at 50% 30%, #C9972D22 0%, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-body text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-[#C9972D] mb-5">
            Page not found
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FBF7F0] leading-[1.05] mb-6">
            The sweet you&apos;re looking for isn&apos;t here.
          </h1>
          <p className="font-body text-base sm:text-lg text-[#FBF7F0]/70 leading-relaxed mb-10 max-w-xl mx-auto">
            The page may have moved, been retired, or the link is off by a
            letter. Let&apos;s get you back to something delicious.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-7 py-4 bg-[#C9972D] text-[#1B3A2D] font-body text-sm font-bold uppercase tracking-wider rounded-full hover:bg-[#b8862a] transition-colors shadow-lg shadow-[#C9972D]/30"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse the shop
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-7 py-4 border border-[#FBF7F0]/30 text-[#FBF7F0] font-body text-sm font-bold uppercase tracking-wider rounded-full hover:bg-[#FBF7F0]/10 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────── */}
      <section className="bg-[#1B3A2D] text-[#FBF7F0] border-t border-[#C9972D]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { Icon: Sparkles,     label: "Freshly Made to Order" },
            { Icon: Leaf,         label: "100% Pure Cow Ghee" },
            { Icon: Clock,        label: "60-Day Shelf Life" },
            { Icon: PackageCheck, label: "Premium Safe Packaging" },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <Icon className="h-6 w-6 text-[#C9972D]" />
              <span className="font-body text-[11px] sm:text-xs font-semibold tracking-wide uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular categories ──────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center mb-10">
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-3">
            Popular categories
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
            Try one of these
          </h2>
        </div>
        <div
          className="
            flex sm:grid sm:grid-cols-5
            overflow-x-auto sm:overflow-visible
            snap-x snap-mandatory sm:snap-none
            gap-5 sm:gap-6 lg:gap-8
            -mx-4 sm:mx-0 px-4 sm:px-0
            pb-2 sm:pb-0
            [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
          "
        >
          {POPULAR_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${cat.slug}`}
              className="group snap-start shrink-0 sm:shrink basis-[28%] sm:basis-auto min-w-[112px] sm:min-w-0 flex flex-col items-center gap-3"
            >
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden bg-white border-2 border-[#1B3A2D]/10 group-hover:border-[#C9972D] group-hover:shadow-md group-hover:shadow-[#C9972D]/30 transition-all">
                <Image src={cat.img} alt={cat.name} fill sizes="(max-width: 640px) 80px, 112px" className="object-cover" />
              </div>
              <span className="font-body text-[12px] sm:text-sm font-bold text-[#1B3A2D] group-hover:text-[#C9972D] transition-colors text-center leading-tight whitespace-nowrap">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured products ───────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-white border-y border-[#1B3A2D]/8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-2">
                  You may also like
                </p>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B3A2D]">
                  Fresh from our kitchen
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden sm:inline-flex items-center gap-1.5 font-body text-xs font-semibold tracking-wider uppercase text-[#1B3A2D]/60 hover:text-[#1B3A2D] transition-colors"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
