import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  /** Omit for the current page (final crumb). */
  href?: string;
}

interface Props {
  items: Crumb[];
  /** Override the wrapper classes (padding / max-width). Defaults to a
   *  full-width pill that sits above page content. */
  className?: string;
}

const SITE_ORIGIN = "https://www.worldofmysorepak.com";

// Reusable breadcrumbs:
//  1. Visible <nav> with the trail (ARIA-labelled, current page marked aria-current)
//  2. BreadcrumbList JSON-LD so Google can show the breadcrumb in SERPs
//     (https://developers.google.com/search/docs/appearance/structured-data/breadcrumb)
export default function Breadcrumbs({ items, className }: Props) {
  if (!items.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: c.href.startsWith("http") ? c.href : `${SITE_ORIGIN}${c.href}` } : {}),
    })),
  };

  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className={
          className ??
          "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-2"
        }
      >
        <ol className="flex flex-wrap items-center gap-1.5 font-body text-[11px] sm:text-xs tracking-wider uppercase text-[#1B3A2D]/50">
          {items.map((c, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                {c.href && !isLast ? (
                  <Link
                    href={c.href}
                    className="hover:text-[#1B3A2D] transition-colors"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? "text-[#1B3A2D] font-semibold" : ""}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {c.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="h-3 w-3 text-[#1B3A2D]/30" />}
              </li>
            );
          })}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
