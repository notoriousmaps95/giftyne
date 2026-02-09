import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, Search, Heart, User } from "lucide-react";
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
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-giftyne-bg/95 backdrop-blur-lg shadow-[0_1px_0_0_rgba(230,213,184,0.5)] py-3"
          : "bg-giftyne-bg py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-3 w-[180px]">
          <button
            data-testid="mobile-menu-btn"
            className="lg:hidden p-2 -ml-2 rounded-full hover:bg-giftyne-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} className="text-giftyne-text" /> : <Menu size={20} className="text-giftyne-text" />}
          </button>
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 2).map((link) => (
              <a
                key={link.label}
                href={link.href}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className="font-body text-[13px] font-medium text-giftyne-text/60 hover:text-giftyne-terra tracking-wide uppercase transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-giftyne-terra transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
        </div>

        {/* Center: Logo */}
        <a href="#" data-testid="navbar-logo" className="flex flex-col items-center">
          <span className="font-heading text-3xl md:text-[34px] font-bold text-giftyne-text tracking-tight leading-none">
            Giftyne
          </span>
          <span className="font-accent text-[11px] text-giftyne-terra/80 -mt-0.5 tracking-wider">
            wrap moments in magic
          </span>
        </a>

        {/* Right: Nav + Icons */}
        <div className="flex items-center gap-3 w-[180px] justify-end">
          <div className="hidden lg:flex items-center gap-8 mr-6">
            {navLinks.slice(2).map((link) => (
              <a
                key={link.label}
                href={link.href}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className="font-body text-[13px] font-medium text-giftyne-text/60 hover:text-giftyne-terra tracking-wide uppercase transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-giftyne-terra transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
          <button data-testid="search-btn" className="p-2 rounded-full hover:bg-giftyne-muted transition-colors">
            <Search size={18} className="text-giftyne-text/60" />
          </button>
          <button data-testid="wishlist-nav-btn" className="p-2 rounded-full hover:bg-giftyne-muted transition-colors hidden sm:flex">
            <Heart size={18} className="text-giftyne-text/60" />
          </button>
          <button data-testid="cart-btn" className="p-2 rounded-full hover:bg-giftyne-muted transition-colors relative">
            <ShoppingBag size={18} className="text-giftyne-text/60" />
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-giftyne-terra text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              0
            </span>
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
            className="lg:hidden bg-giftyne-bg border-t border-giftyne-sand/40 overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="font-body text-sm font-medium text-giftyne-text/70 hover:text-giftyne-terra transition-colors py-3 border-b border-giftyne-sand/20 last:border-0"
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
