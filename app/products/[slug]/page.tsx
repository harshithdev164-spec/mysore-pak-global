import { notFound } from "next/navigation";
import Image from "next/image";
import { createServerClient } from "@/lib/supabase";
import ProductActions from "@/components/ProductActions";
import SpecialMysorePakDetail from "@/components/SpecialMysorePakDetail";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductReviews from "@/components/ProductReviews";
import { products, type Product } from "@/data/products";
import type { Metadata } from "next";

// Slugs that opt in to the long-form Anand-style PDP layout. Start with one
// SKU as a trial — if customers convert better here, lift it to all products.
const RICH_PDP_SLUGS = new Set<string>([
  "buy-special-mysore-pak-online",
]);

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

  // Rich Anand-style PDP for opted-in slugs. We fetch up to 4 other Mysore
  // Pak siblings for the "you may also like" rail; if the category lookup
  // returns nothing we just hide the rail rather than fail the page.
  if (RICH_PDP_SLUGS.has(product.slug)) {
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
    return <SpecialMysorePakDetail product={product} related={related} />;
  }

  return (
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
  );
}
