"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useStockUpdates } from "@/lib/useStockUpdates";
import type { Product } from "@/data/products";
import { ShieldCheck, Truck, RefreshCw, AlertCircle } from "lucide-react";

interface Props {
  product: Product;
}

export default function ProductActions({ product }: Props) {
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [stockError, setStockError] = useState("");
  const { addItem } = useCart();
  const stocks = useStockUpdates(product.id);
  const router = useRouter();

  const currentWeight = product.weights[selectedWeight];
  const price = currentWeight?.price ?? product.price;
  const stockQuantity = currentWeight?.stock_quantity ?? 0;
  const liveStock = stocks[currentWeight?.id ?? ""] ?? stockQuantity;
  const outOfStock = liveStock <= 0;

  const handleAddToCart = () => {
    if (outOfStock) {
      setStockError("This variant is out of stock");
      setTimeout(() => setStockError(""), 3000);
      return;
    }
    addItem(product, currentWeight?.label ?? "", price);
  };

  // Buy Now: skip the cart drawer entirely — add this variant and jump
  // straight to /checkout. Customers asked for one-tap purchase.
  const handleBuyNow = () => {
    if (outOfStock) {
      setStockError("This variant is out of stock");
      setTimeout(() => setStockError(""), 3000);
      return;
    }
    addItem(product, currentWeight?.label ?? "", price);
    router.push("/checkout");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="flex flex-col"
    >
      {/* Badge */}
      {product.badge && (
        <span className="inline-block bg-[#1B3A2D] text-[#C9972D] text-[10px] font-body font-bold uppercase tracking-wider px-3 py-1.5 rounded-full w-fit mb-4">
          {product.badge}
        </span>
      )}

      {/* Name */}
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D] leading-tight mb-1">
        {product.name}
      </h1>
      <p className="font-body text-sm text-[#1B3A2D]/50 mb-5 tracking-wide">
        {product.category}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-3 mb-7">
        <span className="font-body text-3xl font-bold text-[#C9972D]">
          ₹{price}
        </span>
        {product.originalPrice && product.originalPrice > price && (
          <span className="font-body text-lg text-[#1B3A2D]/30 line-through">
            ₹{product.originalPrice}
          </span>
        )}
      </div>

      {/* Weight selector */}
      {product.weights.length > 0 && (
        <div className="mb-7">
          <p className="font-body text-xs font-semibold tracking-widest uppercase text-[#1B3A2D]/50 mb-3">
            Choose Weight
          </p>
          <div className="flex flex-wrap gap-2.5">
            {product.weights.map((w, i) => {
              const wStock = stocks[w.id] ?? w.stock_quantity;
              const isOutOfStock = wStock <= 0;
              return (
                <button
                  key={w.label}
                  onClick={() => {
                    if (!isOutOfStock) setSelectedWeight(i);
                  }}
                  disabled={isOutOfStock}
                  className={`relative px-5 py-2.5 rounded-full border font-body text-sm font-semibold transition-all duration-200 ${
                    selectedWeight === i && !isOutOfStock
                      ? "border-[#1B3A2D] bg-[#1B3A2D] text-[#FBF7F0] shadow-md"
                      : isOutOfStock
                      ? "border-red-200 bg-red-50 text-red-400 opacity-50 cursor-not-allowed"
                      : "border-[#1B3A2D]/20 text-[#1B3A2D]/70 hover:border-[#1B3A2D]/50 hover:text-[#1B3A2D]"
                  }`}
                >
                  <span>{w.label}</span>
                  {selectedWeight === i && !isOutOfStock && (
                    <motion.span
                      layoutId="weight-pill"
                      className="absolute inset-0 rounded-full bg-[#1B3A2D] -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className={`block font-body text-[10px] font-medium mt-0.5 ${
                      selectedWeight === i && !isOutOfStock ? "text-[#C9972D]" : "text-[#1B3A2D]/40"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : `₹${w.price}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Status */}
      {outOfStock && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-body text-sm text-red-700">This variant is currently out of stock</span>
        </div>
      )}

      {stockError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-body text-sm text-red-700">{stockError}</span>
        </div>
      )}

      {!outOfStock && currentWeight && (
        <p className="font-body text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-6">
          ✓ {liveStock} in stock
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-8">
        <motion.button
          whileHover={!outOfStock ? { scale: 1.02 } : {}}
          whileTap={!outOfStock ? { scale: 0.97 } : {}}
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={`flex-1 flex items-center justify-center gap-2.5 font-body text-sm font-bold uppercase tracking-wider py-4 rounded-2xl transition-colors shadow-lg ${
            outOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-300/20"
              : "bg-[#1B3A2D] text-[#FBF7F0] hover:bg-[#2D5A3D] shadow-[#1B3A2D]/20"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/cart icon.png" alt="" className="h-5 w-5 object-contain brightness-0 invert" />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </motion.button>
        <motion.div whileHover={!outOfStock ? { scale: 1.02 } : {}} whileTap={!outOfStock ? { scale: 0.97 } : {}} className="flex-1">
          <button
            onClick={handleBuyNow}
            disabled={outOfStock}
            className={`flex items-center justify-center w-full font-body text-sm font-bold uppercase tracking-wider py-4 rounded-2xl transition-colors shadow-lg ${
              outOfStock
                ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-gray-300/20"
                : "bg-[#C9972D] text-[#1B3A2D] hover:bg-[#b8862a] shadow-[#C9972D]/20"
            }`}
          >
            {outOfStock ? "Out of Stock" : "Buy Now"}
          </button>
        </motion.div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center gap-4 py-4 border-t border-[#1B3A2D]/8 mb-6">
        <div className="flex items-center gap-1.5 text-[#1B3A2D]/60">
          <Truck className="w-4 h-4" />
          <span className="font-body text-[11px] font-medium">Pan India Delivery</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#1B3A2D]/60">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-body text-[11px] font-medium">100% Pure Ghee</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#1B3A2D]/60">
          <RefreshCw className="w-4 h-4" />
          <span className="font-body text-[11px] font-medium">Fresh Daily</span>
        </div>
      </div>

      {/* Info tabs — custom styled */}
      <InfoTabs product={product} />
    </motion.div>
  );
}

function InfoTabs({ product }: { product: Product }) {
  const tabs = [
    { key: "description", label: "Description", content: product.description },
    { key: "ingredients", label: "Ingredients", content: product.ingredients },
    { key: "storage", label: "Storage", content: product.storage },
  ].filter((t) => t.content);

  const [active, setActive] = useState(tabs[0]?.key ?? "");

  if (!tabs.length) return null;

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-0 border-b border-[#1B3A2D]/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`relative px-4 py-2.5 font-body text-xs font-semibold tracking-wider uppercase transition-colors duration-200 ${
              active === t.key ? "text-[#1B3A2D]" : "text-[#1B3A2D]/40 hover:text-[#1B3A2D]/70"
            }`}
          >
            {t.label}
            {active === t.key && (
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9972D] rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="pt-4">
        {tabs.map((t) =>
          active === t.key ? (
            <motion.p
              key={t.key}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="font-body text-sm text-[#1B3A2D]/70 leading-relaxed"
            >
              {t.content}
            </motion.p>
          ) : null
        )}
      </div>
    </div>
  );
}
