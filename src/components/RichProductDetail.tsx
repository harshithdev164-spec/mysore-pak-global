import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, Truck, ShieldCheck, Sparkles, HeartHandshake, PackageCheck,
  Clock, Award, Leaf, Quote,
} from "lucide-react";
import type { Product } from "@/data/products";
import ProductActions from "@/components/ProductActions";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import RichProductFaq from "@/components/RichProductFaq";
import RichProductReviews from "@/components/RichProductReviews";

export interface SeoContent {
  h2?: string;
  intro?: string;
  taste_profile?: string;
  best_use?: string;
  delivery_trust?: string;
  faqs?: { q: string; a: string }[];
  reviews?: string[];
}

interface Props {
  product: Product;
  related: Product[];
  content: SeoContent;
}

// Long-form PDP driven by products.seo_content. Any product row with a
// populated seo_content column gets this layout automatically via the branch
// in app/products/[slug]/page.tsx. Products with NULL seo_content still see
// the simple two-column PDP that was there before.
export default function RichProductDetail({ product, related, content }: Props) {
  return (
    <div className="min-h-screen bg-[#FBF7F0]">
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
          <div className="lg:sticky lg:top-28 space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFF6E6] to-[#FBF7F0] shadow-xl shadow-[#1B3A2D]/8 border border-[#1B3A2D]/6">
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
              {product.badge && (
                <span className="absolute top-4 left-4 z-20 bg-[#1B3A2D] text-[#C9972D] text-[10px] font-body font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md">
                  {product.badge}
                </span>
              )}
            </div>
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

          <div>
            <ProductActions product={product} />
          </div>
        </div>
      </section>

      {/* ── SEO H2 + Product introduction ─────────────────────── */}
      {(content.h2 || content.intro) && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          {content.h2 && (
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B3A2D] leading-tight mb-5 text-center">
              {content.h2}
            </h2>
          )}
          {content.intro && (
            <p className="font-body text-[15px] sm:text-base text-[#1B3A2D]/75 leading-relaxed text-center max-w-3xl mx-auto">
              {content.intro}
            </p>
          )}
        </section>
      )}

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

      {/* ── Taste / Best Use / Delivery three-card grid ───────── */}
      {(content.taste_profile || content.best_use || content.delivery_trust) && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid md:grid-cols-3 gap-5">
            {content.taste_profile && (
              <InfoCard
                eyebrow="Taste Profile"
                title="How it tastes"
                body={content.taste_profile}
              />
            )}
            {content.best_use && (
              <InfoCard
                eyebrow="Best Use"
                title="When to pick this"
                body={content.best_use}
              />
            )}
            {content.delivery_trust && (
              <InfoCard
                eyebrow="Freshness"
                title="How it reaches you"
                body={content.delivery_trust}
              />
            )}
          </div>
        </section>
      )}

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
              { Icon: Award,          title: "Quality Assurance",     body: "Every batch is sample-tasted before it leaves the kitchen." },
              { Icon: ShieldCheck,    title: "Purity in Every Bite",  body: "Only A2 cow ghee, sieved gram flour and unrefined sugar." },
              { Icon: HeartHandshake, title: "Crafting Authenticity", body: "Hand-stirred in copper kadhais by two generations of cooks." },
              { Icon: Truck,          title: "Excellence in Delivery",body: "Pan-India in 5–7 days. Bengaluru in 3–4. Packed to arrive fresh." },
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
      {content.faqs && content.faqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-10">
            <p className="font-body text-xs font-bold tracking-[0.2em] uppercase text-[#C9972D] mb-3">
              Frequently Asked
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
              Questions, answered.
            </h2>
          </div>
          <RichProductFaq faqs={content.faqs} />
        </section>
      )}

      {/* ── Magazine-style pull quote (uses first review) ─────── */}
      {content.reviews && content.reviews[0] && (
        <section className="relative bg-[#1B3A2D] overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 60% 70% at 50% 50%, #C9972D22 0%, transparent 70%)" }}
            aria-hidden
          />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
            <Quote className="absolute top-10 left-4 sm:left-10 h-24 w-24 sm:h-40 sm:w-40 text-[#C9972D]/10" strokeWidth={1} aria-hidden />
            <p className="relative font-heading italic text-2xl sm:text-3xl lg:text-4xl text-[#FBF7F0] leading-snug max-w-3xl mx-auto">
              &ldquo;{content.reviews[0]}&rdquo;
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <span className="block h-px w-8 bg-[#C9972D]/40" />
              <p className="font-body text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#C9972D]">
                Verified Buyer
              </p>
              <span className="block h-px w-8 bg-[#C9972D]/40" />
            </div>
          </div>
        </section>
      )}

      {/* ── Customer reviews ─────────────────────────────────── */}
      {content.reviews && content.reviews.length > 0 && (
        <RichProductReviews reviews={content.reviews} productName={product.name} />
      )}

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
                  More from {product.category || "our sweets"}
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

function InfoCard({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
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
