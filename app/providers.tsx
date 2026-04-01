"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        {children}
      </CartProvider>
    </TooltipProvider>
  );
}
