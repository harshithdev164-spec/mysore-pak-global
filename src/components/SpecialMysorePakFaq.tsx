"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS: { q: string; a: string }[] = [
  {
    q: "How is Spl Mysore Pak different from the traditional version?",
    a: "Spl Mysore Pak uses a higher ratio of pure cow ghee to gram flour, which makes the texture softer, lighter and more melt-in-mouth. The traditional version is firmer and has a denser, more grainy bite that some prefer.",
  },
  {
    q: "What is the shelf life and how should I store it?",
    a: "60 days at room temperature, kept in the original sealed box, away from direct sunlight and moisture. No refrigeration needed — refrigerating actually hardens the ghee and changes the texture.",
  },
  {
    q: "Are there any preservatives or artificial flavours?",
    a: "No preservatives, no artificial flavours, no vanaspati. Only ghee, sugar, gram flour, cardamom and a permissible food colour for the signature golden hue.",
  },
  {
    q: "Is it suitable for diabetics or people avoiding sugar?",
    a: "No — Mysore Pak is a traditional sugar-rich sweet and we don't recommend it for diabetics. We do offer a Jaggery Mysore Pak which uses unrefined jaggery instead of refined sugar.",
  },
  {
    q: "How long does delivery take?",
    a: "Bengaluru: 3–4 days. Rest of India: 5–7 days via Delhivery, DTDC or DHL Express depending on serviceability. You'll get a tracking link by SMS and WhatsApp once the order is dispatched.",
  },
  {
    q: "Can I return it if I'm not satisfied?",
    a: "Because Mysore Pak is a perishable food item, we can't accept returns. But if your order arrives damaged or has a quality issue, message us on WhatsApp within 48 hours with a photo and we'll replace it or refund you in full.",
  },
];

export default function SpecialMysorePakFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className="bg-white rounded-2xl border border-[#1B3A2D]/8 overflow-hidden"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4 sm:py-5 hover:bg-[#1B3A2D]/[0.02] transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-heading text-sm sm:text-base font-bold text-[#1B3A2D] leading-snug">
                {f.q}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#1B3A2D]/50 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                <p className="font-body text-sm text-[#1B3A2D]/70 leading-relaxed">{f.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
