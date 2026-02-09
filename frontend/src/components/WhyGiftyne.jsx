import { motion } from "framer-motion";

const values = [
  {
    icon: "https://giftyne.com/wp-content/uploads/2025/08/craft-1.png",
    title: "Hand-Illustrated Designs",
    description: "Every pattern is lovingly hand-illustrated, making each sheet a tiny work of art.",
  },
  {
    icon: "https://giftyne.com/wp-content/uploads/2025/08/india.png",
    title: "Made with Love in India",
    description: "Proudly crafted in India, supporting local artisans and traditional craftsmanship.",
  },
  {
    icon: "https://giftyne.com/wp-content/uploads/2025/08/recycle.png",
    title: "Sustainable Materials",
    description: "Recyclable inks and eco-friendly materials — because the planet deserves a gift too.",
  },
  {
    icon: "https://giftyne.com/wp-content/uploads/2025/08/pencil-and-ruler-1.png",
    title: "Custom Bulk Orders",
    description: "Need something special? We offer customization for corporate and bulk gift orders.",
  },
];

const WhyGiftyne = () => {
  return (
    <section id="why-giftyne" data-testid="why-giftyne-section" className="py-28 bg-giftyne-bg relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "url('https://www.transparenttextures.com/patterns/cream-paper.png')",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <img
                src="https://giftyne.com/wp-content/uploads/2025/08/Frame-37519.jpeg"
                alt="Why choose Giftyne"
                className="w-full h-[400px] lg:h-[520px] object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-4 lg:-right-8 bg-giftyne-terra text-white rounded-2xl p-5 shadow-xl max-w-[200px]">
              <p className="font-heading text-3xl font-bold">100%</p>
              <p className="font-body text-sm mt-1 text-white/80">Handmade with care</p>
            </div>
          </motion.div>

          {/* Right - Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="font-accent text-lg text-giftyne-sage -rotate-2 inline-block mb-3">
                why choose us
              </span>
              <h2 className="font-heading text-4xl md:text-5xl font-semibold text-giftyne-text tracking-tight mb-4">
                Why Giftyne?
              </h2>
              <p className="font-body text-base text-giftyne-text/60 leading-relaxed mb-10 max-w-md">
                At Giftyne, we believe the outside matters just as much as what's inside. Every creation is a labor of love.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((item, i) => (
                <motion.div
                  key={item.title}
                  data-testid={`value-card-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-white rounded-xl p-5 hover:shadow-md transition-shadow duration-300"
                  style={{ boxShadow: "0 2px 12px -2px rgba(198, 108, 73, 0.06)" }}
                >
                  <div className="w-12 h-12 bg-giftyne-muted rounded-xl flex items-center justify-center mb-4">
                    <img src={item.icon} alt={item.title} className="w-6 h-6 object-contain" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-giftyne-text mb-2">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-giftyne-text/50 leading-relaxed">
                    {item.description}
                  </p>
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
