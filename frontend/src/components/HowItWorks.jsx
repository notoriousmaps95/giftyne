import { motion } from "framer-motion";
import { Palette, Package, Truck, Gift } from "lucide-react";

const steps = [
  {
    icon: Palette,
    step: "01",
    title: "Choose",
    description: "Browse our curated collections of wrapping papers and crochet creations.",
  },
  {
    icon: Package,
    step: "02",
    title: "Handcraft",
    description: "Each item is lovingly handmade by our artisans with sustainable materials.",
  },
  {
    icon: Truck,
    step: "03",
    title: "Ship",
    description: "Your order is carefully packed in eco-friendly packaging and dispatched within 48hrs.",
  },
  {
    icon: Gift,
    step: "04",
    title: "Delight",
    description: "Unwrap joy! Watch faces light up when they see your beautifully wrapped gift.",
  },
];

const HowItWorks = () => (
  <section data-testid="how-it-works-section" className="py-20 lg:py-28 bg-giftyne-bg relative grain-overlay">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-14">
        <span className="font-accent text-lg text-giftyne-sage inline-block mb-1">
          simple & delightful
        </span>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-giftyne-text tracking-tight">
          How It Works
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative">
        {/* Connecting line */}
        <div className="absolute top-10 left-[12%] right-[12%] h-[1px] bg-giftyne-sand/60 hidden lg:block" />

        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            data-testid={`how-step-${i}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="text-center relative"
          >
            <div className="w-20 h-20 mx-auto mb-5 bg-white rounded-2xl shadow-sm flex items-center justify-center relative border border-giftyne-sand/40">
              <step.icon size={28} className="text-giftyne-terra" strokeWidth={1.5} />
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-giftyne-terra text-white text-[10px] font-body font-bold rounded-full flex items-center justify-center">
                {step.step}
              </span>
            </div>
            <h3 className="font-heading text-lg font-semibold text-giftyne-text mb-2">
              {step.title}
            </h3>
            <p className="font-body text-xs text-giftyne-text/45 leading-relaxed max-w-[180px] mx-auto">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
