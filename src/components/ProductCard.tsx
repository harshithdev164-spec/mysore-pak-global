"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Plus, Minus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  /** Pass true for above-the-fold cards (first 4–6) to load eagerly */
  priority?: boolean;
}

// Rendered via portal directly into <body> so it is never clipped by
// ancestor overflow:hidden or transform (common with Framer Motion sections).
function WeightSheet({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { items, addItem, updateQuantity } = useCart();
  const weights = product.weights ?? [];

  const content = (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        style={{ zIndex: 9999 }}
        className="fixed bottom-0 left-0 right-0 bg-[#FBF7F0] rounded-t-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#1B3A2D]/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1B3A2D]/8">
          <div className="flex items-center gap-3">
            {product.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#1B3A2D]/10"
              />
            )}
            <div>
              <p className="font-heading text-sm font-bold text-[#1B3A2D] leading-tight">
                {product.name}
              </p>
              <p className="font-body text-[11px] text-[#1B3A2D]/50 mt-0.5">
                Select weight
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1B3A2D]/8 flex items-center justify-center text-[#1B3A2D]/60 hover:bg-[#1B3A2D]/15 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Weight rows — no scroll, fully visible */}
        <div
          className="px-4 py-4 space-y-2.5"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
        >
          {weights.map((w) => {
            const qty =
              items.find(
                (i) => i.product.id === product.id && i.weight === w.label
              )?.quantity ?? 0;

            const handleAdd = (e: React.MouseEvent) => {
              e.stopPropagation();
              addItem(product, w.label, w.price);
              toast.success(`${product.name} added to cart`, {
                description: w.label,
                duration: 1500,
              });
            };

            const handleDecrement = (e: React.MouseEvent) => {
              e.stopPropagation();
              updateQuantity(product.id, w.label, qty - 1);
            };

            return (
              <div
                key={w.label}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
                  qty > 0
                    ? "border-[#C9972D]/50 bg-[#FFFBF2]"
                    : "border-[#1B3A2D]/10 bg-white"
                }`}
              >
                <div>
                  <p className="font-body text-sm font-semibold text-[#1B3A2D]">
                    {w.label}
                  </p>
                  <p className="font-body text-xs font-bold text-[#C9972D]">
                    ₹{w.price}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {qty > 0 ? (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={handleDecrement}
                        className="w-8 h-8 rounded-full border-2 border-[#1B3A2D]/20 flex items-center justify-center text-[#1B3A2D] hover:border-[#1B3A2D]/50 transition-colors"
                        aria-label="Remove one"
                      >
                        <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </motion.button>
                      <motion.span
                        key={qty}
                        initial={{ scale: 0.7 }}
                        animate={{ scale: 1 }}
                        className="w-7 text-center font-body text-sm font-bold text-[#1B3A2D]"
                      >
                        {qty}
                      </motion.span>
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={handleAdd}
                        className="w-8 h-8 rounded-full bg-[#1B3A2D] flex items-center justify-center shadow-sm hover:bg-[#2D5A3D] transition-colors"
                        aria-label="Add one"
                      >
                        <Plus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={handleAdd}
                      className="w-8 h-8 rounded-full bg-[#1B3A2D] flex items-center justify-center shadow-sm hover:bg-[#2D5A3D] transition-colors"
                      aria-label="Add to cart"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                    </motion.button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );

  return createPortal(
    <AnimatePresence>{content}</AnimatePresence>,
    document.body
  );
}

const ProductCard = ({ product, priority = false }: ProductCardProps) => {
  const [showSheet, setShowSheet] = useState(false);

  const isNamkeenNonKhakara = product.category?.toLowerCase() === "namkeens";

  const defaultWeight =
    product.weights?.find((w) => w.label.includes("250")) ??
    product.weights?.[0];

  const handlePlusClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultWeight) return;
    setShowSheet(true);
    document.body.classList.add("sheet-open");
  };

  const handleCloseSheet = () => {
    setShowSheet(false);
    document.body.classList.remove("sheet-open");
  };

  return (
    <>
      {showSheet && defaultWeight && (
        <WeightSheet product={product} onClose={handleCloseSheet} />
      )}

      <div className="group relative">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="relative overflow-hidden rounded-2xl bg-white border border-border/50 transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-[#2D5A3D]/10 group-hover:-translate-y-1 transition-transform">
            {/* Image */}
            <div className="aspect-square overflow-hidden relative">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  priority={priority}
                  className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                    isNamkeenNonKhakara ? "object-bottom" : "object-center"
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-amber-50 flex items-center justify-center">
                  <span className="text-gray-300 text-4xl font-bold">MP</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B3A2D]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
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
              {defaultWeight && (
                <p className="font-body text-[11px] text-[#1B3A2D]/45 mt-0.5">
                  {defaultWeight.label}
                </p>
              )}
              <div className="mt-2 pr-10">
                <p className="font-body text-lg font-bold text-[#C9972D]">
                  ₹{defaultWeight?.price ?? product.price}
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* + button outside <Link> to avoid button-inside-anchor */}
        <motion.button
          onClick={handlePlusClick}
          disabled={!defaultWeight}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 bg-[#1B3A2D] text-[#FBF7F0] w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#2D5A3D] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed z-10"
          aria-label="Add to cart"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
        </motion.button>
      </div>
    </>
  );
};

export default ProductCard;
