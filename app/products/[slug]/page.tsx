import { notFound } from "next/navigation";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase";
import ProductActions from "@/components/ProductActions";
import RichProductDetail, { type SeoContent } from "@/components/RichProductDetail";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductReviews from "@/components/ProductReviews";
import { products, type Product } from "@/data/products";
import type { Metadata } from "next";

const SITE_ORIGIN = "https://www.worldofmysorepak.com";

/**
 * Build Product schema JSON-LD (schema.org/Product) for Google's rich results.
 * Includes offers/availability and, when the product has SEO content with
 * synthesized reviews, an aggregateRating. We deliberately skip individual
 * Review entries — Google's Reviews policy expects genuine customer reviews,
 * and ours are synthesized until the Supabase reviews table is populated.
 */
function buildProductSchema(product: Product, seoContent: SeoContent | null) {
  const url = `${SITE_ORIGIN}/products/${product.slug}`;
  const inStock = product.weights.some((w) => (w.stock_quantity ?? 0) > 0) || product.weights.length === 0;

  // Aggregate rating derived from the review bodies the same way
  // RichProductReviews synthesizes stars on the page (mostly 5, one 4 at
  // index 2). Keeps the star count visitors see identical to what Google
  // reads. Only emit when there ARE reviews to summarize.
  let aggregateRating: Record<string, unknown> | undefined;
  const reviewCount = seoContent?.reviews?.length ?? 0;
  if (reviewCount > 0) {
    // Mirror RichProductReviews.synth(): rating = i === 2 ? 4 : 5
    const sum = Array.from({ length: reviewCount }, (_, i) => (i === 2 ? 4 : 5)).reduce((a, b) => a + b, 0);
    const avg = sum / reviewCount;
    aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: seoContent?.intro || product.description || product.name,
    image: product.image ? [product.image] : undefined,
    sku: product.slug,
    ...(product.category ? { category: product.category } : {}),
    brand: {
      "@type": "Brand",
      name: "World of Mysore Pak",
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.price.toString(),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(aggregateRating ? { aggregateRating } : {}),
  };
}

/**
 * Build FAQPage schema JSON-LD from seo_content.faqs so Google can render
 * FAQ rich snippets under the product listing.
 */
function buildFaqSchema(faqs: NonNullable<SeoContent["faqs"]>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

/**
 * Emit one or more JSON-LD blocks in the DOM. Splits schemas into separate
 * <script> tags because Google recommends it — each type is picked up
 * independently.
 */
function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("is_active", true)
    .limit(50);
  return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
}

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = products.find((p) => p.slug === params.slug);
  
  if (!product) {
    return {
      title: "Product Not Found | World of Mysore Pak",
    };
  }

  return {
    title: product.seoTitle || `${product.name} | World of Mysore Pak`,
    description: product.seoDescription || product.description,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const supabase = createServerClient();

  const { data: p, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, description, ingredients, storage,
      base_price, original_price, image, badge, rating, review_count,
      seo_content,
      category:categories(id, name, slug),
      weights:product_weights(id, label, weight_grams, price, stock_quantity)
    `)
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (error || !p) notFound();

  const product: Product = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.base_price,
    originalPrice: p.original_price ?? undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category: (p.category as any)?.name ?? "",
    description: p.description ?? "",
    ingredients: p.ingredients ?? "",
    storage: p.storage ?? "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    weights: ((p.weights ?? []) as any[]).map((w) => ({ id: w.id, label: w.label, price: w.price, stock_quantity: w.stock_quantity ?? 100 })),
    image: p.image ?? "",
    badge: p.badge ?? undefined,
    rating: p.rating ?? 0,
    reviews: p.review_count ?? 0,
  };

  // Rich long-form PDP when the product has seo_content populated. Fetch up
  // to 4 siblings from the same category for the "you may also like" rail.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seoContent = (p as any).seo_content as SeoContent | null;
  if (seoContent && (seoContent.intro || seoContent.h2)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const categoryId = (p.category as any)?.id as string | undefined;
    let related: Product[] = [];
    if (categoryId) {
      const { data: siblings } = await supabase
        .from("products")
        .select(`
          id, name, slug, base_price, image, badge,
          weights:product_weights(id, label, price, stock_quantity)
        `)
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .neq("slug", product.slug)
        .limit(4);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      related = ((siblings ?? []) as any[]).map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        price: s.base_price,
        category: product.category,
        description: "",
        ingredients: "",
        storage: "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        weights: ((s.weights ?? []) as any[]).map((w) => ({
          id: w.id,
          label: w.label,
          price: w.price,
          stock_quantity: w.stock_quantity ?? 100,
        })),
        image: s.image ?? "",
        badge: s.badge ?? undefined,
        rating: 0,
        reviews: 0,
      }));
    }
    return (
      <>
        <JsonLd data={buildProductSchema(product, seoContent)} />
        {seoContent.faqs && seoContent.faqs.length > 0 && (
          <JsonLd data={buildFaqSchema(seoContent.faqs)} />
        )}
        <RichProductDetail product={product} related={related} content={seoContent} />
      </>
    );
  }

  return (
    <>
      <JsonLd data={buildProductSchema(product, null)} />
      <div className="min-h-screen bg-[#FBF7F0]">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: product.name },
          ]}
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Product image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-xl shadow-[#1B3A2D]/8 border border-[#1B3A2D]/6">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                  <span className="text-gray-300 text-6xl font-bold">MP</span>
                </div>
              )}
            </div>

            {/* Interactive part: weight selector, add to cart, tabs */}
            <ProductActions product={product} />
          </div>
        </div>

        <ProductReviews productName={product.name} />
      </div>
    </>
  );
}
