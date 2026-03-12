import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProductPage = () => {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  const { addItem } = useCart();
  const [selectedWeight, setSelectedWeight] = useState(0);

  if (!product) {
    return (
      <div className="pt-32 text-center min-h-screen">
        <h1 className="font-heading text-2xl text-secondary">Product not found</h1>
        <Link to="/shop" className="text-primary underline mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const currentWeight = product.weights[selectedWeight];

  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-square rounded-xl overflow-hidden bg-card"
          >
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            {product.badge && (
              <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full w-fit mb-3">
                {product.badge}
              </span>
            )}
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-secondary mb-2">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? "text-primary" : "text-muted"}`}>★</span>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            <p className="font-heading text-3xl font-bold text-primary mb-6">₹{currentWeight.price}</p>

            <div className="mb-6">
              <p className="text-sm font-medium text-foreground mb-3">Weight</p>
              <div className="flex gap-3">
                {product.weights.map((w, i) => (
                  <button
                    key={w.label}
                    onClick={() => setSelectedWeight(i)}
                    className={`px-5 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      selectedWeight === i
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <Button
                onClick={() => addItem(product, currentWeight.label, currentWeight.price)}
                className="flex-1 bg-primary text-primary-foreground hover:bg-gold-dark py-6"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button asChild className="flex-1 bg-secondary text-secondary-foreground hover:bg-cocoa-light py-6">
                <Link to="/cart">Buy Now</Link>
              </Button>
            </div>

            <Tabs defaultValue="description" className="mt-auto">
              <TabsList className="bg-muted w-full justify-start">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="storage">Storage</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="text-sm text-muted-foreground leading-relaxed pt-4">
                {product.description}
              </TabsContent>
              <TabsContent value="ingredients" className="text-sm text-muted-foreground leading-relaxed pt-4">
                {product.ingredients}
              </TabsContent>
              <TabsContent value="storage" className="text-sm text-muted-foreground leading-relaxed pt-4">
                {product.storage}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
