"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Gift, Leaf, Cookie, Coffee, Star, Heart, Award } from "lucide-react";

const categoryIcons = [
  { name: "Bestsellers", icon: Star, bgColor: "bg-[#C9972D]/10", iconColor: "text-[#C9972D]", delay: 0 },
  { name: "Traditional", icon: Award, bgColor: "bg-[#2D5A3D]/10", iconColor: "text-[#2D5A3D]", delay: 0.05 },
  { name: "Premium", icon: Sparkles, bgColor: "bg-[#C9972D]/10", iconColor: "text-[#C9972D]", delay: 0.1 },
  { name: "Gift Boxes", icon: Gift, bgColor: "bg-[#2D5A3D]/10", iconColor: "text-[#2D5A3D]", delay: 0.15 },
  { name: "Healthy", icon: Leaf, bgColor: "bg-emerald-50", iconColor: "text-emerald-600", delay: 0.2 },
  { name: "Fusion", icon: Cookie, bgColor: "bg-[#C9972D]/10", iconColor: "text-[#C9972D]", delay: 0.25 },
  { name: "Seasonal", icon: Coffee, bgColor: "bg-[#2D5A3D]/10", iconColor: "text-[#2D5A3D]", delay: 0.3 },
  { name: "Made with Love", icon: Heart, bgColor: "bg-rose-50", iconColor: "text-rose-500", delay: 0.35 },
];

const CategoryIcons = () => {
  return (
    <div className="w-full bg-white/80 backdrop-blur-sm py-6 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-hide pb-2">
          {categoryIcons.map((cat) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: cat.delay }}
            >
              <Link href="/shop" className="flex flex-col items-center gap-2 min-w-[80px] group">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full ${cat.bgColor} flex items-center justify-center transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-[#2D5A3D]/15 border border-transparent group-hover:border-[#2D5A3D]/10`}
                >
                  <cat.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${cat.iconColor} transition-transform duration-300`} />
                </motion.div>
                <span className="font-body text-[10px] sm:text-xs font-medium text-foreground/70 text-center whitespace-nowrap group-hover:text-[#1B3A2D] transition-colors">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryIcons;
