import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

const Hero = () => {
  return (
    <section
      data-testid="hero-section"
      className="relative overflow-hidden bg-giftyne-bg grain-overlay"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Left Text - 5 cols */}
          <motion.div
            className="lg:col-span-5 relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-giftyne-sage/10 border border-giftyne-sage/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 bg-giftyne-sage rounded-full animate-pulse" />
              <span className="font-body text-xs font-medium text-giftyne-sage tracking-wide">New Collection 2026</span>
            </div>

            <h1 className="font-heading text-[3.2rem] md:text-[4rem] lg:text-[4.5rem] font-bold text-giftyne-text tracking-tight leading-[1.05] mb-5">
              Wrap
              <br />
              Moments in
              <br />
              <span className="relative inline-block">
                <span className="text-giftyne-terra italic">Magic</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C40 2 100 2 198 8" stroke="#C66C49" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
                </svg>
              </span>
            </h1>

            <p className="font-body text-base text-giftyne-text/50 leading-relaxed max-w-sm mb-8">
              Hand-illustrated wrapping papers &amp; lovingly handcrafted crochet creations. Because the outside should be as special as what&apos;s inside.
            </p>

            <div className="flex flex-wrap gap-3 items-center mb-10">
              <a
                href="#categories"
                data-testid="hero-shop-now-btn"
                className="group inline-flex items-center gap-2 bg-giftyne-terra text-white font-body font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-giftyne-terra/90 hover:shadow-lg hover:shadow-giftyne-terra/20 transition-all duration-300"
              >
                Explore Collections
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#why-giftyne"
                data-testid="hero-learn-more-btn"
                className="inline-flex items-center gap-2 text-giftyne-text/60 font-body font-medium text-sm px-7 py-3.5 rounded-full border border-giftyne-sand hover:border-giftyne-terra/40 hover:text-giftyne-terra transition-all duration-300"
              >
                Our Story
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80",
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80",
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Customer"
                    className="w-8 h-8 rounded-full border-2 border-giftyne-bg object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="font-body text-xs font-semibold text-giftyne-text ml-1">4.9</span>
                </div>
                <p className="font-body text-[11px] text-giftyne-text/40 mt-0.5">from 500+ happy customers</p>
              </div>
            </div>
          </motion.div>

          {/* Right Images - 7 cols */}
          <motion.div
            className="lg:col-span-7 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="grid grid-cols-12 gap-3 lg:gap-4">
              {/* Main large image */}
              <div className="col-span-7 relative">
                <div className="rounded-[2rem] overflow-hidden aspect-[3/4] shadow-2xl shadow-giftyne-terra/10">
                  <img
                    src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=700&q=80"
                    alt="Gift wrapping paper collection"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  />
                </div>
                {/* Floating badge */}
                <motion.div
                  className="absolute -left-4 bottom-12 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 z-10"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="w-10 h-10 bg-giftyne-sage/15 rounded-xl flex items-center justify-center text-lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7D8F69" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <p className="font-body text-xs font-semibold text-giftyne-text">Eco-Friendly</p>
                    <p className="font-body text-[10px] text-giftyne-text/40">Recyclable materials</p>
                  </div>
                </motion.div>
              </div>

              {/* Right column - 2 stacked images */}
              <div className="col-span-5 flex flex-col gap-3 lg:gap-4 pt-10">
                <div className="rounded-[1.5rem] overflow-hidden aspect-square shadow-xl shadow-giftyne-text/5">
                  <img
                    src="https://images.unsplash.com/photo-1512909006721-3d6018887383?w=500&q=80"
                    alt="Wrapped gifts"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  />
                </div>
                <div className="rounded-[1.5rem] overflow-hidden aspect-[4/5] shadow-xl shadow-giftyne-text/5">
                  <img
                    src="https://images.unsplash.com/photo-1543934638-bd2e138430c4?w=500&q=80"
                    alt="Handcrafted crochet creations"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                  />
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 right-12 w-16 h-16 border-2 border-giftyne-sand/40 rounded-full animate-float hidden lg:block" />
            <div className="absolute top-1/3 -right-3 w-8 h-8 bg-giftyne-terra/10 rounded-full animate-float-delayed hidden lg:block" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
