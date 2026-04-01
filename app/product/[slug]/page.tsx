import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { createServerClient } from "@/lib/supabase";
import ProductActions from "@/components/ProductActions";
import type { Product } from "@/data/products";

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

export default async function ProductDetailPage({ params }: PageProps) {
  const supabase = createServerClient();

  const { data: p, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, description, ingredients, storage,
      base_price, original_price, image, badge, rating, review_count,
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
    weights: ((p.weights ?? []) as any[]).map((w) => ({ label: w.label, price: w.price })),
    image: p.image ?? "",
    badge: p.badge ?? undefined,
    rating: p.rating ?? 0,
    reviews: p.review_count ?? 0,
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] pt-28 sm:pt-36">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        {/* Back link */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 font-body text-xs font-semibold tracking-wider uppercase text-[#1B3A2D]/50 hover:text-[#1B3A2D] transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Shop
        </Link>

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
    </div>
  );
}
