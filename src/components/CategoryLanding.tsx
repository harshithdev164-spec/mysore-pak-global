import Link from "next/link";
import Image from "next/image";
import {
  Sparkles, Leaf, Clock, PackageCheck, Truck, ShieldCheck, HeartHandshake, Award, ChevronRight,
} from "lucide-react";
import type { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";

export interface CategoryConfig {
  slug: string;
  name: string;
  eyebrow: string;
  headline: string;
  subline: string;
  heroImage: string;
}

interface Props {
  config: CategoryConfig;
  products: Product[];
}

// Single-purpose ad landing page for a category. Built to convert: bold hero,
// trust strip, product grid, why-us, footer CTA. Isolated from the main site
// nav — only reachable via direct URL (no internal links, noindex'd in meta)
// so paid ad traffic lands on a focused page that doesn't compete with /shop.
export default function CategoryLanding({ config, products }: Props) {
  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: config.name },
        ]}
      />

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#1B3A2D]">
        {/* Backdrop image with overlay */}
        <div className="absolute inset-0">
          <Image
            src={config.heroImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-30"
            priority
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(110deg, rgba(27,58,45,0.92) 0%, rgba(27,58,45,0.78) 55%, rgba(27,58,45,0.45) 100%)" }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <span className="inline-block font-body text-[11px] font-bold tracking-[0.3em] uppercase text-[#C9972D] mb-5">
              {config.eyebrow}
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FBF7F0] leading-[1.05] mb-6">
              {config.headline}
            </h1>
            <p className="font-body text-base sm:text-lg text-[#FBF7F0]/75 leading-relaxed mb-10 max-w-xl">
              {config.subline}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#products"
                className="inline-flex items-center gap-2 px-7 py-4 bg-[#C9972D] text-[#1B3A2D] font-body text-sm font-bold uppercase tracking-wider rounded-full hover:bg-[#b8862a] transition-colors shadow-lg shadow-[#C9972D]/30"
              >
                Shop {config.name}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/916364895293"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-4 border border-[#FBF7F0]/30 text-[#FBF7F0] font-body text-sm font-bold uppercase tracking-wider rounded-full hover:bg-[#FBF7F0]/10 transition-colors"
              >
                Order on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ────────────────────────────────────── */}
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

      {/* ── Products grid — every active product in this category ── */}
      <section id="products" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-3">
            The full {config.name.toLowerCase()} collection
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
            Pick your favourite
          </h2>
          {products.length > 0 && (
            <p className="font-body text-sm text-[#1B3A2D]/55 mt-3">
              {products.length} product{products.length === 1 ? "" : "s"} available
            </p>
          )}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center font-body text-sm text-[#1B3A2D]/50">
            New {config.name} arrivals coming soon. Message us on WhatsApp for the latest stock.
          </p>
        )}
      </section>

      {/* ── Why World of Mysore Pak ─────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-3">
            Why us
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D] leading-tight">
            Old-world craft. New-world delivery.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { Icon: Award,          title: "Royal Recipes",      body: "Hand-passed kitchen secrets from the original 1935 Mysuru Palace tradition." },
            { Icon: ShieldCheck,    title: "Pure Ingredients",   body: "Only A2 cow ghee, sieved gram flour and unrefined sugar — nothing else." },
            { Icon: HeartHandshake, title: "Made by Family",     body: "Hand-stirred in copper kadhais by the same family of cooks for two generations." },
            { Icon: Truck,          title: "Pan-India Delivery", body: "5–7 days nationwide, 3–4 in Bengaluru. Packed to arrive fresh and box-perfect." },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#1B3A2D]/8 flex items-center justify-center mx-auto mb-4">
                <Icon className="h-6 w-6 text-[#1B3A2D]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#1B3A2D] mb-2">{title}</h3>
              <p className="font-body text-sm text-[#1B3A2D]/65 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA strip ─────────────────────────────────── */}
      <section className="bg-[#1B3A2D]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#FBF7F0] mb-4 leading-tight">
            Taste the original.
          </h2>
          <p className="font-body text-base text-[#FBF7F0]/65 max-w-lg mx-auto mb-8">
            Free-ship on orders over &#8377;1,500. Trusted by 10,000+ households across India.
          </p>
          <Link
            href={`/shop?category=${config.slug}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#C9972D] text-[#1B3A2D] font-body text-sm font-bold uppercase tracking-wider rounded-full hover:bg-[#b8862a] transition-colors shadow-lg shadow-[#C9972D]/30"
          >
            Shop {config.name} now
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
