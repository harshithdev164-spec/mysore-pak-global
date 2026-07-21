"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Faq {
  q: string;
  a: string;
}

// Reusable FAQ accordion for any product page. Takes FAQs from
// products.seo_content.faqs (JSONB), first item opens by default.
export default function RichProductFaq({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <div className="space-y-3">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={`${i}-${f.q}`}
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
