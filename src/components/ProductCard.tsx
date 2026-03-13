"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Eye, Star } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-2xl bg-white border border-border/50 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[#2D5A3D]/10 group-hover:-translate-y-1">
          {/* Image — next/image serves WebP/AVIF and resizes per viewport */}
          <div className="aspect-square overflow-hidden relative">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                <span className="text-gray-300 text-4xl font-bold">MP</span>
              </div>
            )}
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A2D]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Rating badge */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3 text-[#C9972D] fill-[#C9972D]" />
              <span className="font-body text-xs font-bold text-[#1B3A2D]">{product.rating}</span>
            </div>

            {/* Quick actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-3 group-hover:translate-y-0">
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-[#1B3A2D] text-[#FBF7F0] p-3.5 rounded-full shadow-xl hover:bg-[#2D5A3D] transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
              </motion.button>
              <motion.span
                whileHover={{ scale: 1.1 }}
                className="bg-white text-[#1B3A2D] p-3.5 rounded-full shadow-xl"
              >
                <Eye className="h-4 w-4" />
              </motion.span>
            </div>
          </div>

          {/* Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-[#1B3A2D] text-[#C9972D] text-[10px] font-body font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
              {product.badge}
            </span>
          )}

          {/* Content */}
          <div className="p-4 sm:p-5">
            <h3 className="font-heading text-sm sm:text-base font-bold text-[#1B3A2D] group-hover:text-[#2D5A3D] transition-colors duration-300 line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? "text-[#C9972D] fill-[#C9972D]"
                      : "text-gray-200 fill-gray-200"
                  }`}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1 font-body">
                ({product.reviews})
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="font-heading text-lg font-bold text-[#C9972D]">
                ₹{product.price}
              </p>
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#1B3A2D] text-[#FBF7F0] font-body text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-2 rounded-full hover:bg-[#2D5A3D] transition-colors"
              >
                Add to Cart
              </motion.button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
