import { motion } from "framer-motion";
import { founders } from "@/data/products";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const timeline = [
  { year: "The Beginning", text: "A dream to preserve and share the authentic taste of Mysore Pak with the world was born in the heart of Mysuru." },
  { year: "The Recipe", text: "After years of research and perfecting traditional recipes with master sweet-makers, the signature World of Mysore Pak formula was created." },
  { year: "The Launch", text: "World of Mysore Pak opened its doors, introducing an immersive sweet experience store and online presence." },
  { year: "Going Global", text: "With innovation in flavors and premium packaging, the brand is now reaching sweet lovers across the globe." },
];

const OurStory = () => (
  <div className="pt-20">
    {/* Hero */}
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary to-cocoa-light" />
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-4"
        >
          Our Heritage
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-cream mb-6"
        >
          A Sweet Legacy from Mysuru
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-body text-cream/70 text-lg max-w-2xl mx-auto"
        >
          World of Mysore Pak was created to preserve the heritage of Mysore Pak and present it to the world with innovation and quality.
        </motion.p>
      </div>
    </section>

    {/* Story */}
    <section className="section-padding">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-16">
          <h2 className="font-heading text-3xl font-bold text-secondary mb-6">Our Journey</h2>
          <p className="font-body text-muted-foreground leading-relaxed">
            Mysore Pak is more than a sweet — it's a cultural icon of Mysuru. Our mission is to honor this legacy while innovating flavors that excite modern palates, using only the purest ghee and finest ingredients.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border sm:-translate-x-px" />
          {timeline.map((item, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ delay: i * 0.15 }}
              className={`relative flex items-start gap-6 mb-12 ${
                i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
              }`}
            >
              <div className="hidden sm:block sm:w-1/2" />
              <div className="absolute left-4 sm:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1.5 mt-2 z-10" />
              <div className="ml-10 sm:ml-0 sm:w-1/2 sm:px-8">
                <p className="font-heading text-sm font-bold text-primary mb-1">{item.year}</p>
                <p className="font-body text-muted-foreground text-sm leading-relaxed">{item.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Founders */}
    <section className="section-padding bg-card">
      <div className="max-w-5xl mx-auto">
        <motion.div {...fadeUp} className="text-center mb-12">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary mb-3">The Visionaries</p>
          <h2 className="font-heading text-3xl font-bold text-secondary">Our Founders</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {founders.map((founder, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ delay: i * 0.15 }}
              className="text-center bg-background rounded-xl p-8 border border-border"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="font-heading text-2xl font-bold text-primary">
                  {founder.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{founder.name}</h3>
              <p className="text-xs text-primary font-medium mb-3">{founder.role}</p>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{founder.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Vision */}
    <section className="section-padding bg-secondary text-secondary-foreground">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div {...fadeUp}>
          <h2 className="font-heading text-3xl font-bold mb-6">Our Vision</h2>
          <p className="font-body text-secondary-foreground/70 leading-relaxed text-lg">
            To build a global sweet experience brand that celebrates the rich culinary heritage of Mysuru, while innovating with modern flavors and sustainable practices. Every piece of Mysore Pak we make carries the warmth, tradition, and love of our city.
          </p>
        </motion.div>
      </div>
    </section>
  </div>
);

export default OurStory;
