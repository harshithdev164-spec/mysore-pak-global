import { motion } from "framer-motion";

interface TestimonialCardProps {
  name: string;
  location: string;
  text: string;
  rating: number;
}

const TestimonialCard = ({ name, location, text, rating }: TestimonialCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-card border border-border rounded-xl p-6 sm:p-8"
  >
    <div className="flex gap-1 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < rating ? "text-primary" : "text-muted"}`}>★</span>
      ))}
    </div>
    <p className="font-body text-foreground/80 italic leading-relaxed mb-6">"{text}"</p>
    <div>
      <p className="font-heading text-sm font-semibold text-foreground">{name}</p>
      <p className="text-xs text-muted-foreground">{location}</p>
    </div>
  </motion.div>
);

export default TestimonialCard;
