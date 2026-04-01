"use client";

import { motion } from "framer-motion";
import { ArrowRight, Heart, Sparkles, TrendingUp, Users, Leaf, Gift, Star, ChefHat, Package, Megaphone, Headphones } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const PERKS = [
  { icon: TrendingUp,  label: "Career Growth",     desc: "Clear progression paths and annual performance reviews" },
  { icon: Heart,       label: "Health Benefits",    desc: "Comprehensive health coverage for you and your family" },
  { icon: Gift,        label: "Sweet Perks",        desc: "Monthly hampers, festival bonuses, and employee discounts" },
  { icon: Leaf,        label: "Work-Life Balance",  desc: "Flexible hours and a generous paid-leave policy" },
  { icon: Users,       label: "Family Culture",     desc: "A tight-knit team where every voice matters" },
  { icon: Sparkles,    label: "Learning Budget",    desc: "Annual L&D allowance to keep growing your skills" },
];

const OPENINGS = [
  {
    icon: ChefHat,
    role: "Cashier",
    dept: "Sales",
    type: "Full-time · On-site",
    location: "Mysuru, Karnataka",
    openings: 6,
    desc: "Handle transactions, manage cash register, and provide excellent customer service at our retail counter.",
  },
  {
    icon: Headphones,
    role: "Guest Relationship Manager",
    dept: "Customer Experience",
    type: "Full-time · On-site",
    location: "Mysuru, Karnataka",
    openings: 3,
    gender: "Female",
    desc: "Build lasting relationships with our guests, ensure satisfaction, and create memorable experiences at every touchpoint.",
  },
  {
    icon: Package,
    role: "Counter Sales Executive",
    dept: "Sales",
    type: "Full-time · On-site",
    location: "Mysuru, Karnataka",
    openings: 20,
    desc: "Drive sales, educate customers about our products, and represent World of Mysore Pak with pride.",
  },
  {
    icon: TrendingUp,
    role: "Accounts Executive",
    dept: "Finance",
    type: "Full-time · On-site",
    location: "Mysuru, Karnataka",
    openings: 2,
    desc: "Manage financial records, process transactions, and support our accounting operations with accuracy.",
  },
  {
    icon: Gift,
    role: "Office Boy",
    dept: "Administration",
    type: "Full-time · On-site",
    location: "Mysuru, Karnataka",
    openings: 1,
    desc: "Provide essential support to our office operations, maintain facilities, and ensure smooth day-to-day functioning.",
  },
  {
    icon: Leaf,
    role: "House Keeping Staff",
    dept: "Facilities",
    type: "Full-time · On-site",
    location: "Mysuru, Karnataka",
    openings: 15,
    desc: "Maintain cleanliness and hygiene standards across our facility, ensuring a pleasant environment for all.",
  },
];

export default function Careers() {
  return (
    <main className="bg-[#FBF7F0] min-h-screen">

      {/* ── HERO ── */}
      <section className="relative bg-[#1B3A2D] overflow-hidden pt-28 pb-24 sm:pt-36 sm:pb-32">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #C9972D 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Gold glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9972D]/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-body text-xs uppercase tracking-[0.35em] text-[#C9972D] font-semibold block mb-4"
          >
            Careers at World of Mysore Pak
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-4xl sm:text-6xl font-bold text-[#FBF7F0] leading-tight mb-6"
          >
            Be Part of<br />
            <span className="text-[#C9972D]">Something Sweet</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-[#FBF7F0]/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10"
          >
            We&apos;re not just making sweets — we&apos;re preserving a legacy born in the royal kitchens of Mysuru.
            Join a team that blends 200 years of tradition with modern ambition.
          </motion.p>

          <motion.a
            href="#openings"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-[#C9972D] text-[#1B3A2D] font-body font-bold text-sm px-8 py-4 rounded-full hover:bg-[#b8862a] transition-colors"
          >
            See Open Roles <ArrowRight className="w-4 h-4" />
          </motion.a>
        </div>
      </section>

      {/* ── STAT STRIP ── */}
      <section className="bg-white border-y border-[#1B3A2D]/6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 divide-x divide-[#1B3A2D]/6">
            {[
              { number: "50+", label: "Team Members" },
              { number: "8+", label: "Years of Craft" },
              { number: "4.9★", label: "Glassdoor Rating" },
            ].map((stat) => (
              <div key={stat.label} className="py-8 text-center">
                <p className="font-heading text-2xl sm:text-3xl font-bold text-[#C9972D]">{stat.number}</p>
                <p className="font-body text-xs text-[#1B3A2D]/50 mt-1 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERKS ── */}
      <section className="py-20 sm:py-24 bg-[#FBF7F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold block mb-2">Why Join Us</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
              More Than Just a <span className="text-[#C9972D]">Job</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map((perk, i) => (
              <motion.div
                key={perk.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex gap-4 p-6 rounded-2xl bg-white border border-[#1B3A2D]/6 hover:border-[#C9972D]/30 hover:shadow-md transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#C9972D]/10 flex items-center justify-center flex-shrink-0">
                  <perk.icon className="w-5 h-5 text-[#C9972D]" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-[#1B3A2D] mb-1">{perk.label}</h3>
                  <p className="font-body text-sm text-[#1B3A2D]/50 leading-relaxed">{perk.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OPEN POSITIONS ── */}
      <section id="openings" className="py-20 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold block mb-2">Open Positions</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
              We&apos;re <span className="text-[#C9972D]">Hiring</span>
            </h2>
            <p className="font-body text-sm text-[#1B3A2D]/50 mt-3">Click &quot;Apply Now&quot; to send us your application via email.</p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {OPENINGS.map((job, i) => (
              <motion.div
                key={job.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group bg-[#FBF7F0] rounded-2xl border border-[#1B3A2D]/6 hover:border-[#C9972D]/40 hover:shadow-lg transition-all duration-300 p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                  <div className="flex gap-4 flex-1">
                    <div className="w-11 h-11 rounded-xl bg-[#1B3A2D]/6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <job.icon className="w-5 h-5 text-[#1B3A2D]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-body font-semibold text-[#C9972D] bg-[#C9972D]/10 px-2.5 py-0.5 rounded-full">{job.dept}</span>
                        <span className="text-xs font-body font-semibold text-white bg-[#1B3A2D] px-2.5 py-0.5 rounded-full">{job.openings} Position{job.openings > 1 ? "s" : ""}</span>
                        {job.gender && <span className="text-xs font-body font-semibold text-[#C9972D] bg-[#C9972D]/10 px-2.5 py-0.5 rounded-full">{job.gender}</span>}
                        <span className="text-xs font-body text-[#1B3A2D]/40">{job.type} · {job.location}</span>
                      </div>
                      <h3 className="font-heading text-xl font-bold text-[#1B3A2D] mb-2">{job.role}</h3>
                      <p className="font-body text-sm text-[#1B3A2D]/55 leading-relaxed">{job.desc}</p>
                    </div>
                  </div>
                  <motion.a
                    href={`mailto:support@worldofmysorepak.com?subject=Application for ${encodeURIComponent(job.role)}`}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="self-start sm:self-center flex-shrink-0 inline-flex items-center gap-1.5 bg-[#1B3A2D] text-[#FBF7F0] font-body text-xs font-bold px-5 py-2.5 rounded-full group-hover:bg-[#C9972D] group-hover:text-[#1B3A2D] transition-colors duration-300"
                  >
                    Apply Now <ArrowRight className="w-3.5 h-3.5" />
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* General application CTA */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-10 text-center p-10 rounded-2xl bg-[#1B3A2D]"
          >
            <Star className="w-8 h-8 text-[#C9972D] mx-auto mb-4" />
            <h3 className="font-heading text-xl font-bold text-[#FBF7F0] mb-2">Don&apos;t see your role?</h3>
            <p className="font-body text-sm text-[#FBF7F0]/50 mb-6 max-w-sm mx-auto">
              We love meeting passionate people. Send us your story and we&apos;ll keep you in mind for future openings.
            </p>
            <motion.a
              href="mailto:support@worldofmysorepak.com?subject=Open Application"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-[#C9972D] text-[#1B3A2D] font-body font-bold text-sm px-7 py-3.5 rounded-full hover:bg-[#b8862a] transition-colors"
            >
              Send an Open Application <ArrowRight className="w-4 h-4" />
            </motion.a>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
