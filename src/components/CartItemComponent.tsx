"use client";

import { Minus, Plus, X } from "lucide-react";
import type { CartItem as CartItemType } from "@/context/CartContext";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

const CartItemComponent = ({ item }: CartItemProps) => {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      <img
        src={item.product.image}
        alt={item.product.name}
        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-heading text-sm font-semibold text-foreground truncate">{item.product.name}</h4>
        <p className="text-xs text-muted-foreground mt-1">{item.weight}</p>
        <p className="text-sm font-semibold text-primary mt-1">₹{item.price}</p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.product.id, item.weight, item.quantity - 1)}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.product.id, item.weight, item.quantity + 1)}
            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.product.id, item.weight)}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="font-body text-sm font-semibold text-foreground">₹{item.price * item.quantity}</p>
      </div>
    </div>
  );
};

export default CartItemComponent;
