import { motion } from "framer-motion";
import { Mail, Instagram, Facebook, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer id="footer" data-testid="footer-section" className="bg-giftyne-text text-white relative overflow-hidden">
      {/* Newsletter banner */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8"
          >
            <div className="text-center lg:text-left">
              <h3 className="font-heading text-3xl md:text-4xl font-semibold tracking-tight mb-2">
                Stay in the Loop
              </h3>
              <p className="font-body text-sm text-white/50 max-w-md">
                Get early access to new designs, exclusive offers, and gifting inspiration straight to your inbox.
              </p>
            </div>
            <div className="flex w-full max-w-md">
              <input
                data-testid="newsletter-email-input"
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-white/10 border border-white/20 rounded-l-full px-6 py-3.5 font-body text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-giftyne-terra transition-colors"
              />
              <button
                data-testid="newsletter-subscribe-btn"
                className="bg-giftyne-terra text-white font-body font-semibold text-sm px-7 py-3.5 rounded-r-full hover:bg-giftyne-terra/90 transition-colors flex items-center gap-2"
              >
                <Mail size={16} />
                Subscribe
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="font-heading text-2xl font-bold text-giftyne-terra">Giftyne</span>
            <p className="font-body text-sm text-white/40 mt-3 leading-relaxed max-w-xs">
              Wrapping moments in magic with hand-illustrated papers &amp; handmade crochet creations.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="#"
                data-testid="social-instagram"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-giftyne-terra transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                data-testid="social-facebook"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-giftyne-terra transition-colors"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Collections
            </h4>
            <ul className="space-y-2.5">
              {["Wrapping Paper", "Crochet Flowers", "Crochet Bouquets", "Soft Toys", "Keychains"].map((item) => (
                <li key={item}>
                  <a href="#" className="font-body text-sm text-white/40 hover:text-giftyne-terra transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Company
            </h4>
            <ul className="space-y-2.5">
              {["About Us", "Contact", "Privacy Policy", "Shipping Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="font-body text-sm text-white/40 hover:text-giftyne-terra transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-sm font-semibold text-white mb-4 tracking-wide uppercase">
              Get in Touch
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-giftyne-terra mt-1 shrink-0" />
                <p className="font-body text-sm text-white/40">India</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-giftyne-terra shrink-0" />
                <a href="mailto:hello@giftyne.com" className="font-body text-sm text-white/40 hover:text-giftyne-terra transition-colors">
                  hello@giftyne.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-giftyne-terra shrink-0" />
                <p className="font-body text-sm text-white/40">+91 XXXXX XXXXX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Marketplace logos */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="font-body text-xs text-white/30 text-center mb-5">You can also find us on</p>
          <div className="flex items-center justify-center gap-6">
            <img src="https://giftyne.com/wp-content/uploads/2025/08/Frame-37508.png" alt="Marketplace" className="h-8 opacity-50 hover:opacity-80 transition-opacity" />
            <img src="https://giftyne.com/wp-content/uploads/2025/08/Frame-37510.png" alt="Marketplace" className="h-8 opacity-50 hover:opacity-80 transition-opacity" />
            <img src="https://giftyne.com/wp-content/uploads/2025/08/Frame-37508-1.png" alt="Marketplace" className="h-8 opacity-50 hover:opacity-80 transition-opacity" />
            <img src="https://giftyne.com/wp-content/uploads/2025/08/Frame-37510-1.png" alt="Marketplace" className="h-8 opacity-50 hover:opacity-80 transition-opacity" />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="font-body text-xs text-white/25">
            &copy; {new Date().getFullYear()} Giftyne. All rights reserved. Made with love in India.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
