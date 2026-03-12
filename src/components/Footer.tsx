import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-secondary text-secondary-foreground">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <h3 className="font-heading text-2xl font-bold mb-4">
            World of <span className="text-primary">Mysore Pak</span>
          </h3>
          <p className="text-secondary-foreground/70 font-body text-sm leading-relaxed max-w-md">
            Preserving the heritage of Mysore Pak with authentic flavors, pure ghee, and traditional recipes — bringing Mysuru's sweetness to the world.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-primary">Quick Links</h4>
          <ul className="space-y-2">
            {[
              { label: "Home", to: "/" },
              { label: "Our Story", to: "/our-story" },
              { label: "Shop", to: "/shop" },
              { label: "Cart", to: "/cart" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-secondary-foreground/60 hover:text-primary transition-colors text-sm">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-primary">Contact</h4>
          <ul className="space-y-2 text-sm text-secondary-foreground/60">
            <li>Mysuru, Karnataka, India</li>
            <li>info@worldofmysorepak.com</li>
            <li>+91 98765 43210</li>
          </ul>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center">
        <p className="text-secondary-foreground/40 text-xs">
          © {new Date().getFullYear()} World of Mysore Pak. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
