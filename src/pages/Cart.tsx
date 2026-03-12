import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import CartItemComponent from "@/components/CartItemComponent";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, subtotal } = useCart();
  const shipping = subtotal > 0 ? (subtotal > 1500 ? 0 : 99) : 0;
  const total = subtotal + shipping;

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-secondary mb-8"
        >
          Your Cart
        </motion.h1>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <ShoppingBag className="h-16 w-16 text-muted mx-auto mb-4" />
            <p className="font-body text-lg text-muted-foreground mb-6">Your cart is empty</p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-gold-dark">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {items.map((item) => (
                <CartItemComponent key={`${item.product.id}-${item.weight}`} item={item} />
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                {shipping === 0 && subtotal > 0 && (
                  <p className="text-xs text-pistachio">🎉 Free shipping on orders above ₹1,500!</p>
                )}
                <div className="border-t border-border pt-3 flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span className="text-primary">₹{total}</span>
                </div>
              </div>
              <Button asChild className="w-full mt-6 bg-primary text-primary-foreground hover:bg-gold-dark py-5">
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
