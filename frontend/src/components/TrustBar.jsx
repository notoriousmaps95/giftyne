import { Shield, Truck, RotateCcw, Clock, CreditCard, Leaf } from "lucide-react";

const badges = [
  { icon: Shield, label: "100% Secure Payments", sublabel: "SSL Encrypted" },
  { icon: Truck, label: "Free Shipping", sublabel: "On orders above ₹999" },
  { icon: Clock, label: "Fast Dispatch", sublabel: "Within 48 hours" },
  { icon: RotateCcw, label: "Easy Returns", sublabel: "7-day return policy" },
  { icon: Leaf, label: "Eco-Friendly", sublabel: "Recyclable materials" },
  { icon: CreditCard, label: "COD Available", sublabel: "Pay on delivery" },
];

const TrustBar = () => (
  <section data-testid="trust-bar-section" className="py-8 bg-white border-y border-giftyne-sand/30">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {badges.map((badge, i) => (
          <div
            key={badge.label}
            data-testid={`trust-badge-${i}`}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-giftyne-sage/8 flex items-center justify-center shrink-0 group-hover:bg-giftyne-sage/15 transition-colors">
              <badge.icon size={18} className="text-giftyne-sage" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-body text-xs font-semibold text-giftyne-text leading-tight">{badge.label}</p>
              <p className="font-body text-[10px] text-giftyne-text/35">{badge.sublabel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBar;
