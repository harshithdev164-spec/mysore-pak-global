import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.weights[0].label, product.weights[0].price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-lg bg-card border border-border hover-lift">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          {product.badge && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium">
              {product.badge}
            </Badge>
          )}
          <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/40 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-gold-dark transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
            <span className="bg-background text-foreground p-3 rounded-full">
              <Eye className="h-4 w-4" />
            </span>
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-xs ${i < Math.floor(product.rating) ? "text-primary" : "text-muted"}`}>★</span>
            ))}
            <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
          </div>
          <p className="font-body text-lg font-semibold text-primary">₹{product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
