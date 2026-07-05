export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Careers from "@/views/Careers";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Careers at World of Mysore Pak - Mysuru Jobs",
  description:
    "Join World of Mysore Pak in Mysuru and build a career with a team preserving royal sweet heritage through tradition and modern ambition.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers at World of Mysore Pak - Mysuru Jobs",
    description:
      "Join World of Mysore Pak in Mysuru and build a career with a team preserving royal sweet heritage through tradition and modern ambition.",
    url: "https://www.worldofmysorepak.com/careers",
    type: "website",
  },
};

export default function CareersPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Careers" },
        ]}
      />
      <Careers />
    </>
  );
}
