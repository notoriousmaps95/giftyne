import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FeaturedCollection = () => {
  return (
    <section data-testid="featured-collection-section" className="py-8 lg:py-12 bg-giftyne-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden bg-giftyne-text"
          style={{ minHeight: "420px" }}
        >
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1512909006721-3d6018887383?w=1200&q=80"
            alt="Crochet collection"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-giftyne-text via-giftyne-text/80 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full min-h-[420px] px-8 md:px-16 lg:px-20 py-16 max-w-xl">
            <span className="font-accent text-lg text-giftyne-terra mb-3 inline-block">
              featured collection
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              Crochet Flower
              <br />
              Bouquets
            </h2>
            <p className="font-body text-sm text-white/50 leading-relaxed mb-8 max-w-sm">
              Each bouquet is handcrafted with love, made to last forever. The perfect gift for someone who deserves flowers that never wilt.
            </p>
            <div>
              <a
                href="#"
                data-testid="featured-collection-cta"
                className="group inline-flex items-center gap-2 bg-white text-giftyne-text font-body font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-giftyne-terra hover:text-white transition-all duration-300"
              >
                Shop the Collection
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Price badge */}
          <div className="absolute top-6 right-6 md:top-10 md:right-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 text-center">
            <p className="font-body text-[10px] text-white/60 uppercase tracking-wider">Starting from</p>
            <p className="font-heading text-2xl font-bold text-white">&#8377;799</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedCollection;
