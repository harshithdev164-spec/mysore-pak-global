"use client";

import { motion } from "framer-motion";
import { Leaf, ShieldCheck, Heart, Truck, Award, Clock } from "lucide-react";

const badges = [
  { icon: Leaf, label: "100% Vegetarian", sub: "Pure veg recipes" },
  { icon: ShieldCheck, label: "No Preservatives", sub: "All natural" },
  { icon: Heart, label: "Hand-Crafted", sub: "Made with love" },
  { icon: Award, label: "Premium Ghee", sub: "Finest quality" },
  { icon: Clock, label: "Freshly Made", sub: "Made to order" },
  { icon: Truck, label: "Pan-India Delivery", sub: "Ships nationwide" },
];

const TrustBadges = () => {
  return (
    <div className="bg-gradient-to-r from-[#2D5A3D] via-[#3A7250] to-[#2D5A3D] py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 group-hover:bg-white/20 transition-colors duration-300">
                <badge.icon className="w-5 h-5 text-[#C9972D]" />
              </div>
              <p className="font-heading text-[10px] sm:text-xs font-semibold text-[#FBF7F0] tracking-wide">
                {badge.label}
              </p>
              <p className="font-body text-[8px] sm:text-[10px] text-[#FBF7F0]/50 mt-0.5 hidden sm:block">
                {badge.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
