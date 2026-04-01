"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, TrendingUp, Landmark, ChefHat, Package, Megaphone, MapPin, CheckCircle2, Phone, Mail, Star } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const BENEFITS = [
  { icon: Landmark,   title: "Heritage Brand",       desc: "Instant brand recognition backed by 200 years of royal Mysuru legacy — customers trust the name before they taste the sweet." },
  { icon: TrendingUp, title: "Proven Revenue Model",  desc: "A battle-tested business model with strong unit economics, high repeat purchase rates, and festive season spikes." },
  { icon: ChefHat,    title: "Recipe & Training",     desc: "Full access to our secret recipes and a hands-on training programme at our Mysuru production facility." },
  { icon: Package,    title: "Centralised Supply",    desc: "We handle procurement and quality control centrally so you receive consistent, premium products every time." },
  { icon: Megaphone,  title: "Marketing Support",     desc: "National digital campaigns, festive promotions, and ready-made creatives — your marketing is taken care of." },
  { icon: MapPin,     title: "Exclusive Territory",   desc: "Operate with confidence. We grant you exclusive rights within your chosen territory, protecting your market." },
];

const STEPS = [
  { step: "01", title: "Enquire",       desc: "Submit your franchise inquiry with your city, preferred format, and investment capacity." },
  { step: "02", title: "Discovery Call", desc: "Our franchise team connects with you for a detailed walkthrough — no questions are too small." },
  { step: "03", title: "Training & Setup", desc: "Visit Mysuru for hands-on production training. We help you source equipment, design the space, and set up operations." },
  { step: "04", title: "Launch Day",    desc: "Open your doors with full marketing support. We make your launch a celebration." },
];

const TIERS = [
  {
    name: "Express Kiosk",
    area: "100 – 200 sq ft",
    invest: "₹5 – 8 Lakhs",
    roi: "12 – 18 months",
    best: "Malls, food courts, airports",
    highlight: false,
    features: ["Core product range", "Kiosk branding kit", "Basic POS setup", "6-month support"],
  },
  {
    name: "Standard Outlet",
    area: "300 – 500 sq ft",
    invest: "₹15 – 25 Lakhs",
    roi: "18 – 24 months",
    best: "High-street, premium markets",
    highlight: true,
    features: ["Full product range", "Complete interior design", "Digital menu board", "12-month dedicated support", "Social media kit"],
  },
  {
    name: "Flagship Store",
    area: "600 – 1000 sq ft",
    invest: "₹35 – 50 Lakhs",
    roi: "24 – 30 months",
    best: "Tier-1 cities, heritage zones",
    highlight: false,
    features: ["Exclusive & limited editions", "Premium interiors + gifting corner", "In-store experience zone", "Priority support + account manager", "Co-branded national campaigns"],
  },
];

export default function Franchise() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", tier: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Franchise Enquiry — ${form.tier || "General"} — ${form.city}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nCity: ${form.city}\nInterested In: ${form.tier}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:franchise@worldofmysorepak.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <main className="bg-[#FBF7F0] min-h-screen">

      {/* ── HERO ── */}
      <section className="relative bg-[#1B3A2D] overflow-hidden pt-28 pb-24 sm:pt-36 sm:pb-32">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, #C9972D 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-[#C9972D]/10 blur-[140px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="font-body text-xs uppercase tracking-[0.35em] text-[#C9972D] font-semibold block mb-4"
          >
            Franchise Opportunities
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-4xl sm:text-6xl font-bold text-[#FBF7F0] leading-tight mb-6"
          >
            Own a Piece of<br />
            <span className="text-[#C9972D]">India&apos;s Sweetest Legacy</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-body text-[#FBF7F0]/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Partner with World of Mysore Pak and bring the authentic taste of royal Mysuru to your city.
            A heritage brand, a proven model, and a team that backs you every step of the way.
          </motion.p>
          <motion.a
            href="#enquire"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-[#C9972D] text-[#1B3A2D] font-body font-bold text-sm px-8 py-4 rounded-full hover:bg-[#b8862a] transition-colors"
          >
            Apply for a Franchise <ArrowRight className="w-4 h-4" />
          </motion.a>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-white border-y border-[#1B3A2D]/6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#1B3A2D]/6">
            {[
              { number: "15+", label: "Cities Served" },
              { number: "200+", label: "SKUs Available" },
              { number: "98%", label: "Partner Retention" },
              { number: "4.8★", label: "Avg Store Rating" },
            ].map((s) => (
              <div key={s.label} className="py-8 text-center">
                <p className="font-heading text-2xl sm:text-3xl font-bold text-[#C9972D]">{s.number}</p>
                <p className="font-body text-xs text-[#1B3A2D]/50 mt-1 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-20 sm:py-24 bg-[#FBF7F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold block mb-2">Why Partner With Us</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
              Everything You Need to <span className="text-[#C9972D]">Succeed</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-white p-6 rounded-2xl border border-[#1B3A2D]/6 hover:border-[#C9972D]/30 hover:shadow-md transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-[#C9972D]/10 flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-[#C9972D]" />
                </div>
                <h3 className="font-heading text-base font-bold text-[#1B3A2D] mb-2">{b.title}</h3>
                <p className="font-body text-sm text-[#1B3A2D]/50 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold block mb-2">The Process</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
              From Inquiry to <span className="text-[#C9972D]">Opening Day</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-10 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-px bg-gradient-to-r from-transparent via-[#C9972D]/30 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 sm:gap-4">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-[#1B3A2D] border-4 border-[#C9972D]/20 flex items-center justify-center mb-4 relative z-10">
                    <span className="font-heading text-2xl font-bold text-[#C9972D]">{step.step}</span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#1B3A2D] mb-2">{step.title}</h3>
                  <p className="font-body text-sm text-[#1B3A2D]/50 leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INVESTMENT TIERS ── */}
      <section className="py-20 sm:py-24 bg-[#FBF7F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold block mb-2">Investment Models</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#1B3A2D]">
              Choose Your <span className="text-[#C9972D]">Format</span>
            </h2>
            <p className="font-body text-sm text-[#1B3A2D]/50 mt-3">Every model comes with our full training and support ecosystem.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className={`rounded-2xl p-7 border flex flex-col relative overflow-hidden transition-all duration-300 ${
                  tier.highlight
                    ? "bg-[#1B3A2D] border-[#C9972D]/30 shadow-2xl scale-[1.02]"
                    : "bg-white border-[#1B3A2D]/8 hover:border-[#C9972D]/25 hover:shadow-md"
                }`}
              >
                {tier.highlight && (
                  <span className="absolute top-5 right-5 text-[10px] font-body font-bold text-[#1B3A2D] bg-[#C9972D] px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <h3 className={`font-heading text-xl font-bold mb-1 ${tier.highlight ? "text-[#FBF7F0]" : "text-[#1B3A2D]"}`}>{tier.name}</h3>
                <p className={`font-body text-xs mb-5 ${tier.highlight ? "text-[#FBF7F0]/50" : "text-[#1B3A2D]/40"}`}>{tier.best}</p>

                <div className={`rounded-xl p-4 mb-5 ${tier.highlight ? "bg-[#FBF7F0]/5" : "bg-[#FBF7F0]"}`}>
                  <div className="flex justify-between mb-2">
                    <span className={`font-body text-xs ${tier.highlight ? "text-[#FBF7F0]/50" : "text-[#1B3A2D]/40"}`}>Area</span>
                    <span className={`font-body text-xs font-semibold ${tier.highlight ? "text-[#FBF7F0]" : "text-[#1B3A2D]"}`}>{tier.area}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className={`font-body text-xs ${tier.highlight ? "text-[#FBF7F0]/50" : "text-[#1B3A2D]/40"}`}>Investment</span>
                    <span className={`font-body text-sm font-bold ${tier.highlight ? "text-[#C9972D]" : "text-[#C9972D]"}`}>{tier.invest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`font-body text-xs ${tier.highlight ? "text-[#FBF7F0]/50" : "text-[#1B3A2D]/40"}`}>ROI Period</span>
                    <span className={`font-body text-xs font-semibold ${tier.highlight ? "text-[#FBF7F0]" : "text-[#1B3A2D]"}`}>{tier.roi}</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.highlight ? "text-[#C9972D]" : "text-[#1B3A2D]/40"}`} />
                      <span className={`font-body text-sm ${tier.highlight ? "text-[#FBF7F0]/70" : "text-[#1B3A2D]/60"}`}>{f}</span>
                    </li>
                  ))}
                </ul>

                <motion.a
                  href="#enquire"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full text-center font-body font-bold text-sm py-3 rounded-full transition-colors ${
                    tier.highlight
                      ? "bg-[#C9972D] text-[#1B3A2D] hover:bg-[#b8862a]"
                      : "bg-[#1B3A2D] text-[#FBF7F0] hover:bg-[#243f34]"
                  }`}
                >
                  Apply for This Format
                </motion.a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENQUIRY FORM ── */}
      <section id="enquire" className="py-20 sm:py-24 bg-[#1B3A2D]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <Star className="w-8 h-8 text-[#C9972D] mx-auto mb-4" />
            <span className="font-body text-xs uppercase tracking-[0.3em] text-[#C9972D] font-semibold block mb-3">Get Started</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#FBF7F0]">
              Franchise <span className="text-[#C9972D]">Enquiry</span>
            </h2>
            <p className="font-body text-sm text-[#FBF7F0]/50 mt-3">Fill in your details and we&apos;ll get back to you within 48 hours.</p>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-14 px-8 rounded-2xl bg-[#FBF7F0]/5 border border-[#C9972D]/20"
            >
              <CheckCircle2 className="w-14 h-14 text-[#C9972D] mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold text-[#FBF7F0] mb-2">Enquiry Sent!</h3>
              <p className="font-body text-sm text-[#FBF7F0]/50">Our franchise team will reach out to you within 48 hours. Exciting times ahead!</p>
            </motion.div>
          ) : (
            <motion.form
              initial="hidden" whileInView="show" viewport={{ once: true }}
              variants={fadeUp}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs text-[#FBF7F0]/50 uppercase tracking-wider">Full Name *</label>
                  <input
                    name="name" required value={form.name} onChange={handleChange}
                    placeholder="Your name"
                    className="bg-[#FBF7F0]/6 border border-[#FBF7F0]/10 rounded-xl px-4 py-3 font-body text-sm text-[#FBF7F0] placeholder-[#FBF7F0]/30 focus:outline-none focus:border-[#C9972D]/50 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs text-[#FBF7F0]/50 uppercase tracking-wider">Email *</label>
                  <input
                    name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder="your@email.com"
                    className="bg-[#FBF7F0]/6 border border-[#FBF7F0]/10 rounded-xl px-4 py-3 font-body text-sm text-[#FBF7F0] placeholder-[#FBF7F0]/30 focus:outline-none focus:border-[#C9972D]/50 transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs text-[#FBF7F0]/50 uppercase tracking-wider">Phone *</label>
                  <input
                    name="phone" type="tel" required value={form.phone} onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className="bg-[#FBF7F0]/6 border border-[#FBF7F0]/10 rounded-xl px-4 py-3 font-body text-sm text-[#FBF7F0] placeholder-[#FBF7F0]/30 focus:outline-none focus:border-[#C9972D]/50 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-body text-xs text-[#FBF7F0]/50 uppercase tracking-wider">City *</label>
                  <input
                    name="city" required value={form.city} onChange={handleChange}
                    placeholder="Your city"
                    className="bg-[#FBF7F0]/6 border border-[#FBF7F0]/10 rounded-xl px-4 py-3 font-body text-sm text-[#FBF7F0] placeholder-[#FBF7F0]/30 focus:outline-none focus:border-[#C9972D]/50 transition-colors"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs text-[#FBF7F0]/50 uppercase tracking-wider">Interested In</label>
                <select
                  name="tier" value={form.tier} onChange={handleChange}
                  className="bg-[#FBF7F0]/6 border border-[#FBF7F0]/10 rounded-xl px-4 py-3 font-body text-sm text-[#FBF7F0] focus:outline-none focus:border-[#C9972D]/50 transition-colors appearance-none"
                >
                  <option value="" className="bg-[#1B3A2D]">Select a format</option>
                  <option value="Express Kiosk" className="bg-[#1B3A2D]">Express Kiosk (₹5 – 8 Lakhs)</option>
                  <option value="Standard Outlet" className="bg-[#1B3A2D]">Standard Outlet (₹15 – 25 Lakhs)</option>
                  <option value="Flagship Store" className="bg-[#1B3A2D]">Flagship Store (₹35 – 50 Lakhs)</option>
                  <option value="Not sure yet" className="bg-[#1B3A2D]">Not sure yet</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-xs text-[#FBF7F0]/50 uppercase tracking-wider">Message (Optional)</label>
                <textarea
                  name="message" value={form.message} onChange={handleChange}
                  rows={3}
                  placeholder="Tell us a bit about yourself and your vision…"
                  className="bg-[#FBF7F0]/6 border border-[#FBF7F0]/10 rounded-xl px-4 py-3 font-body text-sm text-[#FBF7F0] placeholder-[#FBF7F0]/30 focus:outline-none focus:border-[#C9972D]/50 transition-colors resize-none"
                />
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 w-full bg-[#C9972D] text-[#1B3A2D] font-body font-bold text-sm py-4 rounded-full hover:bg-[#b8862a] transition-colors flex items-center justify-center gap-2"
              >
                Submit Franchise Enquiry <ArrowRight className="w-4 h-4" />
              </motion.button>

              <div className="flex flex-col sm:flex-row gap-4 mt-2 text-center sm:text-left">
                <a href="tel:+916364895255" className="flex items-center justify-center gap-2 font-body text-xs text-[#FBF7F0]/40 hover:text-[#FBF7F0]/70 transition-colors">
                  <Phone className="w-3.5 h-3.5" /> +91 63648 95255 / 63648 95254
                </a>
                <a href="mailto:franchise@worldofmysorepak.com" className="flex items-center justify-center gap-2 font-body text-xs text-[#FBF7F0]/40 hover:text-[#FBF7F0]/70 transition-colors">
                  <Mail className="w-3.5 h-3.5" /> franchise@worldofmysorepak.com
                </a>
              </div>
            </motion.form>
          )}
        </div>
      </section>

    </main>
  );
}
