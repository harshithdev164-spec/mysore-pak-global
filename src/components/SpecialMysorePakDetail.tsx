import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, Truck, ShieldCheck, Leaf, Award, Sparkles, HeartHandshake,
  PackageCheck, Clock, Quote,
} from "lucide-react";
import type { Product } from "@/data/products";
import ProductActions from "@/components/ProductActions";
import ProductCard from "@/components/ProductCard";
import SpecialMysorePakFaq from "@/components/SpecialMysorePakFaq";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductReviews from "@/components/ProductReviews";

interface Props {
  product: Product;
  related: Product[];
}

// Custom long-form product page inspired by anandsweets.in/products/mysore-pak.
// Sections (top → bottom): breadcrumb, hero, 4-USP trust strip, Pride of
// Karnataka story, taste/storage/ingredients three-card grid, "Quality that
// delights" four-value grid, FAQ accordion, magazine-style pull quote,
// customer reviews, related products. Designed for the "Spl Mysore Pak" SKU
// as a trial — if the team likes it, lift the layout to every product.
export default function SpecialMysorePakDetail({ product, related }: Props) {
  return (
    <div className="min-h-screen bg-[#FBF7F0]">
      {/* ── Breadcrumb (with JSON-LD for SERPs) ─────────────── */}
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.name },
        ]}
      />


      {/* ── Hero: gallery | actions ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Gallery (single image with subtle thumbnail strip placeholder) */}
          <div className="lg:sticky lg:top-28 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFF6E6] to-[#FBF7F0] shadow-xl shadow-[#1B3A2D]/8 border border-[#1B3A2D]/6">
              {/* Soft radial glow behind the product so it pops off the page */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 70% 60% at 50% 50%, #C9972D22 0%, transparent 70%)" }}
                aria-hidden
              />
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover relative z-10"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                  <span className="text-gray-300 text-6xl font-bold">MP</span>
                </div>
              )}
              <span className="absolute top-4 left-4 z-20 bg-[#1B3A2D] text-[#C9972D] text-[10px] font-body font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                Pride of Karnataka
              </span>
            </div>
            {/* Static thumbnail strip — same hero image, mimics Anand layout */}
            <div className="hidden sm:flex gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`relative aspect-square w-20 rounded-xl overflow-hidden border-2 ${
                    i === 0 ? "border-[#C9972D]" : "border-transparent opacity-60"
                  }`}
                >
                  {product.image && (
                    <Image src={product.image} alt="" fill sizes="80px" className="object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <ProductActions product={product} />
          </div>
        </div>
      </section>

      {/* ── Trust strip ───────────────────────────────────────── */}
      <section className="bg-[#1B3A2D] text-[#FBF7F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { Icon: Sparkles,     label: "Freshly Made to Order" },
            { Icon: Leaf,         label: "Preservative-Free" },
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

      {/* ── Pride of Karnataka story ──────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#1B3A2D]/5 order-2 lg:order-1">
            {product.image && (
              <Image
                src={product.image}
                alt="Spl Mysore Pak heritage"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="order-1 lg:order-2">
            <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-3">
              Pride of Karnataka
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D] leading-tight mb-6">
              A royal sweet, perfected for today.
            </h2>
            <p className="font-body text-[15px] text-[#1B3A2D]/75 leading-relaxed mb-4">
              First crafted in 1935 inside the kitchens of the Mysore Palace, Mysore Pak was born
              from a moment of inspiration — Kakasura Madappa, the royal cook of Maharaja
              Krishnaraja Wadiyar IV, reduced gram flour, sugar and pure ghee into a golden,
              melt-in-the-mouth slab. The Maharaja named it after his beloved city.
            </p>
            <p className="font-body text-[15px] text-[#1B3A2D]/75 leading-relaxed">
              Our <em>Spl Mysore Pak</em> stays faithful to that recipe — slow-cooked in copper
              kadhais with aged cow ghee, sieved gram flour and a single ribbon of cardamom — but
              softer, richer, and lighter than the traditional kind. It&apos;s the version we
              reserve for celebrations.
            </p>
          </div>
        </div>
      </section>

      {/* ── Taste / Storage / Ingredients three-card grid ─────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          <InfoCard
            eyebrow="Taste & Occasion"
            title="Soft, ghee-rich, festive"
            body="Best served slightly warm with a tumbler of filter coffee, or boxed as a Diwali, Sankranti or wedding gift. Its melt-in-mouth texture makes it a favourite even with elders."
          />
          <InfoCard
            eyebrow="Shelf Life & Storage"
            title="60 days, room temperature"
            body={product.storage || "Store in a cool, dry place away from direct sunlight. Reseal the box after each use. No refrigeration needed."}
          />
          <InfoCard
            eyebrow="Ingredients"
            title="What goes in"
            body={product.ingredients || "Ghee, sugar, gram flour, cardamom, permissible food colour. Contains dairy. Manufactured in a facility that processes other allergens."}
          />
        </div>
      </section>

      {/* ── Quality that delights — four-value grid ───────────── */}
      <section className="bg-white border-y border-[#1B3A2D]/8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-3">
              Why World of Mysore Pak
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D] leading-tight">
              Quality that delights, in every bite.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                Icon: Award,
                title: "Quality Assurance",
                body: "Every batch is sample-tasted before it leaves the kitchen.",
              },
              {
                Icon: ShieldCheck,
                title: "Purity in Every Bite",
                body: "Only A2 cow ghee, sieved gram flour and unrefined sugar — nothing else.",
              },
              {
                Icon: HeartHandshake,
                title: "Crafting Authenticity",
                body: "Hand-stirred in copper kadhais by the same family of cooks for two generations.",
              },
              {
                Icon: Truck,
                title: "Excellence in Delivery",
                body: "Pan-India shipping within 5–7 days. Bengaluru in 3–4. Packed to arrive fresh.",
              },
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
        </div>
      </section>

      {/* ── FAQ accordion ─────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-10">
          <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-3">
            Frequently Asked
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
            Questions, answered.
          </h2>
        </div>
        <SpecialMysorePakFaq />
      </section>

      {/* ── Magazine-style pull quote ────────────────────────── */}
      <section className="relative bg-[#1B3A2D] overflow-hidden">
        {/* Subtle radial accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, #C9972D22 0%, transparent 70%)" }}
          aria-hidden
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          {/* Giant decorative quote mark sitting behind the text */}
          <Quote
            className="absolute top-10 left-4 sm:left-10 h-24 w-24 sm:h-40 sm:w-40 text-[#C9972D]/10"
            strokeWidth={1}
            aria-hidden
          />
          <p className="relative font-heading italic text-2xl sm:text-3xl lg:text-4xl text-[#FBF7F0] leading-snug max-w-3xl mx-auto">
            &ldquo;Born and raised in Mysuru — I&apos;ve eaten Mysore Pak from every shop in town.
            This one is the closest to the original 1935 palace recipe I&apos;ve had. Soft,
            ghee-heavy, just the right melt.&rdquo;
          </p>
          {/* Attribution */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="block h-px w-8 bg-[#C9972D]/40" />
            <p className="font-body text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#C9972D]">
              Lakshmi N. &middot; Mysuru &middot; Verified Buyer
            </p>
            <span className="block h-px w-8 bg-[#C9972D]/40" />
          </div>
        </div>
      </section>

      {/* ── Customer reviews ─────────────────────────────────── */}
      <ProductReviews productName={product.name} />

      {/* ── Related products ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="bg-[#FBF7F0] border-t border-[#1B3A2D]/8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-2">
                  You may also like
                </p>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1B3A2D]">
                  More from our Mysore Pak family
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
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

function InfoCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#1B3A2D]/8 p-6 sm:p-7 shadow-sm">
      <p className="font-body text-[10px] font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-2">
        {eyebrow}
      </p>
      <h3 className="font-heading text-lg font-bold text-[#1B3A2D] mb-3 leading-snug">
        {title}
      </h3>
      <p className="font-body text-sm text-[#1B3A2D]/70 leading-relaxed whitespace-pre-line">
        {body}
      </p>
    </div>
  );
}
