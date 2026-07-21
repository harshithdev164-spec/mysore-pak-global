export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Franchise from "@/views/Franchise";

export const metadata: Metadata = {
  title: "Own a World of Mysore Pak Franchise - Mysuru Sweet Shop Opportunity",
  description:
    "Bring authentic Mysuru sweets to your city. Low-investment franchise model with training, supply-chain support, marketing collateral and territory protection from World of Mysore Pak.",
  alternates: { canonical: "/franchise" },
  openGraph: {
    title: "Own a World of Mysore Pak Franchise - Mysuru Sweet Shop Opportunity",
    description:
      "Bring authentic Mysuru sweets to your city. Low-investment franchise model with training, supply-chain support, and marketing collateral from World of Mysore Pak.",
    url: "https://www.worldofmysorepak.com/franchise",
    type: "website",
  },
};

export default function FranchisePage() {
  return <Franchise />;
}
