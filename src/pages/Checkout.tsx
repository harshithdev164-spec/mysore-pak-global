import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const shipping = subtotal > 1500 ? 0 : 99;
  const total = subtotal + shipping;

  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", city: "", pincode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    navigate("/order-confirmation");
  };

  if (items.length === 0) {
    navigate("/shop");
    return null;
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-secondary mb-8"
        >
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Shipping Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { name: "name", label: "Full Name", type: "text" },
                  { name: "phone", label: "Phone", type: "tel" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "address", label: "Address", type: "text" },
                  { name: "city", label: "City", type: "text" },
                  { name: "pincode", label: "Pincode", type: "text" },
                ].map((field) => (
                  <div key={field.name} className={field.name === "address" ? "sm:col-span-2" : ""}>
                    <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
                      {field.label}
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping estimate */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">Shipping</h3>
              <p className="text-sm text-muted-foreground">
                Delivered via Delhivery • Estimated delivery in 3-5 business days
              </p>
            </div>

            {/* Payment */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-2">Payment</h3>
              <p className="text-sm text-muted-foreground mb-4">Payment will be processed via Razorpay</p>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-gold-dark py-6 text-base"
              >
                Pay ₹{total} with Razorpay
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-24">
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Order Summary</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={`${item.product.id}-${item.weight}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.name} ({item.weight}) × {item.quantity}
                  </span>
                  <span className="text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span><span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground mt-3 pt-3 border-t border-border">
                  <span>Total</span><span className="text-primary">₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
