import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Collections", href: "#categories" },
  { label: "About", href: "#why-giftyne" },
  { label: "Contact", href: "#footer" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <a href="#" data-testid="navbar-logo" className="flex items-center gap-2">
          <span className="font-heading text-2xl md:text-3xl font-bold text-giftyne-terra tracking-tight">
            Giftyne
          </span>
        </a>

        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
              className="font-body text-sm font-medium text-giftyne-text/70 hover:text-giftyne-terra transition-colors duration-300 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-giftyne-terra transition-all duration-300 group-hover:w-full rounded-full" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button data-testid="search-btn" className="p-2 rounded-full hover:bg-giftyne-muted transition-colors">
            <Search size={20} className="text-giftyne-text/70" />
          </button>
          <button data-testid="cart-btn" className="p-2 rounded-full hover:bg-giftyne-muted transition-colors relative">
            <ShoppingBag size={20} className="text-giftyne-text/70" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-giftyne-terra text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              0
            </span>
          </button>
          <button
            data-testid="mobile-menu-btn"
            className="md:hidden p-2 rounded-full hover:bg-giftyne-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            data-testid="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-giftyne-sand/50 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-body text-base font-medium text-giftyne-text/80 hover:text-giftyne-terra transition-colors py-2"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
