import React, { createContext, useContext, useState, useCallback } from "react";
import type { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  weight: string;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, weight: string, price: number) => void;
  removeItem: (productId: string, weight: string) => void;
  updateQuantity: (productId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, weight: string, price: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.weight === weight);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && i.weight === weight
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1, weight, price }];
    });
  }, []);

  const removeItem = useCallback((productId: string, weight: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.weight === weight)));
  }, []);

  const updateQuantity = useCallback((productId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, weight);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.weight === weight ? { ...i, quantity } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
