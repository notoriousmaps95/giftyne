import { motion } from "framer-motion";
import { Package, Users, Award, Heart } from "lucide-react";

const stats = [
  { icon: Package, value: "2,500+", label: "Orders Delivered", color: "text-giftyne-terra bg-giftyne-terra/8" },
  { icon: Users, value: "500+", label: "Happy Customers", color: "text-giftyne-sage bg-giftyne-sage/8" },
  { icon: Award, value: "15+", label: "Skilled Artisans", color: "text-amber-600 bg-amber-50" },
  { icon: Heart, value: "4.9/5", label: "Customer Rating", color: "text-pink-500 bg-pink-50" },
];

const CredibilityStats = () => (
  <section data-testid="credibility-stats-section" className="py-16 bg-giftyne-text relative overflow-hidden">
    {/* Subtle pattern */}
    <div className="absolute inset-0 opacity-[0.03]" style={{
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
    }} />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-10">
        <span className="font-accent text-base text-giftyne-terra inline-block mb-1">
          trusted by thousands
        </span>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-tight">
          Numbers That Speak for Themselves
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            data-testid={`credibility-stat-${i}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/8 rounded-2xl p-5 text-center hover:bg-white/8 transition-colors"
          >
            <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3`}>
              <stat.icon size={20} strokeWidth={1.5} />
            </div>
            <p className="font-heading text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="font-body text-xs text-white/40">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CredibilityStats;
