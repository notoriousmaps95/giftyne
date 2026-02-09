import { motion } from "framer-motion";
import { Mail, Instagram, Facebook, MapPin, Phone, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer id="footer" data-testid="footer-section" className="bg-giftyne-text text-white relative overflow-hidden">
      {/* Newsletter */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8"
          >
            <div className="text-center lg:text-left">
              <span className="font-accent text-base text-giftyne-terra inline-block mb-1">stay connected</span>
              <h3 className="font-heading text-2xl md:text-3xl font-bold tracking-tight mb-1">
                Stay in the Loop
              </h3>
              <p className="font-body text-xs text-white/35 max-w-md">
                New designs, exclusive offers, and gifting inspiration — straight to your inbox.
              </p>
            </div>
            <div className="flex w-full max-w-md">
              <input
                data-testid="newsletter-email-input"
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-white/8 border border-white/12 rounded-l-full px-6 py-3 font-body text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-giftyne-terra/50 transition-colors"
              />
              <button
                data-testid="newsletter-subscribe-btn"
                className="bg-giftyne-terra text-white font-body font-semibold text-sm px-6 py-3 rounded-r-full hover:bg-giftyne-terra/90 transition-colors flex items-center gap-2"
              >
                Subscribe
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-heading text-xl font-bold text-white">Giftyne</span>
            <p className="font-body text-xs text-white/30 mt-3 leading-relaxed max-w-xs">
              Wrapping moments in magic with hand-illustrated papers &amp; handmade crochet creations.
            </p>
            <div className="flex gap-2 mt-4">
              <a
                href="#"
                data-testid="social-instagram"
                className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center hover:bg-giftyne-terra transition-colors"
              >
                <Instagram size={14} />
              </a>
              <a
                href="#"
                data-testid="social-facebook"
                className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center hover:bg-giftyne-terra transition-colors"
              >
                <Facebook size={14} />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-body text-[11px] font-semibold text-white/60 mb-4 tracking-widest uppercase">
              Collections
            </h4>
            <ul className="space-y-2">
              {["Wrapping Paper", "Crochet Flowers", "Crochet Bouquets", "Soft Toys", "Keychains"].map((item) => (
                <li key={item}>
                  <a href="#" className="font-body text-xs text-white/30 hover:text-giftyne-terra transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-body text-[11px] font-semibold text-white/60 mb-4 tracking-widest uppercase">
              Company
            </h4>
            <ul className="space-y-2">
              {["About Us", "Contact", "Privacy Policy", "Shipping Policy", "Return Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="font-body text-xs text-white/30 hover:text-giftyne-terra transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-[11px] font-semibold text-white/60 mb-4 tracking-widest uppercase">
              Get in Touch
            </h4>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <MapPin size={12} className="text-giftyne-terra mt-0.5 shrink-0" />
                <p className="font-body text-xs text-white/30">India</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-giftyne-terra shrink-0" />
                <a href="mailto:hello@giftyne.com" className="font-body text-xs text-white/30 hover:text-giftyne-terra transition-colors">
                  hello@giftyne.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-giftyne-terra shrink-0" />
                <p className="font-body text-xs text-white/30">+91 XXXXX XXXXX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Trust */}
        <div className="mt-10 pt-6 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} Giftyne. All rights reserved. Made with love in India.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-body text-[10px] text-white/15 uppercase tracking-wider">Secure payments</span>
            <div className="flex items-center gap-2">
              {["Visa", "Mastercard", "UPI", "COD"].map((m) => (
                <span key={m} className="font-body text-[10px] text-white/25 bg-white/5 px-2.5 py-1 rounded">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
