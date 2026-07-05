export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import OurStory from "@/views/OurStory";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "The Royal Story of Mysore Pak",
  description:
    "Explore the heritage of Mysore Pak, crafted with pure ghee, besan and sugar, carrying Mysuru's royal sweet legacy to homes across India.",
  alternates: { canonical: "/our-story" },
  openGraph: {
    title: "The Royal Story of Mysore Pak",
    description:
      "Explore the heritage of Mysore Pak, crafted with pure ghee, besan and sugar, carrying Mysuru's royal sweet legacy to homes across India.",
    url: "https://www.worldofmysorepak.com/our-story",
    type: "article",
  },
};

export default function OurStoryPage() {
  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Our Story" },
        ]}
      />
      <OurStory />
    </>
  );
}
