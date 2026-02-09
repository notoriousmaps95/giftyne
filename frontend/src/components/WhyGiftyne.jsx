import { motion } from "framer-motion";
import { Leaf, Heart, Globe, PenTool } from "lucide-react";

const values = [
  {
    icon: PenTool,
    title: "Hand-Illustrated Designs",
    description: "Every pattern is lovingly hand-illustrated, making each sheet a tiny work of art.",
    color: "bg-giftyne-terra/10 text-giftyne-terra",
  },
  {
    icon: Globe,
    title: "Made with Love in India",
    description: "Proudly crafted in India, supporting local artisans and traditional craftsmanship.",
    color: "bg-blue-50 text-blue-500",
  },
  {
    icon: Leaf,
    title: "Sustainable Materials",
    description: "Recyclable inks and eco-friendly materials — because the planet deserves a gift too.",
    color: "bg-giftyne-sage/10 text-giftyne-sage",
  },
  {
    icon: Heart,
    title: "Custom Bulk Orders",
    description: "Need something special? We offer customization for corporate and bulk gift orders.",
    color: "bg-pink-50 text-pink-500",
  },
];

const WhyGiftyne = () => {
  return (
    <section id="why-giftyne" data-testid="why-giftyne-section" className="py-20 lg:py-28 bg-giftyne-muted/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left - Image grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1607469256872-48b65e1eafe0?w=500&q=80"
                  alt="Gift wrapping"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-lg mt-8">
                <img
                  src="https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500&q=80"
                  alt="Crochet crafting"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Floating stat */}
            <motion.div
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-giftyne-terra text-white rounded-2xl px-6 py-4 shadow-xl shadow-giftyne-terra/20 text-center"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="font-heading text-3xl font-bold">100%</p>
              <p className="font-body text-xs text-white/70 mt-0.5">Handmade with care</p>
            </motion.div>
          </motion.div>

          {/* Right - Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="font-accent text-lg text-giftyne-sage inline-block mb-2">
                why choose us
              </span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-giftyne-text tracking-tight mb-3">
                Why Giftyne?
              </h2>
              <p className="font-body text-sm text-giftyne-text/50 leading-relaxed mb-8 max-w-md">
                At Giftyne, we believe the outside matters just as much as what&apos;s inside. Every creation is a labor of love.
              </p>
            </motion.div>

            <div className="space-y-4">
              {values.map((item, i) => (
                <motion.div
                  key={item.title}
                  data-testid={`value-card-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex items-start gap-4 bg-white rounded-xl p-4 hover:shadow-md transition-shadow duration-300 border border-giftyne-sand/20"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm font-semibold text-giftyne-text mb-1">
                      {item.title}
                    </h3>
                    <p className="font-body text-xs text-giftyne-text/45 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyGiftyne;
