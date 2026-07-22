export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import GiftHampers from "@/views/GiftHampers";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Gift Hampers Coming Soon - World of Mysore Pak",
  description:
    "Premium gift hampers for Diwali, weddings and corporate gifting from World of Mysore Pak — hand-packed in Mysuru, delivered pan-India. Join the waitlist for launch updates.",
  alternates: { canonical: "/gift-hampers" },
  openGraph: {
    title: "Gift Hampers Coming Soon - World of Mysore Pak",
    description:
      "Premium gift hampers for Diwali, weddings and corporate gifting from World of Mysore Pak. Join the waitlist for launch updates.",
    url: "https://www.worldofmysorepak.com/gift-hampers",
    type: "website",
  },
};

export default function GiftHampersPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Gift Hampers" },
        ]}
      />
      <GiftHampers />
    </>
  );
}
