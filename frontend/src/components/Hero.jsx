import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const Hero = () => {
  return (
    <section
      data-testid="hero-section"
      className="relative min-h-screen flex items-center overflow-hidden bg-giftyne-bg"
    >
      {/* Subtle paper texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="font-accent text-xl md:text-2xl text-giftyne-sage inline-block -rotate-2 mb-4">
              handcrafted with love
            </span>
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-giftyne-text tracking-tight leading-[1.1] mb-6">
              Wrap Moments
              <br />
              in{" "}
              <span className="text-giftyne-terra italic">Magic</span>
            </h1>
            <p className="font-body text-lg md:text-xl text-giftyne-text/60 leading-relaxed max-w-md mb-10">
              Discover vibrant, whimsical, and elegant gift wrapping papers &amp; handmade crochet creations that make your presents unforgettable.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <a
                href="#categories"
                data-testid="hero-shop-now-btn"
                className="inline-flex items-center gap-2 bg-giftyne-terra text-white font-body font-semibold text-sm px-8 py-4 rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-giftyne-terra focus-visible:ring-offset-2"
              >
                Shop Now
                <ChevronRight size={18} />
              </a>
              <a
                href="#why-giftyne"
                data-testid="hero-learn-more-btn"
                className="inline-flex items-center gap-2 border-2 border-giftyne-sand text-giftyne-text/70 font-body font-medium text-sm px-8 py-4 rounded-full hover:border-giftyne-terra hover:text-giftyne-terra transition-all duration-300"
              >
                Our Story
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-8 mt-14 pt-8 border-t border-giftyne-sand/60">
              <div>
                <p className="font-heading text-3xl font-bold text-giftyne-terra">500+</p>
                <p className="font-body text-xs text-giftyne-text/50 mt-1">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-giftyne-sand" />
              <div>
                <p className="font-heading text-3xl font-bold text-giftyne-terra">4.9</p>
                <p className="font-body text-xs text-giftyne-text/50 mt-1">Average Rating</p>
              </div>
              <div className="w-px h-10 bg-giftyne-sand" />
              <div>
                <p className="font-heading text-3xl font-bold text-giftyne-terra">100%</p>
                <p className="font-body text-xs text-giftyne-text/50 mt-1">Eco-Friendly</p>
              </div>
            </div>
          </motion.div>

          {/* Right - Image collage */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden shadow-lg aspect-[3/4]">
                  <img
                    src="https://giftyne.com/wp-content/uploads/2025/08/Frame-37524.jpeg"
                    alt="Polka gift wrapping paper"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-lg aspect-square">
                  <img
                    src="https://giftyne.com/wp-content/uploads/2025/08/Frame-37217-1.jpeg"
                    alt="Floral gift wrapping paper"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-3xl overflow-hidden shadow-lg aspect-square">
                  <img
                    src="https://giftyne.com/wp-content/uploads/2025/08/Frame-37529-1.jpeg"
                    alt="Stripes gift wrapping paper"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-lg aspect-[3/4]">
                  <img
                    src="https://giftyne.com/wp-content/uploads/2025/08/Frame-37532-1.jpeg"
                    alt="Luxury gift wrapping paper"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Floating decorative badge */}
            <div className="absolute -bottom-4 -left-6 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-giftyne-sage/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🌿</span>
              </div>
              <div>
                <p className="font-body text-xs font-semibold text-giftyne-text">Eco-Friendly</p>
                <p className="font-body text-[10px] text-giftyne-text/50">Recyclable inks & materials</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
