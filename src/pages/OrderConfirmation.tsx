import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const OrderConfirmation = () => {
  const orderId = `WMP-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-pistachio/20 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="h-10 w-10 text-pistachio" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-heading text-3xl sm:text-4xl font-bold text-secondary mb-4"
        >
          Your Mysore Pak is on its way!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-body text-muted-foreground mb-8"
        >
          Thank you for your order. You'll receive a confirmation email shortly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-xl p-6 mb-8 text-left space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono font-medium text-foreground">{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Delivery</span>
            <span className="font-medium text-foreground flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              3-5 Business Days
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button asChild className="bg-primary text-primary-foreground hover:bg-gold-dark px-8 py-5">
            <Link to="/shop">
              Continue Shopping
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
