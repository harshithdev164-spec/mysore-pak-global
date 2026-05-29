"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  location: string;
  text: string;
  rating: number;
}

const TestimonialCard = ({ name, location, text, rating }: TestimonialCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="relative bg-white rounded-2xl p-6 sm:p-8 border border-border/30 hover:shadow-xl hover:shadow-[#2D5A3D]/5 transition-all duration-500 group"
  >
    {/* Quote icon */}
    <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-[#1B3A2D] flex items-center justify-center shadow-lg">
      <Quote className="w-3.5 h-3.5 text-[#C9972D]" />
    </div>

    {/* Stars */}
    <div className="flex gap-1 mb-4 mt-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating
              ? "text-[#C9972D] fill-[#C9972D]"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
    </div>

    {/* Quote */}
    <p className="font-body text-foreground/70 text-sm leading-relaxed mb-6">
      &ldquo;{text}&rdquo;
    </p>

    {/* Author */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1B3A2D] to-[#2D5A3D] flex items-center justify-center">
        <span className="font-heading text-[#C9972D] font-bold text-sm">
          {name.charAt(0)}
        </span>
      </div>
      <div>
        <p className="font-heading text-sm font-bold text-[#1B3A2D]">{name}</p>
        <p className="text-xs text-muted-foreground font-body">{location}</p>
      </div>
    </div>

    {/* Decorative corner */}
    <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden rounded-br-2xl">
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#2D5A3D]/5 to-transparent" />
    </div>
  </motion.div>
);

export default TestimonialCard;
